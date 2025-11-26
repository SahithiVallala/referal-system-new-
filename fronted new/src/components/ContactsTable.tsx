import { Contact } from '../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, FileText, Calendar, Users } from 'lucide-react';

interface ContactsTableProps {
  contacts: Contact[];
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isUpcoming = (dateString: string | null) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    const threeDays = new Date();
    threeDays.setDate(today.getDate() + 3);
    return date >= today && date <= threeDays;
  };

  if (contacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50/50 to-blue-50/40 rounded-xl border-2 border-dashed border-gray-200">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-100/80 to-purple-100/60 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Users className="h-12 w-12 text-blue-400" />
        </div>
        <p className="text-gray-600 mb-1">No contacts found</p>
        <p className="text-gray-400">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-gray-50/60 to-blue-50/40 hover:from-gray-50/60 hover:to-blue-50/40 border-b border-gray-100">
            <TableHead className="text-gray-500">Name</TableHead>
            <TableHead className="text-gray-500">Email</TableHead>
            <TableHead className="text-gray-500">Phone</TableHead>
            <TableHead className="text-gray-500">Status</TableHead>
            <TableHead className="text-gray-500">Requirement</TableHead>
            <TableHead className="text-gray-500">Follow-up</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact, index) => (
            <TableRow 
              key={contact.id} 
              className={`hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-purple-50/30 transition-colors ${
                index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
              }`}
            >
              <TableCell className="text-gray-700">{contact.name}</TableCell>
              <TableCell className="text-gray-500">{contact.email}</TableCell>
              <TableCell className="text-gray-500">{contact.phone}</TableCell>
              <TableCell>
                {contact.contacted ? (
                  <Badge className="bg-gradient-to-r from-emerald-50/80 to-green-50/60 text-emerald-600 hover:from-emerald-50/80 hover:to-green-50/60 border border-emerald-200/60 shadow-sm">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Contacted
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50/80 text-gray-500 border-gray-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Not Contacted
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {contact.hasJobRequirement ? (
                  <Badge className="bg-gradient-to-r from-purple-50/80 to-violet-50/60 text-purple-600 hover:from-purple-50/80 hover:to-violet-50/60 border border-purple-200/60 shadow-sm">
                    <FileText className="h-3 w-3 mr-1" />
                    Has JD
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50/80 text-gray-500 border-gray-200">
                    No JD
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {contact.followUpDate ? (
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${
                    isUpcoming(contact.followUpDate) 
                      ? 'bg-gradient-to-r from-orange-50/70 to-yellow-50/50 border border-orange-200/60' 
                      : 'bg-gray-50/60'
                  }`}>
                    <Calendar className={`h-3.5 w-3.5 ${isUpcoming(contact.followUpDate) ? 'text-orange-500' : 'text-gray-400'}`} />
                    <span className={`${isUpcoming(contact.followUpDate) ? 'text-orange-500' : 'text-gray-500'}`}>
                      {formatDate(contact.followUpDate)}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}