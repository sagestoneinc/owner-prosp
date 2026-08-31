import { normalizeEmailCell } from './normalize';

export interface LeadUpdatePayload {
  mls?: string; address?: string; city?: string; state?: string; zipcode?: string; county?: string;
  currentPrice?: string; listingStatus?: string; ownerRaw?: string; phone?: string; emails?: string;
}

const FIELD_COLUMNS: Record<keyof LeadUpdatePayload, string> = {
  mls:'A', address:'B', city:'C', state:'D', zipcode:'E', county:'F', currentPrice:'G', listingStatus:'H', ownerRaw:'I', phone:'J', emails:'K'
};
const MAX = 500;

export function validateLeadUpdatePayload(input: unknown): LeadUpdatePayload {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid update payload.');
  const raw = input as Record<string, unknown>;
  for (const key of Object.keys(raw)) if (!(key in FIELD_COLUMNS)) throw new Error(`Field "${key}" cannot be edited.`);
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
    } else out[key] = value as never;
  }
  return out;
}

export function buildLeadUpdateRanges(sourceTitle: string, rowNumber: number, payload: LeadUpdatePayload) {
  if (!Number.isInteger(rowNumber) || rowNumber < 2) throw new Error('Invalid lead row.');
  const title = sourceTitle.replace(/'/g, "''");
  return (Object.keys(payload) as Array<keyof LeadUpdatePayload>).map(key => ({
    range: `'${title}'!${FIELD_COLUMNS[key]}${rowNumber}`,
    values: [[payload[key] ?? '']]
  }));
}
