import type { SheetSchema } from './sheet-schema';

export type LeadDisposition = 'Bad Lead' | '';

export function validateDispositionPayload(input: unknown): { disposition: LeadDisposition } {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Invalid disposition payload.');
  const raw = input as Record<string, unknown>;
  const keys = Object.keys(raw);
  if (keys.length !== 1 || keys[0] !== 'disposition') throw new Error('Only disposition can be changed here.');
  if (raw.disposition !== '' && raw.disposition !== 'Bad Lead') throw new Error('Invalid lead disposition.');
  return { disposition: raw.disposition as LeadDisposition };
}

export function buildDispositionRange(schema: SheetSchema, sourceTitle: string, rowNumber: number, disposition: LeadDisposition) {
  if (!Number.isInteger(rowNumber) || rowNumber < 2) throw new Error('Invalid lead row.');
  const title = sourceTitle.replace(/'/g, "''");
  return { range: `'${title}'!${schema.columnOf('Lead Disposition')}${rowNumber}`, values: [[disposition]] };
}

export function isBadLeadDisposition(value: string | null | undefined): boolean {
  return (value || '').trim().toLowerCase() === 'bad lead';
}
