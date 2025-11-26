import { Contact } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Users, PhoneCall, FileText, Bell } from 'lucide-react';

interface StatsPanelProps {
  contacts: Contact[];
}

export function StatsPanel({ contacts }: StatsPanelProps) {
  const totalContacts = contacts.length;
  const totalContacted = contacts.filter(c => c.contacted).length;
  const hasJobRequirements = contacts.filter(c => c.hasJobRequirement).length;
  
  // Count follow-ups that are today or in the future
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const followUpCount = contacts.filter(c => {
    if (!c.followUpDate) return false;
    const followUpDate = new Date(c.followUpDate);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate >= today;
  }).length;

  const stats = [
    {
      title: 'Total Contacts',
      value: totalContacts,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-gradient-to-br from-blue-50/80 to-blue-100/40',
      iconBg: 'bg-gradient-to-br from-blue-400 to-blue-500',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Contacted',
      value: totalContacted,
      icon: PhoneCall,
      color: 'text-emerald-500',
      bgColor: 'bg-gradient-to-br from-emerald-50/80 to-emerald-100/40',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-emerald-500',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'Has Requirements',
      value: hasJobRequirements,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-gradient-to-br from-purple-50/80 to-purple-100/40',
      iconBg: 'bg-gradient-to-br from-purple-400 to-purple-500',
      borderColor: 'border-purple-100'
    },
    {
      title: 'Pending Follow-up',
      value: followUpCount,
      icon: Bell,
      color: 'text-amber-500',
      bgColor: 'bg-gradient-to-br from-amber-50/80 to-amber-100/40',
      iconBg: 'bg-gradient-to-br from-amber-400 to-amber-500',
      borderColor: 'border-amber-100'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-gray-100 shadow-sm">
        <h3 className="text-gray-500 flex items-center gap-2">
          <div className="w-1 h-5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-full"></div>
          Dashboard Overview
        </h3>
      </div>
      
      {stats.map((stat) => (
        <div 
          key={stat.title} 
          className={`${stat.bgColor} border ${stat.borderColor} rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.02] cursor-pointer group`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="text-gray-500 mb-2">{stat.title}</p>
              <div className={`${stat.color} transition-all duration-300 group-hover:scale-110`}>
                {stat.value}
              </div>
            </div>
            <div className={`${stat.iconBg} rounded-xl p-3 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
            <div 
              className={`h-full ${stat.iconBg} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min((stat.value / totalContacts) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
}