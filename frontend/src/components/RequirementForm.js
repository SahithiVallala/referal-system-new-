import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileText, Briefcase, Award, Users, MessageSquare, Calendar, CheckCircle, AlertCircle, Download, Mail, Phone, Building } from 'lucide-react';
import API from '../utils/api';

export default function RequirementForm({ contact, onDone }) {
  const [log, setLog] = useState({ 
    contacted_by: '', 
    response: 'pending', 
    contacted_at: new Date().toISOString().split('T')[0], // Default to today
    follow_up_date: '', 
    notes: '' 
  });
  const [req, setReq] = useState({ role: '', experience: '', skills: '', openings: 1, description: '' });
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Log contact, 2: Add requirement

  const submitLog = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post(`/contacts/${contact.id}/log`, log);
      setMsg({ type: 'success', text: 'Contact logged successfully!' });
      
      if (log.response === 'yes') {
        setTimeout(() => {
          setMsg(null);
          setStep(2);
        }, 1000);
      } else {
        setTimeout(() => {
          onDone();
        }, 1500);
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Error logging contact' });
    } finally {
      setLoading(false);
    }
  };

  const submitReq = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/requirements', { contact_id: contact.id, ...req });
      setMsg({ type: 'success', text: 'Requirement saved successfully!' });
      setTimeout(() => {
        onDone();
      }, 1500);
    } catch (err) {
      setMsg({ type: 'error', text: 'Error saving requirement' });
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    window.open('http://localhost:4000/api/requirements/export', '_blank');
  };

  return (
    <>
      {/* Modal Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDone}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-6 rounded-t-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{contact.name}</h2>
                <div className="flex items-center gap-4 text-slate-200 text-sm">
                  {contact.email && <span className="flex items-center gap-1"><Mail className="w-4 h-4" />{contact.email}</span>}
                  {contact.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{contact.phone}</span>}
                </div>
                {contact.company && (
                  <div className="flex items-center gap-2 mt-2 text-slate-200 text-sm">
                    <Building className="w-4 h-4" />
                    {contact.company} {contact.designation && `• ${contact.designation}`}
                  </div>
                )}
              </div>
              <button
                onClick={onDone}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-2 mt-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                step === 1 ? 'bg-white text-gray-700 shadow-sm' : 'bg-blue-400/50 text-white'
              }`}>
                <span className="font-semibold">1</span>
                <span className="text-sm">Contact Log</span>
              </div>
              {log.response === 'yes' && (
                <>
                  <div className="h-0.5 w-8 bg-white/40"></div>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                    step === 2 ? 'bg-white text-gray-700 shadow-sm' : 'bg-blue-400/50 text-white'
                  }`}>
                    <span className="font-semibold">2</span>
                    <span className="text-sm">Job Requirement</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            <AnimatePresence>
              {msg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`
                    p-4 rounded-lg mb-6 flex items-start gap-3
                    ${msg.type === 'success' ? 'bg-green-50 text-green-900' : ''}
                    ${msg.type === 'error' ? 'bg-red-50 text-red-900' : ''}
                  `}
                >
                  {msg.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />}
                  {msg.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
                  <p className="text-sm font-medium">{msg.text}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 1: Contact Log */}
            {step === 1 && (
              <motion.form
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={submitLog}
                className="space-y-4"
              >
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Users className="w-4 h-4" />
                    Contacted By (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Recruiter name (optional)"
                    value={log.contacted_by}
                    onChange={(e) => setLog({ ...log, contacted_by: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Contacted Date
                  </label>
                  <input
                    type="date"
                    value={log.contacted_at}
                    onChange={(e) => setLog({ ...log, contacted_at: e.target.value })}
                    className="input-field"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">You can customize the date when the contact was made</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <CheckCircle className="w-4 h-4" />
                    Response Status
                  </label>
                  <select
                    value={log.response}
                    onChange={(e) => setLog({ ...log, response: e.target.value })}
                    className="input-field"
                  >
                    <option value="pending">Pending</option>
                    <option value="yes">Has Job Requirement</option>
                    <option value="no">No Job Requirement</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Calendar className="w-4 h-4" />
                    Follow-up Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={log.follow_up_date}
                    onChange={(e) => setLog({ ...log, follow_up_date: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Notes
                  </label>
                  <textarea
                    placeholder="Add any relevant notes from the conversation..."
                    value={log.notes}
                    onChange={(e) => setLog({ ...log, notes: e.target.value })}
                    rows={4}
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Contact Log
                      </>
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={onDone}
                    className="btn-secondary px-6"
                  >
                    Cancel
                  </button>
                </div>
              </motion.form>
            )}

            {/* Step 2: Job Requirement */}
            {step === 2 && (
              <motion.form
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onSubmit={submitReq}
                className="space-y-4"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-900">
                    <FileText className="w-5 h-5" />
                    <h3 className="font-semibold">Add Job Requirement Details</h3>
                  </div>
                  <p className="text-sm text-slate-700 mt-1">Fill in the job opening information provided by {contact.name}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Briefcase className="w-4 h-4" />
                    Job Role *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Software Engineer"
                    value={req.role}
                    onChange={(e) => setReq({ ...req, role: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Award className="w-4 h-4" />
                      Experience Required
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., 3-5 years"
                      value={req.experience}
                      onChange={(e) => setReq({ ...req, experience: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                      <Users className="w-4 h-4" />
                      Number of Openings
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={req.openings}
                      onChange={(e) => setReq({ ...req, openings: parseInt(e.target.value || 1) })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <Award className="w-4 h-4" />
                    Skills Required
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., React, Node.js, TypeScript"
                    value={req.skills}
                    onChange={(e) => setReq({ ...req, skills: e.target.value })}
                    className="input-field"
                  />
                  <p className="text-xs text-slate-500 mt-1">Separate multiple skills with commas</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                    <FileText className="w-4 h-4" />
                    Job Description
                  </label>
                  <textarea
                    placeholder="Provide detailed job description, responsibilities, qualifications..."
                    value={req.description}
                    onChange={(e) => setReq({ ...req, description: e.target.value })}
                    rows={6}
                    className="input-field resize-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Requirement
                      </>
                    )}
                  </motion.button>
                  <button
                    type="button"
                    onClick={() => onDone()}
                    className="btn-secondary flex items-center gap-2 px-4"
                  >
                    Skip & Finish
                  </button>
                  <button
                    type="button"
                    onClick={exportToExcel}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Export All
                  </button>
                </div>
              </motion.form>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
