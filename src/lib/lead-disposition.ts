import type { SheetSchema } from './sheet-schema';

/**
 * Lead Disposition values the dashboard may write. The Make automation can also
 * write its own values (e.g. "Replied", "In sequence", "Completed"); those are
 * read and classified below but are not offered for manual selection.
 */
export const OUTCOME_DISPOSITIONS = [
  'Interested',
  'Call booked',
  'Agreement signed',
  'Already managed',
  'Wants to sell',
  'Self-managing',
  'Not interested',
  'Wrong person',
  'Unsubscribe'
] as const;

export const LEAD_DISPOSITIONS = ['Bad Lead', ...OUTCOME_DISPOSITIONS] as const;

export type LeadDisposition = typeof LEAD_DISPOSITIONS[number] | '';

export type DispositionCategory = 'bad' | 'positive' | 'reply' | 'unsubscribe' | 'none';

const POSITIVE_RE = /^(interested|call booked|agreement signed)$/i;
// Any human response that ends the drip (positive or not).
const REPLY_RE = /^(replied|interested|call booked|agreement signed|already managed|wants to sell|self-managing|not interested|wrong person)$/i;
const UNSUBSCRIBE_RE = /^(unsubscribe|unsubscribed)$/i;

export function validateDispositionPayload(input: unknown): { disposition: LeadDisposition } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid disposition payload.');
  const raw = input as Record<string, unknown>;
  const keys = Object.keys(raw);
  if (keys.length !== 1 || keys[0] !== 'disposition') throw new Error('Only disposition can be changed here.');
  if (raw.disposition !== '' && !(LEAD_DISPOSITIONS as readonly unknown[]).includes(raw.disposition)) throw new Error('Invalid lead disposition.');
  return { disposition: raw.disposition as LeadDisposition };
}

export function buildDispositionRange(schema: SheetSchema, sourceTitle: string, rowNumber: number, disposition: LeadDisposition) {
  if (!Number.isInteger(rowNumber) || rowNumber < 2) throw new Error('Invalid lead row.');
  const title = sourceTitle.replace(/'/g, "''");
  return { range: `'${title}'!${schema.columnOf('Lead Disposition')}${rowNumber}`, values: [[disposition]] };
}

/**
 * All sheet writes for a disposition change. Reply outcomes also set Stopped = "Yes":
 * the live Make scenario only skips a fixed set of Lead Disposition values, but it always
 * skips Stopped = Yes, so this guarantees no further drip email after any outcome.
 * Clearing a disposition never re-enables sending (Stopped is left as-is).
 */
export function buildDispositionRanges(schema: SheetSchema, sourceTitle: string, rowNumber: number, disposition: LeadDisposition) {
  const ranges: Array<{ range: string; values: string[][] }> = [buildDispositionRange(schema, sourceTitle, rowNumber, disposition)];
  if (isStopDisposition(disposition)) {
    const title = sourceTitle.replace(/'/g, "''");
    ranges.push({ range: `'${title}'!${schema.columnOf('Stopped')}${rowNumber}`, values: [['Yes']] });
  }
  return ranges;
}

export function isBadLeadDisposition(value: string | null | undefined): boolean {
  return (value || '').trim().toLowerCase() === 'bad lead';
}

export function dispositionCategory(value: string | null | undefined): DispositionCategory {
  const v = (value || '').trim();
  if (!v) return 'none';
  if (isBadLeadDisposition(v)) return 'bad';
  if (POSITIVE_RE.test(v)) return 'positive';
  if (REPLY_RE.test(v)) return 'reply';
  if (UNSUBSCRIBE_RE.test(v)) return 'unsubscribe';
  return 'none';
}

/** A human reply was received (positive or negative). Unsubscribes are not replies. */
export function isReplyDisposition(value: string | null | undefined): boolean {
  const c = dispositionCategory(value);
  return c === 'positive' || c === 'reply';
}

/** The disposition means the owner must not receive further drip emails. */
export function isStopDisposition(value: string | null | undefined): boolean {
  const c = dispositionCategory(value);
  return c === 'positive' || c === 'reply' || c === 'unsubscribe';
}

export function isPositiveDisposition(value: string | null | undefined): boolean {
  return dispositionCategory(value) === 'positive';
}
