import { cleanAddress, normalizeEmailCell } from './normalize';
import type { AgentReferralSummary } from './types';

export const LISTING_AGENTS_TAB = 'Listing Agents';

export interface AgentRow {
  rowNumber: number;
  agent: string;
  office: string;
  county: string;
  status: string;
  emails: string[];
  firstContact: string;
  status2: string;
}

function normalizeHeader(value: unknown): string { return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase(); }

/**
 * Maps the Listing Agents tab by header name. Columns are optional so a partially
 * populated tab never breaks the dashboard; missing columns read as blank.
 */
export function mapAgentRows(headers: unknown[], values: unknown[][], startRow = 2): AgentRow[] {
  const index = new Map<string, number>();
  headers.forEach((h, i) => { const key = normalizeHeader(h); if (key && !index.has(key)) index.set(key, i); });
  const at = (row: unknown[], name: string) => { const i = index.get(name); return i == null || row[i] == null ? '' : String(row[i]); };
  return values.map((row, i) => ({
    rowNumber: startRow + i,
    agent: cleanAddress(at(row, 'listing agent')),
    office: cleanAddress(at(row, 'listing office')),
    county: cleanAddress(at(row, 'county')),
    status: cleanAddress(at(row, 'status')),
    emails: normalizeEmailCell(at(row, 'email')),
    firstContact: at(row, 'first contact').trim(),
    status2: at(row, 'status 2').trim()
  })).filter(row => Boolean(row.agent || row.emails.length));
}

const INTERESTED_RE = /interested/i;
const NOT_INTERESTED_RE = /not interested/i;
const SIGNED_RE = /referral agreement signed|agreement signed/i;
const REFERRED_RE = /referred owner/i;
const UNSUBSCRIBE_RE = /unsubscribe/i;

function agentKey(row: AgentRow): string {
  return row.emails[0] || `${row.agent.toLowerCase()}|${row.office.toLowerCase()}`;
}

/** Aggregates agents (one per unique email or name+office). Contains no PII. */
export function buildAgentReferralSummary(rows: AgentRow[]): AgentReferralSummary {
  const agents = new Map<string, AgentRow[]>();
  for (const row of rows) { const key = agentKey(row); agents.set(key, [...(agents.get(key) ?? []), row]); }
  const groups = Array.from(agents.values());
  const any = (group: AgentRow[], test: (r: AgentRow) => boolean) => group.some(test);
  const counties = new Map<string, number>();
  for (const group of groups) { const county = group[0].county || 'Unknown'; counties.set(county, (counties.get(county) ?? 0) + 1); }
  return {
    listingRows: rows.length,
    uniqueAgents: groups.length,
    withEmail: groups.filter(g => any(g, r => r.emails.length > 0)).length,
    contacted: groups.filter(g => any(g, r => Boolean(r.firstContact || r.status2))).length,
    interested: groups.filter(g => any(g, r => INTERESTED_RE.test(r.status2) && !NOT_INTERESTED_RE.test(r.status2))).length,
    agreementsSigned: groups.filter(g => any(g, r => SIGNED_RE.test(r.status2))).length,
    referredOwners: rows.filter(r => REFERRED_RE.test(r.status2)).length,
    unsubscribed: groups.filter(g => any(g, r => UNSUBSCRIBE_RE.test(r.status2))).length,
    multiListingAgents: groups.filter(g => g.length > 1).length,
    topCounties: Array.from(counties.entries()).map(([county, count]) => ({ county, count })).sort((a, b) => b.count - a.count || a.county.localeCompare(b.county)).slice(0, 6)
  };
}
