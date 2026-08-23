import type { RedactedLead, SourceKey } from './types';

export type LeadFilterState = 'all' | 'active' | 'stopped' | 'completed' | 'due';

export interface LeadFilters {
  query: string;
  source: 'all' | SourceKey;
  step: 'all' | string;
  state: LeadFilterState;
}

export function filterLeads(leads: RedactedLead[], filters: LeadFilters): RedactedLead[] {
  const query = filters.query.trim().toLowerCase();
  return leads.filter((lead) => {
    if (query) {
      const haystack = `${lead.firstName} ${lead.address} ${lead.city} ${lead.state}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.source !== 'all' && lead.sourceKey !== filters.source) return false;
    if (filters.step !== 'all' && lead.dripStep !== Number(filters.step)) return false;
    if (filters.state === 'active' && (lead.stopped || lead.completed)) return false;
    if (filters.state === 'stopped' && !lead.stopped) return false;
    if (filters.state === 'completed' && !lead.completed) return false;
    if (filters.state === 'due' && !lead.dueNow) return false;
    return true;
  });
}
