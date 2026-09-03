import { normalizeEmailCell } from './normalize';
import type { SheetSchema, LeadHeader } from './sheet-schema';

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

const FIELD_HEADERS: Record<keyof LeadUpdatePayload, LeadHeader> = {
  mls:'MLS #', address:'Address', city:'City', state:'State', zipcode:'Zipcode', county:'County', currentPrice:'Current Price', listingStatus:'Status', ownerRaw:'Owners Name', phone:'Phone Number', emails:'Email'
};
const MAX = 500;

export function validateLeadUpdatePayload(input: unknown): LeadUpdatePayload {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid update payload.');
  const raw = input as Record<string, unknown>;
  const allowed = new Set(Object.keys(FIELD_HEADERS));
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

export function buildLeadUpdateRanges(schema: SheetSchema, sourceTitle: string, rowNumber: number, payload: LeadUpdatePayload) {
  if (!Number.isInteger(rowNumber) || rowNumber < 2) throw new Error('Invalid lead row.');
  const title = sourceTitle.replace(/'/g, "''");
  return (Object.keys(payload) as Array<keyof LeadUpdatePayload>).map(key => ({
    range: `'${title}'!${schema.columnOf(FIELD_HEADERS[key])}${rowNumber}`,
    values: [[payload[key] ?? '']]
  }));
}
