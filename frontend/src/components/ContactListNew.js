import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Phone, Mail, User, Clock, CheckCircle, XCircle, AlertCircle, Bell } from 'lucide-react';
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
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 whitespace-nowrap inline-flex items-center gap-1"><XCircle className="w-3 h-3" />Not Contacted</span>;
    }
    if (contact.latest_log.response === 'yes') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 whitespace-nowrap inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />Contacted</span>;
    }
    if (contact.latest_log.response === 'no') {
      return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700 whitespace-nowrap inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" />No Requirement</span>;
    }
    return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 whitespace-nowrap inline-flex items-center gap-1"><CheckCircle className="w-3 h-3" />Contacted</span>;
  };

  return (
    <>
      <div className="flex flex-col h-full bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-lg overflow-hidden">
        {/* Compact Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-2">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Contact Management</h2>
                <p className="text-xs text-white/80">Viewing: {currentFilterLabel}</p>
              </div>
            </div>
            
            {/* Follow-up Notification Button */}
            <button
              onClick={onNotificationClick}
              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <div className="relative">
                <Bell className="h-4 w-4" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></span>
                )}
              </div>
              <div className="text-left">
                <div className="text-xs uppercase tracking-wide">TODAY'S FOLLOW-UPS</div>
                <div className="text-sm font-semibold">
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
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">Last Contacted</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">Contacted By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">Follow-up Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      onClick={() => setSelected(contact)}
                      className="hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{contact.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{contact.email || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{contact.phone || '-'}</td>
                      <td className="px-4 py-3">{getStatusBadge(contact)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {contact.latest_log?.contacted_at 
                          ? new Date(contact.latest_log.contacted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {contact.latest_log?.contacted_by ? (
                          <span className="text-blue-600 font-medium">{contact.latest_log.contacted_by}</span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {contact.latest_log?.follow_up_date 
                          ? new Date(contact.latest_log.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate italic">
                        {contact.latest_log?.notes ? `"${contact.latest_log.notes}"` : '-'}
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
