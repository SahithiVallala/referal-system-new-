import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Mail, Phone, Building, Briefcase, User, CheckCircle, AlertCircle } from 'lucide-react';
import API from '../utils/api';

export default function ContactForm({ onContactAdded }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', designation: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/contacts', form);
      if (res.data.existing) {
        setMsg({ type: 'warning', text: 'Contact already exists in database' });
      } else {
        setMsg({ type: 'success', text: 'Contact added successfully!' });
        setForm({ name: '', email: '', phone: '', company: '', designation: '' });
        if (onContactAdded) onContactAdded();
      }
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl shadow-md">
          <UserPlus className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Add Former Employee</h2>
          <p className="text-sm text-gray-500">Name, Email, and Phone are the key details</p>
        </div>
      </div>

      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`
              p-4 rounded-lg mb-4 flex items-start gap-3
              ${msg.type === 'success' ? 'bg-green-50 text-green-900' : ''}
              ${msg.type === 'warning' ? 'bg-yellow-50 text-yellow-900' : ''}
              ${msg.type === 'error' ? 'bg-red-50 text-red-900' : ''}
            `}
          >
            {msg.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
            {msg.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
            {msg.type === 'warning' && <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />}
            <p className="text-sm font-medium">{msg.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4" />
            Full Name
          </label>
          <input
            type="text"
            placeholder="Enter full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              Email *
            </label>
            <input
              type="email"
              placeholder="email@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              Phone Number *
            </label>
            <input
              type="tel"
              placeholder="+1 234 567 8900"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
              <Building className="w-4 h-4" />
              Current Company <span className="text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Company name"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="input-field"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
              <Briefcase className="w-4 h-4" />
              Designation <span className="text-xs">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="Job title"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              Adding Contact...
            </>
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              Add Contact
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
