import { Contact, FilterType } from '../types';
import { StatsPanel } from './StatsPanel';
import { ContactsPanel } from './ContactsPanel';
import { Users } from 'lucide-react';

interface DashboardProps {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
}

export function Dashboard({ contacts, setContacts }: DashboardProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-100 px-8 py-5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center shadow-sm">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-blue-500">Referral System</h1>
              <p className="text-gray-400">Track Contacts. Capture Opportunities.</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-gray-400">Total Contacts</p>
              <p className="text-blue-500">{contacts.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side - Stats */}
          <div className="lg:col-span-3">
            <StatsPanel contacts={contacts} />
          </div>
          
          {/* Right Side - Contacts List */}
          <div className="lg:col-span-9">
            <ContactsPanel contacts={contacts} setContacts={setContacts} />
          </div>
        </div>
      </div>
    </div>
  );
}