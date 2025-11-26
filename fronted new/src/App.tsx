import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Contact } from './types';

// Mock data for demonstration
const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 234-567-8901',
    contacted: true,
    hasJobRequirement: true,
    followUpDate: '2025-11-22',
    notes: 'Interested in backend positions'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 234-567-8902',
    contacted: false,
    hasJobRequirement: false,
    followUpDate: null,
    notes: ''
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'mchen@email.com',
    phone: '+1 234-567-8903',
    contacted: true,
    hasJobRequirement: true,
    followUpDate: '2025-11-20',
    notes: 'Looking for PM roles in fintech'
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily.davis@email.com',
    phone: '+1 234-567-8904',
    contacted: true,
    hasJobRequirement: false,
    followUpDate: '2025-11-25',
    notes: 'Follow up next week'
  },
  {
    id: '5',
    name: 'David Wilson',
    email: 'dwilson@email.com',
    phone: '+1 234-567-8905',
    contacted: false,
    hasJobRequirement: true,
    followUpDate: null,
    notes: 'Has specific JD requirements'
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa.a@email.com',
    phone: '+1 234-567-8906',
    contacted: true,
    hasJobRequirement: true,
    followUpDate: '2025-11-21',
    notes: 'Reviewing JD documents'
  },
];

export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/40">
      <Dashboard contacts={contacts} setContacts={setContacts} />
    </div>
  );
}