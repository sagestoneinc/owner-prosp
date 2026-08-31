import type { RedactedLead } from './types';

export type CountyLeadState = 'all' | 'actionable' | 'incomplete' | 'bad' | 'due';
export type CountyLeadSort = 'owner' | 'property' | 'status' | 'source';

export interface CountySummary {
  county: string;
  total: number;
  actionable: number;
  incomplete: number;
  dueNow: number;
  badLeads: number;
}

function countyName(lead: RedactedLead): string {
  return lead.county.trim() || 'Unknown';
}

export function buildCountySummaries(leads: RedactedLead[]): CountySummary[] {
  const map = new Map<string, CountySummary>();
  for (const lead of leads) {
    const county = countyName(lead);
    const summary = map.get(county) ?? { county, total:0, actionable:0, incomplete:0, dueNow:0, badLeads:0 };
    summary.total += 1;
    if (!lead.badLead && !lead.stopped && !lead.completed) summary.actionable += 1;
    if (!lead.badLead && lead.missingDetails) summary.incomplete += 1;
    if (!lead.badLead && lead.dueNow) summary.dueNow += 1;
    if (lead.badLead) summary.badLeads += 1;
    map.set(county, summary);
  }
  return Array.from(map.values()).sort((a,b)=>b.total-a.total || a.county.localeCompare(b.county));
}

export function filterCountyLeads(leads: RedactedLead[], options: { county:string; state:CountyLeadState; query:string; sort:CountyLeadSort }): RedactedLead[] {
  const query = options.query.trim().toLowerCase();
  return leads.filter(lead => countyName(lead) === options.county)
    .filter(lead => {
      if (options.state === 'actionable') return !lead.badLead && !lead.stopped && !lead.completed;
      if (options.state === 'incomplete') return !lead.badLead && lead.missingDetails;
      if (options.state === 'bad') return lead.badLead;
      if (options.state === 'due') return !lead.badLead && lead.dueNow;
      return true;
    })
    .filter(lead => !query || `${lead.firstName} ${lead.address} ${lead.city} ${lead.state} ${lead.listingStatus}`.toLowerCase().includes(query))
    .sort((a,b) => {
      if (options.sort === 'property') return (a.address || '').localeCompare(b.address || '') || a.firstName.localeCompare(b.firstName);
      if (options.sort === 'status') return (a.listingStatus || '').localeCompare(b.listingStatus || '') || a.firstName.localeCompare(b.firstName);
      if (options.sort === 'source') return a.sourceKey.localeCompare(b.sourceKey) || a.firstName.localeCompare(b.firstName);
      return a.firstName.localeCompare(b.firstName) || (a.address || '').localeCompare(b.address || '');
    });
}
