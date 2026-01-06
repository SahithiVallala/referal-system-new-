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
        className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-2.5 shadow-md">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Contact Management</h2>
                <p className="text-sm text-gray-500">Viewing {filteredContacts.length} total contact{filteredContacts.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
            
            {/* Follow-up Notification Button */}
            {notificationCount > 0 && (
              <button
                onClick={onNotificationClick}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 border border-gray-200 shadow-sm hover:shadow-md"
              >
                <div className="relative">
                  <Bell className="h-4 w-4 text-indigo-600" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-sm"></span>
                </div>
                <span className="font-medium">Today's Follow-Ups</span>
                <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">{notificationCount}</span>
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
              className="w-full pl-12 pr-4 py-3 bg-white border-gray-300 rounded-xl shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
            />
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Filter by Category</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', 'contacted', 'not_contacted', 'has_requirement', 'no_requirement'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filterStatus === status
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent hover:border-gray-300'
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Table Section */}
        <div className="p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {filteredContacts.length} Contact{filteredContacts.length !== 1 ? 's' : ''} Found
              </span>
            </div>
          </div>
          
          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
            {loading ? (
              <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
                <p className="text-gray-600 mt-4 font-medium">Loading contacts...</p>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-10 h-10 text-indigo-500" />
                </div>
                <p className="text-base font-semibold text-gray-700 mb-1">No contacts found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
              </div>
            ) : (
              filteredContacts.map((c, index) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer"
                  onClick={() => setSelected(c)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                    {/* Name with Avatar */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-800 text-base">{c.name}</span>
                    </div>

                    {/* Phone Number */}
                    {c.phone && (
                      <div className="flex items-center gap-2.5">
                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">{c.phone}</span>
                      </div>
                    )}

                    {/* Email */}
                    {c.email && (
                      <div className="flex items-center gap-2.5">
                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{c.email}</span>
                      </div>
                    )}

                    {/* Last Contact Info */}
                    {c.latest_log && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          Last contacted: <span className="font-medium text-gray-700">{new Date(c.latest_log.contacted_at).toLocaleDateString()}</span>
                        </div>
                        {c.latest_log.contacted_by && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 mt-1.5">
                            <User className="w-3.5 h-3.5" />
                            Contacted by: <span className="font-semibold text-indigo-600">{c.latest_log.contacted_by}</span>
                          </div>
                        )}
                        {c.latest_log.notes && (
                          <div className="bg-gray-50 mt-2 p-2.5 rounded-lg border border-gray-200">
                            <p className="text-xs text-gray-700 italic leading-relaxed">"{c.latest_log.notes}"</p>
                          </div>
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
