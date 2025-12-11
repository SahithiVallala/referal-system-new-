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
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
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
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Follow-up Center</h3>
                        <p className="text-sm text-white/90 font-medium">
                          {dueToday.length > 0 
                            ? `${dueToday.length} pending reminder${dueToday.length > 1 ? 's' : ''}`
                            : 'All caught up!'
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeNotificationForToday}
                      className="text-white/90 hover:bg-white/20 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                  {dueToday.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                      </div>
                      <h4 className="text-lg font-bold text-gray-900 mb-2">You're all caught up!</h4>
                      <p className="text-sm text-gray-600">No pending follow-ups for today.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dueToday.map((followup) => {
                        const isOverdue = dayjs(followup.follow_up_date).isBefore(dayjs(), 'day');
                        return (
                        <motion.div
                          key={followup.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-3">
                                <h4 className="font-bold text-gray-900 text-base truncate">{followup.name}</h4>
                                {isOverdue && (
                                  <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-md font-semibold flex-shrink-0">Overdue</span>
                                )}
                              </div>
                              
                              <div className="space-y-2 text-sm text-gray-600">
                                {followup.phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{followup.phone}</span>
                                  </div>
                                )}
                                {followup.email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="truncate">{followup.email}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                  <span className="font-medium">
                                    {dayjs(followup.follow_up_date).format('MMM D, YYYY')}
                                  </span>
                                </div>
                              </div>
                              
                              {followup.notes && (
                                <div className="bg-gray-50 mt-3 p-3 rounded-lg border border-gray-100">
                                  <p className="text-sm text-gray-700 italic break-words whitespace-pre-wrap leading-relaxed">"{followup.notes}"</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 self-start ml-2">
                              <button
                                onClick={() => handleComplete(followup.id)}
                                disabled={completing === followup.id}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-lg transition-colors disabled:opacity-50 w-10 h-10 flex items-center justify-center"
                                title="Mark as complete"
                              >
                                {completing === followup.id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                ) : (
                                  <CheckCircle className="w-5 h-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                      })}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {dueToday.length > 0 && (
                  <div className="p-6 border-t-2 border-gray-200 bg-white">
                    <button
                      onClick={closeNotificationForToday}
                      className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl"
                    >
                      Close Notifications
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
