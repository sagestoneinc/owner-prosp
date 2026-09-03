export const REQUIRED_LEAD_HEADERS = [
  'MLS #','Address','City','State','Zipcode','County','Current Price','Status','Owners Name','Phone Number','Email','First Contact','Status 2','Drip Step','Next Send At','Last Sent At','Stopped','Variant','Skip Reason','Lead Disposition'
] as const;

export type LeadHeader = typeof REQUIRED_LEAD_HEADERS[number];

function normalizeHeader(value: unknown): string {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

export function columnLetter(index: number): string {
  if (!Number.isInteger(index) || index < 0) throw new Error('Invalid column index.');
  let n = index + 1;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

export interface SheetSchema {
  indexOf(header: LeadHeader): number;
  columnOf(header: LeadHeader): string;
}

export function buildSheetSchema(sheetTitle: string, headers: unknown[]): SheetSchema {
  const positions = new Map<string, number[]>();
  headers.forEach((value, index) => {
    const key = normalizeHeader(value);
    if (!key) return;
    positions.set(key, [...(positions.get(key) ?? []), index]);
  });
  for (const header of REQUIRED_LEAD_HEADERS) {
    const indexes = positions.get(normalizeHeader(header)) ?? [];
    if (indexes.length === 0) throw new Error(`${sheetTitle} is missing required header "${header}".`);
    if (indexes.length > 1) throw new Error(`${sheetTitle} has duplicate header "${header}".`);
  }
  return {
    indexOf(header) { return positions.get(normalizeHeader(header))![0]; },
    columnOf(header) { return columnLetter(positions.get(normalizeHeader(header))![0]); }
  };
}
