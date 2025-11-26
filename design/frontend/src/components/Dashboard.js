import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, FileText, Clock, Download, Trash2, AlertTriangle } from 'lucide-react';
import API from '../utils/api';
import dayjs from 'dayjs';

export default function Dashboard({ refreshTrigger }) {
  const [contacts, setContacts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const didInitRef = useRef(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
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
  const hasRequirement = contacts.filter(c => c.latest_log?.response === 'yes');
  
  const today = dayjs().startOf('day');
  const pendingFollowups = contacts.filter(c => {
    if (!c.latest_log?.follow_up_date) return false;
    if (c.latest_log?.follow_up_completed) return false;
    const followUpDate = dayjs(c.latest_log.follow_up_date).startOf('day');
    return followUpDate.isBefore(today) || followUpDate.isSame(today);
  });
  
  const stats = [
    { label: 'Total Contacts', value: contacts.length, icon: Users, color: 'text-blue-500' },
    { label: 'Contacted', value: contacted.length, icon: CheckCircle, color: 'text-green-500' },
    { label: 'Has Requirements', value: hasRequirement.length, icon: FileText, color: 'text-indigo-500' },
    { label: 'Pending Follow-ups', value: pendingFollowups.length, icon: Clock, color: 'text-purple-500' }
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto" />
                <h3 className="text-xl font-bold text-gray-900 mt-4">Are you sure?</h3>
                <p className="text-sm text-gray-500 mt-2">
                  This will permanently delete all contacts, logs, and requirements. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  disabled={clearing}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={clearing}
                  className="btn-danger flex-1"
                >
                  {clearing ? 'Clearing...' : 'Clear All Data'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Dashboard</h2>
        <div className="flex items-center gap-2">
          <button onClick={exportToExcel} className="btn-primary">
            <Download className="w-4 h-4 mr-2" />
            Export Requirements
          </button>
          <button onClick={() => setShowClearConfirm(true)} className="btn-danger">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </button>
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center gap-4"
          >
            <div className={`p-3 rounded-full bg-white shadow-sm ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Requirements Summary */}
      <div className="mt-8">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Job Requirements</h3>
        {requirements.length > 0 ? (
          <div className="space-y-3">
            {requirements.slice(0, 5).map((req, index) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-gray-50 border border-gray-200 rounded-lg p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{req.role}</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {req.contact_name} @ {req.company}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteRequirement(req.id)}
                    disabled={deletingReq === req.id}
                    className="text-red-500 hover:text-red-700 p-2 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete requirement"
                  >
                    {deletingReq === req.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-500 border-t-transparent"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
            {requirements.length > 5 && (
              <p className="text-sm text-gray-500 text-center pt-2">
                +{requirements.length - 5} more...
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 font-medium">No requirements yet</p>
            <p className="text-sm text-gray-400">They will appear here once added.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
