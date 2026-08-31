import { normalizeEmailCell } from './normalize';
import type { SourceKey } from './types';

export interface LeadUpdatePayload {
  mls?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  county?: string;
  currentPrice?: string;
  listingStatus?: string;
  ownerRaw?: string;
  phone?: string;
  emails?: string;
}

const COMMON_COLUMNS = {
  mls: 'A', address: 'B', city: 'C', state: 'D', zipcode: 'E', county: 'F', currentPrice: 'G', listingStatus: 'H', ownerRaw: 'I'
} as const;
const MAX = 500;

function columnFor(sourceKey: SourceKey, key: keyof LeadUpdatePayload): string {
  if (key === 'phone') return sourceKey === 'active' ? 'R' : 'J';
  if (key === 'emails') return sourceKey === 'active' ? 'J' : 'K';
  return COMMON_COLUMNS[key as keyof typeof COMMON_COLUMNS];
}

export function validateLeadUpdatePayload(input: unknown): LeadUpdatePayload {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid update payload.');
  const raw = input as Record<string, unknown>;
  const allowed = new Set(['mls','address','city','state','zipcode','county','currentPrice','listingStatus','ownerRaw','phone','emails']);
  for (const key of Object.keys(raw)) if (!allowed.has(key)) throw new Error(`Field "${key}" cannot be edited.`);
  const out: LeadUpdatePayload = {};
  for (const key of Object.keys(raw) as Array<keyof LeadUpdatePayload>) {
    if (typeof raw[key] !== 'string') throw new Error(`${key} must be text.`);
    const value = String(raw[key]).trim();
    if (value.length > MAX) throw new Error(`${key} is too long.`);
    if (key === 'emails') {
      if (!value) out.emails = '';
      else {
        const emails = normalizeEmailCell(value);
        if (!emails.length) throw new Error('Enter at least one valid email address.');
        out.emails = emails.join('\n');
      }
    } else {
      (out as Record<string, string>)[key] = value;
    }
  }
  return out;
}

export function buildLeadUpdateRanges(sourceKey: SourceKey, sourceTitle: string, rowNumber: number, payload: LeadUpdatePayload) {
  if (!Number.isInteger(rowNumber) || rowNumber < 2) throw new Error('Invalid lead row.');
  const title = sourceTitle.replace(/'/g, "''");
  return (Object.keys(payload) as Array<keyof LeadUpdatePayload>).map(key => ({
    range: `'${title}'!${columnFor(sourceKey, key)}${rowNumber}`,
    values: [[payload[key] ?? '']]
  }));
}
