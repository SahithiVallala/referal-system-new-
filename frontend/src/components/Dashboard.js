import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, Users, CheckCircle, XCircle, Clock, FileText, Download, Trash2, AlertTriangle } from 'lucide-react';
import API from '../utils/api';
import dayjs from 'dayjs';

export default function Dashboard({ refreshTrigger }) {
  const [contacts, setContacts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const didInitRef = useRef(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearReqConfirm, setShowClearReqConfirm] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [deletingReq, setDeletingReq] = useState(null);

  useEffect(() => {
    const loadData = async (showSpinner) => {
      if (showSpinner) setLoading(true);
      try {
        const [contactsRes, requirementsRes] = await Promise.all([
          API.get('/contacts'),
          API.get('/requirements')
        ]);
        setContacts(contactsRes.data);
        setRequirements(requirementsRes.data);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        if (showSpinner) setLoading(false);
      }
    };
    if (!didInitRef.current) {
      didInitRef.current = true;
      loadData(true);
    } else {
      loadData(false);
    }
  }, [refreshTrigger]);

  const contacted = contacts.filter(c => c.latest_log);
  const notContacted = contacts.filter(c => !c.latest_log);
  const hasRequirement = contacts.filter(c => c.latest_log?.response === 'yes');
  const noRequirement = contacts.filter(c => c.latest_log?.response === 'no');
  
  // Count only pending follow-ups (due today or overdue, and not completed)
  const today = dayjs().startOf('day');
  const pendingFollowups = contacts.filter(c => {
    if (!c.latest_log?.follow_up_date) return false;
    if (c.latest_log?.follow_up_completed) return false;
    const followUpDate = dayjs(c.latest_log.follow_up_date).startOf('day');
    return followUpDate.isBefore(today) || followUpDate.isSame(today);
  });
  
  const stats = [
    {
      label: 'Total Contacts',
      value: contacts.length,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Contacted',
      value: contacted.length,
      icon: CheckCircle,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600'
    },
    {
      label: 'Has Requirements',
      value: hasRequirement.length,
      icon: FileText,
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      label: 'Pending Follow-ups',
      value: pendingFollowups.length,
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    }
  ];

  const exportToExcel = () => {
    window.open('http://localhost:4000/api/requirements/export', '_blank');
  };

  const handleClearAll = async () => {
    setClearing(true);
    try {
      await API.delete('/contacts/clear-all');
      setContacts([]);
      setRequirements([]);
      setShowClearConfirm(false);
      // Clear localStorage history too
      localStorage.removeItem('excelImports');
      alert('All data cleared successfully!');
      window.location.reload();
    } catch (err) {
      alert('Error clearing data: ' + err.message);
    } finally {
      setClearing(false);
    }
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

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
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
                    <li>• Requirements will be removed from Excel export</li>
                  </ul>
                  <p className="text-sm text-red-700 mt-3 italic">Note: Contacts and logs will NOT be affected</p>
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
                    {clearing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Clear Requirements
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Clear All Data Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
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
                    <h3 className="text-xl font-bold text-gray-900">Clear All Data?</h3>
                    <p className="text-sm text-gray-500">This action cannot be undone</p>
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-red-900 font-medium mb-2">This will permanently delete:</p>
                  <ul className="text-sm text-red-800 space-y-1">
                    <li>• All {contacts.length} contacts</li>
                    <li>• All contact logs and history</li>
                    <li>• All {requirements.length} job requirements</li>
                    <li>• All Excel import history</li>
                  </ul>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    disabled={clearing}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAll}
                    disabled={clearing}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {clearing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Clear All
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                <TrendingUp className="w-3 h-3" />
                <span>Real-time data</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Requirements Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Job Requirements</h3>
              <p className="text-sm text-slate-500">{requirements.length} total requirements</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowClearReqConfirm(true)}
              className="px-3 py-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors flex items-center gap-2 text-sm font-medium"
              title="Clear all requirements"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportToExcel}
              className="btn-primary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </motion.button>
          </div>
        </div>

        {requirements.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {requirements.slice(0, 5).map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-r from-blue-50/50 to-white border border-blue-100 rounded-lg p-3 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-900">{req.role}</h4>
                    <p className="text-sm text-slate-600 mt-1">
                      {req.contact_name} @ {req.company}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      {req.experience && <span className="badge-info">{req.experience}</span>}
                      {req.openings && <span className="badge-success">{req.openings} openings</span>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteRequirement(req.id)}
                    disabled={deletingReq === req.id}
                    className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-2 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete requirement"
                  >
                    {deletingReq === req.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-rose-500 border-t-transparent"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
            {requirements.length > 5 && (
              <p className="text-sm text-slate-500 text-center pt-2">
                +{requirements.length - 5} more requirements
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No requirements yet</p>
            <p className="text-sm text-slate-400 mt-1">Start contacting people to gather requirements</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
