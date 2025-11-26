import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Phone, Mail, User, Clock, CheckCircle, XCircle, AlertCircle, Bell } from 'lucide-react';
import API from '../utils/api';
import RequirementForm from './RequirementForm';

export default function ContactList({ refreshTrigger, onDataChange, notificationCount = 0, onNotificationClick }) {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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
      filterStatus === 'all' ||
      (filterStatus === 'contacted' && c.latest_log) ||
      (filterStatus === 'not_contacted' && !c.latest_log) ||
      (filterStatus === 'has_requirement' && c.latest_log?.response === 'yes') ||
      (filterStatus === 'no_requirement' && c.latest_log?.response === 'no');

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (contact) => {
    if (!contact.latest_log) {
      return <span className="badge-warning">Not Contacted</span>;
    }
    if (contact.latest_log.response === 'yes') {
      return <span className="badge-success">Has Requirement</span>;
    }
    if (contact.latest_log.response === 'no') {
      return <span className="badge-danger">No Requirement</span>;
    }
    return <span className="badge-info">Pending</span>;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-lg overflow-hidden"
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-2.5">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Contact Management</h2>
                <p className="text-sm text-white/80">{filteredContacts.length} total contacts</p>
              </div>
            </div>
            
            {/* Follow-up Notification Button */}
            {notificationCount > 0 && (
              <button
                onClick={onNotificationClick}
                className="bg-white/30 backdrop-blur-sm hover:bg-white/40 text-white px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 border border-white/30 shadow-sm"
              >
                <div className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-300 rounded-full animate-pulse"></span>
                </div>
                <span className="font-medium">
                  {notificationCount} Reminder{notificationCount !== 1 ? 's' : ''}
                </span>
              </button>
            )}
          </div>
          
          {/* Search Bar inside gradient header */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/95 backdrop-blur-sm border-white/30 rounded-xl shadow-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/50 p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gradient-to-b from-purple-400 to-purple-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-500">Filter by Category</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'contacted', 'not_contacted', 'has_requirement', 'no_requirement'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-md shadow-blue-400/30 scale-105'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-sm'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Table Section */}
        <div className="p-6 bg-white">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-500">
              {filteredContacts.length} Contact{filteredContacts.length !== 1 ? 's' : ''} Found
            </span>
          </div>
          
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="text-slate-500 mt-4">Loading contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No contacts found</p>
              </div>
            ) : (
              filteredContacts.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-gradient-to-r from-white to-blue-50/30 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => setSelected(c)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-2">
                    {/* Name with Person Icon */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="font-semibold text-slate-900">{c.name}</span>
                    </div>

                    {/* Phone Number */}
                    {c.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{c.phone}</span>
                      </div>
                    )}

                    {/* Email */}
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{c.email}</span>
                      </div>
                    )}

                    {/* Last Contact Info */}
                    {c.latest_log && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          Last contacted: {new Date(c.latest_log.contacted_at).toLocaleDateString()}
                        </div>
                        {c.latest_log.contacted_by && (
                          <div className="flex items-center gap-2 text-xs text-slate-600 mt-1">
                            <User className="w-3 h-3" />
                            Contacted by: <span className="font-medium text-blue-600">{c.latest_log.contacted_by}</span>
                          </div>
                        )}
                        {c.latest_log.notes && (
                          <p className="text-xs text-slate-600 mt-1 italic">"{c.latest_log.notes}"</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                    {/* Status Badge */}
                    <div className="ml-4">
                      {getStatusBadge(c)}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>

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
