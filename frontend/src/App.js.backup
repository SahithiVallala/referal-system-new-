import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Settings } from 'lucide-react';
import ContactList from './components/ContactList';
import Dashboard from './components/Dashboard';
import ExcelImport from './components/ExcelImport';
import FollowUps from './components/FollowUps';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [pendingFollowups, setPendingFollowups] = useState(0);
  const [showFollowupModal, setShowFollowupModal] = useState(false);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFollowupsUpdate = (count) => {
    setPendingFollowups(count);
  };

  const handleNotificationClick = () => {
    setShowFollowupModal(true);
  };

  const handleCloseModal = () => {
    setShowFollowupModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/40">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-8 py-5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Referral System</h1>
              <p className="text-xs text-gray-500">Track Contacts. Capture Opportunities.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2 px-2 py-1 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-gray-900">User</p>
                <p className="text-xs text-gray-500">Recruiter</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                U
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side - Stats Only (3 columns) */}
          <div className="lg:col-span-3">
            <Dashboard refreshTrigger={refreshTrigger} />
          </div>
          
          {/* Right Side - Contact List (9 columns) */}
          <div className="lg:col-span-9">
            <ContactList
              refreshTrigger={refreshTrigger}
              onDataChange={handleRefresh}
              notificationCount={pendingFollowups}
              onNotificationClick={handleNotificationClick}
            />
          </div>
        </div>
      </div>

      {/* Follow-ups Modal - slides from right */}
      <FollowUps 
        refreshTrigger={refreshTrigger} 
        onDataChange={handleRefresh}
        onFollowupsUpdate={handleFollowupsUpdate}
        showModal={showFollowupModal}
        onCloseModal={handleCloseModal}
      />

      {/* Excel Import FAB */}
      <ExcelImport onComplete={handleRefresh} />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 py-3 z-30 shadow-lg"
      >
        <div className="w-full px-6">
          <p className="text-center text-sm text-gray-600 font-medium">
            Built with <span className="text-pink-500">♥</span> for efficient staffing operations
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
