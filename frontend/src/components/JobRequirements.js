import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Trash2, AlertTriangle } from 'lucide-react';
import API from '../utils/api';

export default function JobRequirements({ refreshTrigger }) {
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showClearReqConfirm, setShowClearReqConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingReq, setDeletingReq] = useState(null);

  useEffect(() => {
    loadRequirements();
  }, [refreshTrigger]);

  const loadRequirements = async () => {
    try {
      const res = await API.get('/requirements');
      setRequirements(res.data);
    } catch (err) {
      console.error('Error loading requirements:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    window.open('http://localhost:4000/api/requirements/export', '_blank');
  };

  const handleDeleteRequirement = async (reqId) => {
    setDeletingReq(reqId);
    try {
      await API.delete(`/contacts/requirements/${reqId}`);
      setRequirements(prev => prev.filter(r => r.id !== reqId));
    } catch (err) {
      console.error('Error deleting requirement:', err);
      alert('Failed to delete requirement');
    } finally {
      setDeletingReq(null);
    }
  };

  const handleClearAllRequirements = async () => {
    setClearing(true);
    try {
      await API.delete('/contacts/requirements/clear-all');
      setRequirements([]);
      setShowClearReqConfirm(false);
    } catch (err) {
      console.error('Error clearing requirements:', err);
      alert('Failed to clear requirements');
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      {/* Clear Requirements Confirmation Modal */}
      <AnimatePresence>
        {showClearReqConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearReqConfirm(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-100 p-3 rounded-xl">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Clear All Requirements?</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-900 font-medium mb-2">This will permanently delete:</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• All {requirements.length} job requirements</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearReqConfirm(false)}
                    disabled={clearing}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAllRequirements}
                    disabled={clearing}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {clearing ? 'Clearing...' : 'Clear Requirements'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Job Requirements Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="bg-gradient-to-br from-purple-400 to-purple-500 p-2 rounded-lg shadow-sm flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 truncate">Job Requirements</h3>
                <p className="text-xs text-gray-500">{requirements.length} total</p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => setShowClearReqConfirm(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear all requirements"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={exportToExcel}
                className="px-2.5 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm flex items-center gap-1.5 text-xs font-medium whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent mx-auto"></div>
          </div>
        ) : requirements.length > 0 ? (
          <div className="max-h-64 overflow-y-auto">
            {requirements.map((req, index) => (
              <div
                key={req.id}
                className="p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm text-gray-900 truncate">{req.role}</h4>
                    <p className="text-xs text-gray-600 truncate">
                      {req.contact_name} @ {req.company}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {req.experience && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {req.experience}
                        </span>
                      )}
                      {req.openings && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {req.openings} openings
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRequirement(req.id)}
                    disabled={deletingReq === req.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors flex-shrink-0"
                  >
                    {deletingReq === req.id ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-red-500 border-t-transparent"></div>
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No requirements yet</p>
            <p className="text-xs text-gray-400 mt-1">Start contacting people to gather requirements</p>
          </div>
        )}
      </div>
    </>
  );
}
