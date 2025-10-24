import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Phone, Mail, User, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import API from '../utils/api';
import RequirementForm from './RequirementForm';

export default function ContactList({ refreshTrigger, onDataChange }) {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await API.get('/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
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
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Contacts</h2>
              <p className="text-sm text-slate-500">{filteredContacts.length} contacts</p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'contacted', 'not_contacted', 'has_requirement', 'no_requirement'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${
                    filterStatus === status
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                }`}
              >
                {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
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
