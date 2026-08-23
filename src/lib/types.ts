export type SourceKey = 'expired' | 'withdrawn' | 'active';

export interface ProspectRow {
  sourceKey: SourceKey;
  sourceLabel: string;
  rowNumber: number;
  mls: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  county: string;
  currentPrice: string;
  listingStatus: string;
  ownerRaw: string;
  firstName: string;
  phone: string;
  emails: string[];
  firstContact: string;
  status2: string;
  dripStep: number;
  nextSendAt: Date | null;
  lastSentAt: Date | null;
  stoppedRaw: string;
  variant: string;
  malformedDateCount: number;
}

export interface RedactedLead {
  id: string;
  firstName: string;
  address: string;
  city: string;
  state: string;
  listingStatus: string;
  sourceKey: SourceKey;
  sourceLabel: string;
  dripStep: number;
  lastSentAt: string | null;
  nextSendAt: string | null;
  stopped: boolean;
  outcome: string;
  variant: string;
  dueNow: boolean;
  completed: boolean;
}

export interface FullLead extends RedactedLead {
  mls: string;
  zipcode: string;
  county: string;
  currentPrice: string;
  ownerRaw: string;
  phone: string;
  emails: string[];
  firstContact: string;
}

export interface DashboardData {
  fetchedAt: string;
  timezone: string;
  headline: {
    totalProspects: number;
    withEmail: number;
    activeSequences: number;
    dueNow: number;
    sentToday: number;
    sentThisWeek: number;
    contacted: number;
    completed: number;
    stopped: number;
    knownReplies: number;
  };
  sequence: Array<{ step: number; label: string; count: number }>;
  sources: Array<{ sourceKey: SourceKey; label: string; total: number; withEmail: number; active: number; due: number; contacted: number; stopped: number }>;
  variants: Array<{ variant: string; prospects: number; contacted: number; knownReplies: number; knownReplyRate: number }>;
  abReadout: string;
  upcoming: RedactedLead[];
  recent: RedactedLead[];
  leads: RedactedLead[];
  dataQuality: { noEmail: number; malformedDates: number; companyOnlyOwners: number };
}
