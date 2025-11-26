import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, User, Phone, Mail, Clock, AlertCircle, CheckCircle, X } from 'lucide-react';
import API from '../utils/api';
import dayjs from 'dayjs';

export default function FollowUps({ refreshTrigger, onDataChange, onFollowupsUpdate, showModal, onCloseModal }) {
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const [dueToday, setDueToday] = useState([]);
  const [completing, setCompleting] = useState(null);
  const [dismissedForToday, setDismissedForToday] = useState(false);
  const hasAutoShownRef = useRef(false);

  // Show modal when requested from parent
  useEffect(() => {
    if (showModal) {
      setShowNotification(true);
    }
  }, [showModal]);

  const loadFollowups = async (mode = 'auto', showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const [allRes, pendingRes] = await Promise.all([
        API.get('/contacts/followups/all'),
        API.get('/contacts/followups/pending')
      ]);

      setFollowups(allRes.data);
      setDueToday(pendingRes.data);

      // Update parent with pending count
      if (onFollowupsUpdate) {
        onFollowupsUpdate(pendingRes.data.length);
      }
      
      // Disabled auto-popup - user must click notification bell to see follow-ups
      // if (
      //   mode === 'auto' &&
      //   pendingRes.data.length > 0 &&
      //   !dismissedForToday &&
      //   !hasAutoShownRef.current
      // ) {
      //   setShowNotification(true);
      //   hasAutoShownRef.current = true;
      // }
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
    if (onCloseModal) onCloseModal();
    const key = 'followups_notice_dismissed_date';
    const todayStr = dayjs().format('YYYY-MM-DD');
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, todayStr);
      }
    } catch (_) {}
    setDismissedForToday(true);
  };

  // Only return the modal popup that slides from right
  return (
    <>
      {/* Notification Slide Panel from Right */}
      <AnimatePresence>
        {showNotification && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeNotificationForToday}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-50 shadow-2xl"
            >
              <div className="bg-white h-full flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">Follow-up Center</h3>
                        <p className="text-sm text-white/80">
                          {dueToday.length > 0 
                            ? `${dueToday.length} pending reminder${dueToday.length > 1 ? 's' : ''}`
                            : '0 pending reminders'
                          }
                        </p>
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

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  {dueToday.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">You're all caught up!</h4>
                      <p className="text-gray-600">No pending follow-ups for today.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dueToday.map((followup) => (
                        <motion.div
                          key={followup.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 text-base mb-2">{followup.name}</h4>
                              <div className="space-y-1.5 text-sm text-slate-600">
                                {followup.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {followup.phone}
                                  </div>
                                )}
                                {followup.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    {followup.email}
                                  </div>
                                )}
                              </div>
                              {followup.notes && (
                                <p className="text-sm text-gray-600 mt-2 italic bg-white/60 p-2 rounded">"{followup.notes}"</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
                                {dayjs(followup.follow_up_date).isBefore(dayjs(), 'day') ? 'Overdue' : 'Today'}
                              </span>
                              <button
                                onClick={() => handleComplete(followup.id)}
                                disabled={completing === followup.id}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition-colors disabled:opacity-50"
                                title="Mark as complete"
                              >
                                {completing === followup.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                ) : (
                                  <CheckCircle className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {dueToday.length > 0 && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <button
                      onClick={closeNotificationForToday}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium shadow-md"
                    >
                      Close drawer
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
