import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Phone, Mail, User, Clock, CheckCircle, XCircle, AlertCircle, Bell, Calendar, Trash2, Building, Award, Eye, MessageSquare } from 'lucide-react';
import API from '../utils/api';
import RequirementForm from './RequirementForm';

export default function ContactList({ 
  refreshTrigger, 
  onDataChange, 
  notificationCount = 0, 
  onNotificationClick,
  activeFilter = 'all',
  currentFilterLabel = 'All Contacts'
}) {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const didInitRef = useRef(false);

  const load = async (showSpinner) => {
    if (showSpinner) setLoading(true);
    try {
      const res = await API.get('/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;
      load(true);
    } else {
      load(false);
    }
  }, [refreshTrigger]);

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      activeFilter === 'all' ||
      (activeFilter === 'contacted' && c.latest_log) ||
      (activeFilter === 'not_contacted' && !c.latest_log) ||
      (activeFilter === 'has_requirement' && c.latest_log?.response === 'yes') ||
      (activeFilter === 'no_requirement' && c.latest_log?.response === 'no') ||
      (activeFilter === 'pending_followups' && c.latest_log?.follow_up_date);

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (contact) => {
    if (!contact.latest_log) {
      return <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-orange-50 text-orange-700 border border-orange-200 whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm"><XCircle className="w-3.5 h-3.5" />Not Contacted</span>;
    }
    if (contact.latest_log.response === 'yes') {
      return <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm"><CheckCircle className="w-3.5 h-3.5" />Contacted</span>;
    }
    if (contact.latest_log.response === 'no') {
      return <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-50 text-gray-600 border border-gray-200 whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm"><AlertCircle className="w-3.5 h-3.5" />No Requirement</span>;
    }
    return <span className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap inline-flex items-center gap-1.5 shadow-sm"><CheckCircle className="w-3.5 h-3.5" />Contacted</span>;
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Compact Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 flex-shrink-0 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg p-2.5 shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Contact Management</h2>
                <p className="text-sm text-gray-600 font-medium">Viewing: {currentFilterLabel}</p>
              </div>
            </div>
            
            {/* Follow-up Notification Button */}
            <button
              onClick={onNotificationClick}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <div className="relative">
                <motion.div
                  animate={notificationCount > 0 ? {
                    rotate: [0, -15, 15, -15, 15, 0],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: notificationCount > 0 ? Infinity : 0,
                    repeatDelay: 2
                  }}
                >
                  <Bell className="h-5 w-5" />
                </motion.div>
                {notificationCount > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-md"></span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                  </>
                )}
              </div>
              <div className="text-left">
                <div className="text-xs uppercase tracking-wide font-semibold">TODAY'S FOLLOW-UPS</div>
                <div className="text-base font-bold">
                  {notificationCount === 0 ? 'Nothing due' : `${notificationCount} Reminder${notificationCount !== 1 ? 's' : ''}`}
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Compact Search Bar */}
        <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/50 p-3 border-b border-gray-100 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm"
            />
          </div>
        </div>

        {/* Table Section - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No contacts found</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-blue-50 sticky top-0 z-10">
                  <tr className="border-b-2 border-indigo-100">
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>Contact Profile</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <Mail className="w-4 h-4 text-indigo-600" />
                        <span>Digital Identity</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <Phone className="w-4 h-4 text-indigo-600" />
                        <span>Contact Line</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <Award className="w-4 h-4 text-indigo-600" />
                        <span>Engagement Status</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>Last Touchpoint</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <Building className="w-4 h-4 text-indigo-600" />
                        <span>Contacted By</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span>Follow Ups</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        <span>Interaction Log</span>
                      </div>
                    </th>
                    <th className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
                        <Eye className="w-4 h-4 text-indigo-600" />
                        <span>Quick Actions</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      onClick={() => setSelected(contact)}
                      className="hover:bg-indigo-25 hover:shadow-sm cursor-pointer transition-all duration-200 border-l-4 border-transparent hover:border-indigo-400"
                    >
                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">{contact.name}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{contact.email || '-'}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{contact.phone || '-'}</td>
                      <td className="px-4 py-4">{getStatusBadge(contact)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {contact.latest_log?.contacted_at 
                          ? new Date(contact.latest_log.contacted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-4 py-4 text-base">
                        {contact.latest_log?.contacted_by ? (
                          <span className="text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-md text-base">{contact.latest_log.contacted_by}</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-4">
                        {contact.latest_log?.follow_up_date ? (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            <span className="font-medium">{new Date(contact.latest_log.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No schedule</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {contact.latest_log?.notes ? (
                          <div className="max-w-xs">
                            <p className="text-sm text-slate-600 truncate italic bg-slate-50 px-3 py-2 rounded-lg border-l-4 border-indigo-200">
                              "{contact.latest_log.notes}"
                            </p>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No notes</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete contact "${contact.name}"? This action cannot be undone.`)) {
                              try {
                                await API.delete(`/contacts/${contact.id}`);
                                load(false); // Reload contact list
                                if (onDataChange) onDataChange(); // Notify parent
                              } catch (err) {
                                console.error('Error deleting contact:', err);
                                alert('Failed to delete contact');
                              }
                            }
                          }}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors group"
                          title="Delete contact"
                        >
                          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Built with love footer */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-center text-gray-500">Built with ❤️ for efficient staffing operations</p>
        </div>
      </div>

      {/* Requirement Form Modal */}
      <AnimatePresence>
        {selected && (
          <RequirementForm
            contact={selected}
            onDone={() => {
              setSelected(null);
              load();
              if (onDataChange) onDataChange();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
