import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, User, Phone, Mail, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import API from '../utils/api';
import dayjs from 'dayjs';

export default function FollowUps({ refreshTrigger, onDataChange }) {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [dueToday, setDueToday] = useState([]);
  const [completing, setCompleting] = useState(null);
  const [dismissedForToday, setDismissedForToday] = useState(false);
  const hasAutoShownRef = useRef(false);

  const loadFollowups = async (mode = 'auto', showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        API.get('/contacts/followups/all'),
        API.get('/contacts/followups/pending')
      ]);
      
      setFollowups(allRes.data);
      setDueToday(pendingRes.data);
      
      // Auto-open notification only if:
      // - there are due items today
      // - not dismissed for today
      // - not already auto-shown in this session
      // - mode is 'auto' (not 'silent')
      if (
        mode === 'auto' &&
        pendingRes.data.length > 0 &&
        !dismissedForToday &&
        !hasAutoShownRef.current
      ) {
        setShowNotification(true);
        hasAutoShownRef.current = true;
      }
    } catch (err) {
      console.error('Error loading follow-ups:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Initialize dismissal state from localStorage on mount
  useEffect(() => {
    const key = 'followups_notice_dismissed_date';
    const todayStr = dayjs().format('YYYY-MM-DD');
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    setDismissedForToday(stored === todayStr);
  }, []);

  // Load followups when component mounts and when refreshTrigger changes.
  // On mount and interval: use 'auto' to allow a single automatic open.
  // On refreshTrigger updates (e.g., after saving): use 'silent' to avoid re-opening.
  useEffect(() => {
    loadFollowups('auto', true);

    // Check for new follow-ups every 5 minutes (auto mode) - set once on mount
    const interval = setInterval(() => loadFollowups('auto', false), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadFollowups('silent', false);
    }
  }, [refreshTrigger]);

  const getStatusColor = (date) => {
    const today = dayjs().startOf('day');
    const followUpDate = dayjs(date).startOf('day');
    
    if (followUpDate.isBefore(today)) {
      return 'bg-red-50 text-red-700 border-red-200';
    } else if (followUpDate.isSame(today)) {
      return 'bg-blue-50 text-blue-700 border-blue-200';
    } else {
      return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (date) => {
    const today = dayjs().startOf('day');
    const followUpDate = dayjs(date).startOf('day');
    
    if (followUpDate.isBefore(today)) {
      return 'Overdue';
    } else if (followUpDate.isSame(today)) {
      return 'Due Today';
    } else {
      const daysUntil = followUpDate.diff(today, 'day');
      return `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
    }
  };

  const handleComplete = async (logId) => {
    setCompleting(logId);
    try {
      await API.patch(`/contacts/followups/${logId}/complete`);
      
      // Reload follow-ups from server to ensure consistency (silent to avoid popup)
      await loadFollowups('silent', false);
      
      // Notify parent to refresh dashboard
      if (onDataChange) {
        onDataChange();
      }
    } catch (err) {
      console.error('Error completing follow-up:', err);
      alert('Failed to mark follow-up as complete');
    } finally {
      setCompleting(null);
    }
  };

  const closeNotificationForToday = () => {
    setShowNotification(false);
    const key = 'followups_notice_dismissed_date';
    const todayStr = dayjs().format('YYYY-MM-DD');
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, todayStr);
      }
    } catch (_) {}
    setDismissedForToday(true);
  };

  return (
    <>
      {/* Notification Popup for Due Today */}
      <AnimatePresence>
        {showNotification && dueToday.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeNotificationForToday}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl border-2 border-blue-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg">
                        <Bell className="w-6 h-6 text-blue-600 animate-bounce" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Follow-up Reminders</h3>
                        <p className="text-sm text-blue-100">{dueToday.length} contact{dueToday.length > 1 ? 's' : ''} need attention</p>
                      </div>
                    </div>
                    <button
                      onClick={closeNotificationForToday}
                      className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto p-4 space-y-3">
                  {dueToday.map((followup) => (
                    <motion.div
                      key={followup.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-blue-50 border border-blue-200 rounded-lg p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-900">{followup.name}</h4>
                          <div className="mt-2 space-y-1 text-sm text-slate-600">
                            {followup.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3 h-3" />
                                {followup.phone}
                              </div>
                            )}
                            {followup.email && (
                              <div className="flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {followup.email}
                              </div>
                            )}
                          </div>
                          {followup.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">"{followup.notes}"</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {dayjs(followup.follow_up_date).isBefore(dayjs(), 'day') ? 'Overdue' : 'Today'}
                          </span>
                          <button
                            onClick={() => handleComplete(followup.id)}
                            disabled={completing === followup.id}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white p-1.5 rounded-lg transition-colors disabled:opacity-50"
                            title="Mark as complete"
                          >
                            {completing === followup.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                            ) : (
                              <CheckCircle className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200">
                  <button
                    onClick={closeNotificationForToday}
                    className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all font-medium"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Follow-ups List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl relative">
              <Calendar className="w-6 h-6 text-white" />
              {dueToday.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {dueToday.length}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Follow-ups</h2>
              <p className="text-sm text-slate-500">{followups.length} scheduled</p>
            </div>
          </div>
          {dueToday.length > 0 && (
            <button
              onClick={() => setShowNotification(true)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 font-medium"
            >
              <Bell className="w-4 h-4" />
              {dueToday.length} Due
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="text-slate-500 mt-4">Loading follow-ups...</p>
          </div>
        ) : followups.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No follow-ups scheduled</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
            {followups.map((followup, index) => (
              <motion.div
                key={followup.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`border-2 rounded-xl p-4 hover:shadow-md transition-all ${getStatusColor(followup.follow_up_date)}`}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4" />
                      <h3 className="font-bold text-slate-900">{followup.name}</h3>
                    </div>

                    <div className="space-y-1 text-sm">
                      {followup.phone && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Phone className="w-3 h-3" />
                          {followup.phone}
                        </div>
                      )}
                      {followup.email && (
                        <div className="flex items-center gap-2 text-slate-700">
                          <Mail className="w-3 h-3" />
                          {followup.email}
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-slate-700 font-medium">
                        <Clock className="w-3 h-3" />
                        {dayjs(followup.follow_up_date).format('MMM DD, YYYY')}
                      </div>
                    </div>

                    {followup.notes && (
                      <p className="text-sm text-slate-600 mt-2 italic">"{followup.notes}"</p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/50">
                      {getStatusLabel(followup.follow_up_date)}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleComplete(followup.id)}
                      disabled={completing === followup.id}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Mark as complete"
                    >
                      {completing === followup.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </>
  );
}
