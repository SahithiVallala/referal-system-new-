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
    <div className="min-h-screen pb-20 bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40 shadow-sm"
      >
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-2xl shadow-lg"
              >
                <Phone className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
                  RecruitConnect
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Your Smart Staffing Dashboard
                </p>
              </div>
            </div>
            {/* Excel Import is now a button in the header */}
            <ExcelImport onComplete={handleRefresh} />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="w-full px-6 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          <Dashboard refreshTrigger={refreshTrigger} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ContactList refreshTrigger={refreshTrigger} onDataChange={handleRefresh} />
            </div>
            <div className="lg:col-span-1">
              <FollowUps refreshTrigger={refreshTrigger} onDataChange={handleRefresh} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-white/90 backdrop-blur-md border-t border-gray-200 py-4 z-30"
      >
        <div className="w-full px-6">
          <p className="text-center text-sm text-gray-500">
            RecruitConnect | Streamlining Your Recruitment Workflow
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
