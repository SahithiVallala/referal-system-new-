import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Phone, Mail, UserPlus, Clock, Briefcase } from 'lucide-react';
import API from '../utils/api';
import RequirementForm from './RequirementForm';
import QuickAddContact from './QuickAddContact';

export default function ContactList({ refreshTrigger, onDataChange }) {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isQuickAddOpen, setQuickAddOpen] = useState(false);
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
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      c.name?.toLowerCase().includes(search) ||
      c.email?.toLowerCase().includes(search) ||
      c.company?.toLowerCase().includes(search);

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'contacted' && c.latest_log) ||
      (filterStatus === 'not_contacted' && !c.latest_log) ||
      (filterStatus === 'has_requirement' && c.latest_log?.response === 'yes') ||
      (filterStatus === 'no_requirement' && c.latest_log?.response === 'no');

    return matchesSearch && matchesFilter;
  });

  const getStatusInfo = (contact) => {
    if (!contact.latest_log) {
      return { text: 'Not Contacted', className: 'badge-warning' };
    }
    if (contact.latest_log.response === 'yes') {
      return { text: 'Has Requirement', className: 'badge-success' };
    }
    if (contact.latest_log.response === 'no') {
      return { text: 'No Requirement', className: 'badge-danger' };
    }
    return { text: 'Contacted', className: 'badge-info' };
  };

  const handleQuickAddSuccess = (newContact) => {
    setContacts(prev => [newContact, ...prev]);
    setQuickAddOpen(false);
    onDataChange();
  };
  
  const getAvatar = (name) => {
    if (!name) return '??';
    const initials = name.split(' ').map(n => n[0]).join('');
    return initials.slice(0, 2).toUpperCase();
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-6"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 sm:mb-0">Contacts ({filteredContacts.length})</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 !py-2"
              />
            </div>
            <button onClick={() => setQuickAddOpen(true)} className="btn-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Quick Add
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-4 pb-4 border-b border-gray-200">
          {['all', 'contacted', 'not_contacted', 'has_requirement', 'no_requirement'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`btn-tab ${filterStatus === status ? 'active' : ''}`}
            >
              {status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </button>
          ))}
        </div>

        {/* Contacts List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {loading ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto animate-pulse" />
              <p className="text-gray-500 mt-4">Loading contacts...</p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto" />
              <p className="text-gray-500 mt-2 font-medium">No contacts found</p>
              <p className="text-sm text-gray-400">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            filteredContacts.map((c, index) => {
              const status = getStatusInfo(c);
              return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                whileHover={{
                  borderColor: '#3b82f6', // blue-500
                  x: 4
                }}
                className="border border-gray-200 rounded-xl p-3 hover:shadow-md transition-all cursor-pointer flex items-start gap-4"
                onClick={() => setSelected(c)}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                  {getAvatar(c.name)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800 text-lg">{c.name}</h3>
                    <span className={status.className}>{status.text}</span>
                  </div>
                  {c.company && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Briefcase className="w-4 h-4" />
                      <span>{c.company}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {c.phone && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{c.phone}</span>
                      </div>
                    )}
                    {c.email && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{c.email}</span>
                      </div>
                    )}
                  </div>
                  {c.latest_log && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      Last contacted: {new Date(c.latest_log.contacted_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </motion.div>
            )})
          )}
        </div>
      </motion.div>

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
      <AnimatePresence>
        {isQuickAddOpen && (
          <QuickAddContact
            onSuccess={handleQuickAddSuccess}
            onClose={() => setQuickAddOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
