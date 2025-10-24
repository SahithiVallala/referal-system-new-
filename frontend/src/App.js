import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Phone } from 'lucide-react';
import ContactList from './components/ContactList';
import Dashboard from './components/Dashboard';
import ExcelImport from './components/ExcelImport';
import FollowUps from './components/FollowUps';

export default function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen pb-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm"
      >
        <div className="w-full px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-2xl shadow-md"
              >
                <Phone className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
                  RecruitConnect
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Track Contacts. Capture Opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Dashboard & Follow-ups */}
          <div className="lg:col-span-1 space-y-6">
            <Dashboard refreshTrigger={refreshTrigger} />
            <FollowUps refreshTrigger={refreshTrigger} onDataChange={handleRefresh} />
          </div>

          {/* Right Column - Contact List */}
          <div className="lg:col-span-2">
            <ContactList refreshTrigger={refreshTrigger} onDataChange={handleRefresh} />
          </div>
        </div>
      </main>

      {/* Excel Import FAB */}
      <ExcelImport onComplete={handleRefresh} />

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3 z-30 shadow-lg"
      >
        <div className="w-full px-6">
          <p className="text-center text-sm text-gray-600">
            Built with <span className="text-pink-500">♥</span> for efficient staffing operations
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
