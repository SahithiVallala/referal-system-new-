import { Contact } from '../types';
import { Badge } from './ui/badge';
import { Calendar, AlertCircle } from 'lucide-react';

interface FollowUpNotificationsProps {
  contacts: Contact[];
}

export function FollowUpNotifications({ contacts }: FollowUpNotificationsProps) {
  const sortedContacts = [...contacts].sort((a, b) => {
    if (!a.followUpDate || !b.followUpDate) return 0;
    return new Date(a.followUpDate).getTime() - new Date(b.followUpDate).getTime();
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(dateString);
    followUp.setHours(0, 0, 0, 0);
    
    const diffTime = followUp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getUrgency = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const followUp = new Date(dateString);
    followUp.setHours(0, 0, 0, 0);
    
    const diffTime = followUp.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 1) return 'high';
    if (diffDays <= 3) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-3">
      {sortedContacts.map((contact) => {
        const urgency = getUrgency(contact.followUpDate!);
        return (
          <div
            key={contact.id}
            className={`p-4 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01] ${
              urgency === 'high' ? 'bg-gradient-to-r from-orange-50/70 to-red-50/50 border-orange-200' :
              urgency === 'medium' ? 'bg-gradient-to-r from-yellow-50/70 to-amber-50/50 border-yellow-200' :
              'bg-gradient-to-r from-blue-50/70 to-cyan-50/50 border-blue-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {urgency === 'high' && (
                    <div className="relative">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                    </div>
                  )}
                  <span className="text-gray-700">{contact.name}</span>
                  <Badge 
                    variant="outline" 
                    className={`
                      ${urgency === 'high' ? 'bg-orange-100/80 text-orange-700 border-orange-300 shadow-sm' :
                      urgency === 'medium' ? 'bg-yellow-100/80 text-yellow-700 border-yellow-300 shadow-sm' :
                      'bg-blue-100/80 text-blue-700 border-blue-300 shadow-sm'}
                    `}
                  >
                    {formatDate(contact.followUpDate!)}
                  </Badge>
                </div>
                <p className="text-gray-500">{contact.email}</p>
                {contact.notes && (
                  <p className="text-gray-400 mt-2 italic bg-white/60 p-2 rounded-lg">{contact.notes}</p>
                )}
              </div>
              <Calendar className={`h-5 w-5 ${
                urgency === 'high' ? 'text-orange-500' :
                urgency === 'medium' ? 'text-yellow-500' :
                'text-blue-500'
              }`} />
            </div>
          </div>
        );
      })}
    </div>
  );
}