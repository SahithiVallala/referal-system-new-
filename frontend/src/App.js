import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import dayjs from 'dayjs';
import { AnimatePresence, motion } from 'framer-motion';

// Auth Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminUsers from "./pages/AdminUsers";
import Unauthorized from "./pages/Unauthorized";

// Application Components
import ContactList from './components/ContactListNew';
import QuickAddContact from './components/QuickAddContact';
import ExcelImport from './components/ExcelImport';
import FollowUps from './components/FollowUps';
import JobRequirements from './components/JobRequirements';
import API from './utils/api';
import { Users, CheckCircle, FileText, Clock, Bell, Settings, UserPlus, Upload, Lock, LogOut, Shield, Download } from 'lucide-react';

// Main Application Component (Your original app with stats sidebar)
function MainApplication() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showExcelImport, setShowExcelImport] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      const [contactsRes, requirementsRes] = await Promise.all([
        API.get('/contacts'),
        API.get('/requirements')
      ]);
      setContacts(contactsRes.data);
      setRequirements(requirementsRes.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const contacted = contacts.filter(c => c.latest_log);
  const notContacted = contacts.filter(c => !c.latest_log);
  const hasRequirement = contacts.filter(c => c.latest_log?.response === 'yes');
  const noRequirement = contacts.filter(c => c.latest_log?.response === 'no');
  
  // ALL pending follow-ups (not just today) for dashboard
  const allPendingFollowups = contacts.filter(c => {
    if (!c.latest_log?.follow_up_date) return false;
    if (c.latest_log?.follow_up_completed) return false;
    return true; // Show all pending followups regardless of date
  });

  // Today's follow-ups for notification center
  const today = dayjs().startOf('day');
  const todayFollowups = contacts.filter(c => {
    if (!c.latest_log?.follow_up_date) return false;
    if (c.latest_log?.follow_up_completed) return false;
    const followUpDate = dayjs(c.latest_log.follow_up_date).startOf('day');
    return followUpDate.isSame(today);
  });

  const stats = [
    {
      label: 'Total Contacts',
      value: contacts.length,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-500',
      filter: 'all'
    },
    {
      label: 'Contacted',
      value: contacted.length,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      iconBg: 'bg-emerald-500',
      filter: 'contacted'
    },
    {
      label: 'Not Contacted',
      value: notContacted.length,
      icon: Users,
      color: 'text-gray-500',
      bgColor: 'bg-gradient-to-br from-gray-50 to-gray-100',
      iconBg: 'bg-gray-500',
      filter: 'not_contacted'
    },
    {
      label: 'Has Requirements',
      value: hasRequirement.length,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-500',
      filter: 'has_requirement'
    },
    {
      label: 'No Requirements',
      value: noRequirement.length,
      icon: FileText,
      color: 'text-red-500',
      bgColor: 'bg-gradient-to-br from-red-50 to-red-100',
      iconBg: 'bg-red-500',
      filter: 'no_requirement'
    },
    {
      label: 'Pending Follow-ups',
      value: allPendingFollowups.length,
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-orange-100',
      iconBg: 'bg-orange-500',
      filter: 'pending_followups'
    }
  ];

  const handleExportRequirements = () => {
    window.open('http://localhost:4000/api/requirements/export', '_blank');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    try {
      // await API.post('/auth/change-password', {
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // });
      alert('Password changed successfully! (This is a demo - actual implementation requires backend API)');
      setShowChangePassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      alert('Failed to change password: ' + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-3 sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <Users className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">RecruitConnect</h1>
              <p className="text-xs text-gray-500">Track Contacts. Capture Opportunities. <span className="text-indigo-600 font-medium">by TechGene</span></p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {/* Settings Menu */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowSettingsMenu(!showSettingsMenu);
                  setShowUserDropdown(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
              {showSettingsMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-100">
                  <button 
                    onClick={() => {
                      setShowChangePassword(true);
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Change Password
                  </button>
                  <button 
                    onClick={() => {
                      alert('Notification settings feature coming soon!');
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Notification Settings
                  </button>
                  <button 
                    onClick={() => {
                      handleExportRequirements();
                      setShowSettingsMenu(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Data
                  </button>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">User</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role || 'Recruiter'}</div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button 
                onClick={() => {
                  setShowUserDropdown(!showUserDropdown);
                  setShowSettingsMenu(false);
                }}
                className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow"
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl py-2 border border-gray-100">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user?.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Shield className="w-3 h-3 text-blue-600" />
                      <p className="text-xs text-blue-600 font-medium capitalize">{user?.role}</p>
                    </div>
                  </div>
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <button
                      onClick={() => {
                        navigate('/admin/users');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      Manage Users
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Sidebar - Stats and Job Requirements */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 space-y-3">
            {/* Dashboard Overview Title */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
                Dashboard Overview
              </h3>
            </div>

            {/* Stats Cards */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              stats.map((stat) => {
                const Icon = stat.icon;
                const isActive = activeFilter === stat.filter;
                return (
                  <motion.div
                    key={stat.label}
                    onClick={() => setActiveFilter(stat.filter)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`${stat.bgColor} rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer ${
                      isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <div className={`${stat.iconBg} rounded-xl p-2 shadow-sm`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                    <div className="mt-3 h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${stat.iconBg} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min((stat.value / Math.max(contacts.length, 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Job Requirements Section */}
          <div className="p-4">
            <JobRequirements refreshTrigger={refreshTrigger} />
          </div>
        </div>

        {/* Right Content - Contact List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ContactList 
            refreshTrigger={refreshTrigger}
            onDataChange={() => setRefreshTrigger(prev => prev + 1)}
            notificationCount={todayFollowups.length}
            onNotificationClick={() => setShowNotifications(!showNotifications)}
            activeFilter={activeFilter}
            currentFilterLabel={stats.find(s => s.filter === activeFilter)?.label || 'All Contacts'}
          />

          {/* Floating Add Button with Menu */}
          <div className="fixed bottom-8 right-8 z-30">
            <AnimatePresence>
              {showAddMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  className="absolute bottom-16 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      setShowExcelImport(true);
                      setShowAddMenu(false);
                    }}
                    className="w-full px-6 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 border-b border-gray-100"
                  >
                    <Upload className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Import Excel</div>
                      <div className="text-xs text-gray-500">Bulk upload contacts</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      setShowQuickAdd(true);
                      setShowAddMenu(false);
                    }}
                    className="w-full px-6 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3"
                  >
                    <UserPlus className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-gray-900">Quick Add Contact</div>
                      <div className="text-xs text-gray-500">Add single contact</div>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all flex items-center justify-center"
            >
              {showAddMenu ? (
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 45 }}
                  className="text-3xl font-light"
                >
                  +
                </motion.div>
              ) : (
                <span className="text-3xl font-light">+</span>
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Follow-up Notifications Sidebar */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifications(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto"
            >
              <FollowUps onClose={() => setShowNotifications(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Quick Add Contact Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <QuickAddContact
            onClose={() => setShowQuickAdd(false)}
            onContactAdded={() => {
              setRefreshTrigger(prev => prev + 1);
              setShowQuickAdd(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Excel Import Modal */}
      <AnimatePresence>
        {showExcelImport && (
          <ExcelImport
            onClose={() => setShowExcelImport(false)}
            onContactAdded={() => {
              setRefreshTrigger(prev => prev + 1);
              setShowExcelImport(false);
            }}
          />
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showChangePassword && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChangePassword(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
                  </div>
                  <button
                    onClick={() => setShowChangePassword(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowChangePassword(false)}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Change Password
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={["admin", "superadmin"]}>
                <AdminUsers />
              </ProtectedRoute>
            }
          />

          {/* Protected Route - Your Original Application */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainApplication />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
