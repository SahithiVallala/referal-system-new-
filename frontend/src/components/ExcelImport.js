import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileSpreadsheet, X, CheckCircle, AlertCircle, Plus, Trash2, Eye, Users } from 'lucide-react';
import API from '../utils/api';

export default function ExcelImport({ onComplete, onClose }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);
  const [imports, setImports] = useState([]);
  const [selectedImport, setSelectedImport] = useState(null);
  const [importContacts, setImportContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const loadImports = async () => {
    try {
      const res = await API.get('/contacts/imports');
      setImports(res.data);
    } catch (err) {
      console.error('Error loading imports:', err);
    }
  };

  React.useEffect(() => {
    loadImports();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) uploadFile(file);
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  const handleViewImport = async (importItem) => {
    setSelectedImport(importItem);
    setLoadingContacts(true);
    try {
      const res = await API.get(`/contacts/imports/${importItem.id}/contacts`);
      setImportContacts(res.data);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const handleDeleteImport = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this import and all its contacts? This cannot be undone.')) return;
    
    try {
      await API.delete(`/contacts/imports/${id}`);
      await loadImports();
      if (selectedImport?.id === id) {
        setSelectedImport(null);
        setImportContacts([]);
      }
      if (onComplete) onComplete();
    } catch (err) {
      alert('Error deleting import: ' + err.message);
    }
  };

  const uploadFile = async (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setResult({ error: 'Please select an Excel file (.xlsx or .xls)' });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await API.post('/contacts/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setResult({
        success: true,
        ...res.data
      });

      // Reload imports from server
      await loadImports();

      setTimeout(() => {
        if (onComplete) onComplete();
        handleClose();
        setResult(null);
      }, 2000);
    } catch (err) {
      setResult({
        error: err.response?.data?.error || err.message
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* Main Import Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative">
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900">Import Contacts</h2>
                    <p className="text-sm text-gray-500">Upload Excel file with employee data</p>
                  </div>
                  {imports.length > 0 && (
                    <button
                      onClick={handleAddMore}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      <Plus className="w-5 h-5" />
                      Add More
                    </button>
                  )}
                </div>

                {imports.length > 0 && (
                  <div className="mb-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                        <p className="text-sm font-semibold text-gray-800">Imported Excel Sheets ({imports.length})</p>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-auto space-y-2">
                      {imports.map(item => (
                        <div 
                          key={item.id} 
                          className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleViewImport(item)}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <FileSpreadsheet className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{item.filename}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <p className="text-xs text-gray-500">{new Date(item.imported_at).toLocaleString()}</p>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">+{item.added_count}</span>
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">~{item.skipped_count}</span>
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {item.contact_count}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleViewImport(item)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View contacts"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => handleDeleteImport(item.id, e)} 
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete import and contacts"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Drag & Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
                    transition-all duration-200
                    ${isDragging 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'
                    }
                  `}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                  <p className="text-gray-700 font-medium mb-2">
                    {isDragging ? 'Drop file here' : 'Drag & drop or click to browse'}
                  </p>
                  <p className="text-sm text-gray-500">Excel files (.xlsx, .xls)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-3 border-blue-600 border-t-transparent"></div>
                      <div className="flex-1">
                        <p className="text-blue-900 font-semibold">Processing Excel file...</p>
                        <p className="text-xs text-blue-600 mt-0.5">This may take a moment for large datasets</p>
                      </div>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{width: '100%'}}></div>
                    </div>
                  </motion.div>
                )}

                {/* Result Messages */}
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    {result.error ? (
                      <div className="p-4 bg-red-50 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-red-900 font-medium">Upload Failed</p>
                          <p className="text-red-700 text-sm mt-1">{result.error}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-start gap-3 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-green-900 font-medium">Import Successful!</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-gray-600">Added</p>
                            <p className="text-2xl font-bold text-green-600">{result.added || 0}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg">
                            <p className="text-gray-600">Skipped</p>
                            <p className="text-2xl font-bold text-yellow-600">{result.skipped || 0}</p>
                          </div>
                        </div>
                        {result.errors && result.errors.length > 0 && (
                          <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                            <p className="text-yellow-900 text-sm font-medium mb-2">Errors:</p>
                            <ul className="text-xs text-yellow-800 space-y-1">
                              {result.errors.map((err, i) => (
                                <li key={i}>• {err}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Instructions */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Excel Format:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Column 1: Name <span className="text-red-600 font-semibold">*</span></li>
                    <li>• Column 2: Email <span className="text-red-600 font-semibold">*</span></li>
                    <li>• Column 3: Phone <span className="text-red-600 font-semibold">*</span></li>
                    <li>• Column 4: Company <span className="text-gray-400">(Optional)</span></li>
                    <li>• Column 5: Designation <span className="text-gray-400">(Optional)</span></li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2 italic">* Required fields</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* View Import Contacts Modal */}
      <AnimatePresence>
        {selectedImport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImport(null)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-xl">
                        <FileSpreadsheet className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-slate-900">{selectedImport.filename}</h2>
                        <p className="text-sm text-slate-500">
                          Imported on {new Date(selectedImport.imported_at).toLocaleString()} • {selectedImport.contact_count} contacts
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedImport(null)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-6">
                  {loadingContacts ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    </div>
                  ) : importContacts.length > 0 ? (
                    <div className="space-y-2">
                      {importContacts.map((contact, index) => (
                        <motion.div
                          key={contact.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.02 }}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-slate-900">{contact.name}</h3>
                              <div className="mt-2 space-y-1">
                                {contact.email && (
                                  <p className="text-sm text-slate-600">
                                    <span className="font-medium">Email:</span> {contact.email}
                                  </p>
                                )}
                                {contact.phone && (
                                  <p className="text-sm text-slate-600">
                                    <span className="font-medium">Phone:</span> {contact.phone}
                                  </p>
                                )}
                                {contact.company && (
                                  <p className="text-sm text-slate-600">
                                    <span className="font-medium">Company:</span> {contact.company}
                                  </p>
                                )}
                                {contact.designation && (
                                  <p className="text-sm text-slate-600">
                                    <span className="font-medium">Designation:</span> {contact.designation}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500">No contacts found in this import</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-slate-200 bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-medium">
                        Added: {selectedImport.added_count}
                      </span>
                      <span className="text-sm bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium">
                        Skipped: {selectedImport.skipped_count}
                      </span>
                      <span className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                        Total: {selectedImport.contact_count}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        handleDeleteImport(selectedImport.id, e);
                        setSelectedImport(null);
                      }}
                      className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors font-medium flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Import
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
