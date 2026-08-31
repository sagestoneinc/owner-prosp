import type { RedactedLead, SourceKey } from './types';

export type LeadFilterState = 'all' | 'active' | 'stopped' | 'completed' | 'due';
export type LeadDetailsFilter = 'all' | 'missing' | 'complete';
export type LeadDispositionFilter = 'active' | 'bad';

export interface LeadFilters {
  query: string;
  source: 'all' | SourceKey;
  step: 'all' | string;
  state: LeadFilterState;
  details: LeadDetailsFilter;
  disposition: LeadDispositionFilter;
}

export function filterLeads(leads: RedactedLead[], filters: LeadFilters): RedactedLead[] {
  const query = filters.query.trim().toLowerCase();
  return leads.filter((lead) => {
    if (filters.disposition === 'active' && lead.badLead) return false;
    if (filters.disposition === 'bad' && !lead.badLead) return false;
    if (query) {
      const haystack = `${lead.firstName} ${lead.address} ${lead.city} ${lead.state}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (filters.source !== 'all' && lead.sourceKey !== filters.source) return false;
    if (filters.step !== 'all' && lead.dripStep !== Number(filters.step)) return false;
    if (filters.state === 'active' && (lead.stopped || lead.completed || lead.badLead)) return false;
    if (filters.state === 'stopped' && !lead.stopped) return false;
    if (filters.state === 'completed' && !lead.completed) return false;
    if (filters.state === 'due' && !lead.dueNow) return false;
    if (filters.details === 'missing' && !lead.missingDetails) return false;
    if (filters.details === 'complete' && lead.missingDetails) return false;
    return true;
  });
}
