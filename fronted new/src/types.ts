export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  contacted: boolean;
  hasJobRequirement: boolean;
  followUpDate: string | null;
  notes: string;
}

export type FilterType = 'all' | 'contacted' | 'not-contacted' | 'has-jd' | 'no-jd';