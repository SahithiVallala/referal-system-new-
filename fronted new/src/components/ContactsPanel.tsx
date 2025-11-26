import { useState, useMemo } from 'react';
import { Contact, FilterType } from '../types';
import { ContactsTable } from './ContactsTable';
import { FollowUpNotifications } from './FollowUpNotifications';
import { Bell, Search, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface ContactsPanelProps {
  contacts: Contact[];
  setContacts: (contacts: Contact[]) => void;
}

export function ContactsPanel({ contacts, setContacts }: ContactsPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(() => {
    let filtered = contacts;
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery)
      );
    }
    
    // Apply category filter
    switch (activeFilter) {
      case 'contacted':
        return filtered.filter(c => c.contacted);
      case 'not-contacted':
        return filtered.filter(c => !c.contacted);
      case 'has-jd':
        return filtered.filter(c => c.hasJobRequirement);
      case 'no-jd':
        return filtered.filter(c => !c.hasJobRequirement);
      default:
        return filtered;
    }
  }, [contacts, activeFilter, searchQuery]);

  // Get upcoming follow-ups
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingFollowUps = contacts.filter(c => {
    if (!c.followUpDate) return false;
    const followUpDate = new Date(c.followUpDate);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate >= today;
  });

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'not-contacted', label: 'Not Contacted' },
    { value: 'has-jd', label: 'Has Requirement' },
    { value: 'no-jd', label: 'No Requirement' }
  ];

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-400 to-purple-400 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/30 backdrop-blur-sm rounded-xl p-2.5">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-white">Contact Management</h2>
              <p className="text-white/80">{contacts.length} total contacts</p>
            </div>
          </div>
          {upcomingFollowUps.length > 0 && (
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="bg-white/30 backdrop-blur-sm hover:bg-white/40 text-white px-4 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2 border border-white/30 shadow-sm"
            >
              <div className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-300 rounded-full animate-pulse"></span>
              </div>
              <span>{upcomingFollowUps.length} Reminder{upcomingFollowUps.length !== 1 ? 's' : ''}</span>
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 bg-white/95 backdrop-blur-sm border-white/30 h-12 rounded-xl shadow-sm focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-gradient-to-r from-gray-50/80 to-blue-50/50 p-6 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-5 bg-gradient-to-b from-purple-400 to-purple-500 rounded-full"></div>
          <span className="text-gray-500">Filter by Category</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {filterButtons.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value as FilterType)}
              className={`px-5 py-2.5 rounded-xl transition-all duration-200 ${
                activeFilter === filter.value
                  ? 'bg-gradient-to-r from-blue-400 to-purple-400 text-white shadow-md shadow-blue-400/30 scale-105'
                  : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:border-blue-200 hover:shadow-sm'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      {showNotifications && upcomingFollowUps.length > 0 && (
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50/60 to-yellow-50/40">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-gradient-to-b from-orange-400 to-orange-500 rounded-full"></div>
            <span className="text-gray-500">Upcoming Follow-ups</span>
          </div>
          <FollowUpNotifications contacts={upcomingFollowUps} />
        </div>
      )}

      {/* Table */}
      <div className="p-6 bg-white">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></div>
          <span className="text-gray-500">
            {filteredContacts.length} Contact{filteredContacts.length !== 1 ? 's' : ''} Found
          </span>
        </div>
        <ContactsTable contacts={filteredContacts} />
      </div>
    </div>
  );
}