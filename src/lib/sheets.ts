import { getGoogleAccessToken } from './google-auth';
import { cleanAddress, displayFirstName, normalizeEmailCell, parseSheetDate } from './normalize';
import type { FullLead, ProspectRow, SourceKey } from './types';
import { toRedactedLead } from './metrics';

const DEFAULT_SPREADSHEET_ID = '1xTTb6Wl-4vSHE08VrtjMyNJUdOQqH0nxq03Y7qt4uBo';

export const SOURCE_TABS: Record<SourceKey, { title: string; label: string }> = {
  expired: { title: 'Expired Listings', label: 'Expired Listings' },
  withdrawn: { title: 'Withdrawn & Cancelled Listings', label: 'Withdrawn & Cancelled Listings' },
  active: { title: 'Active Listings', label: 'Active Listings' }
};

function cell(row: unknown[], index: number): string {
  const value = row[index];
  return value == null ? '' : String(value);
}

function parseDateWithQuality(value: unknown): { date: Date | null; malformed: number } {
  if (value == null || value === '') return { date: null, malformed: 0 };
  const date = parseSheetDate(value);
  return { date, malformed: date ? 0 : 1 };
}

export function mapSheetRows(sourceKey: SourceKey, values: unknown[][], startRow = 2): ProspectRow[] {
  const source = SOURCE_TABS[sourceKey];
  return values
    .map((row, index) => {
      const next = parseDateWithQuality(row[14]);
      const last = parseDateWithQuality(row[15]);
      const ownerRaw = cell(row, 8);
      return {
        sourceKey,
        sourceLabel: source.label,
        rowNumber: startRow + index,
        mls: cell(row, 0),
        address: cleanAddress(row[1]),
        city: cleanAddress(row[2]),
        state: cleanAddress(row[3]),
        zipcode: cell(row, 4).trim(),
        county: cleanAddress(row[5]),
        currentPrice: cell(row, 6).trim(),
        listingStatus: cleanAddress(row[7]),
        ownerRaw,
        firstName: displayFirstName(ownerRaw),
        phone: cell(row, 9).trim(),
        emails: normalizeEmailCell(row[10]),
        firstContact: cell(row, 11).trim(),
        status2: cell(row, 12).trim(),
        dripStep: Math.max(0, Math.min(5, Number.parseInt(cell(row, 13), 10) || 0)),
        nextSendAt: next.date,
        lastSentAt: last.date,
        stoppedRaw: cell(row, 16).trim(),
        variant: cell(row, 17).trim().toUpperCase(),
        malformedDateCount: next.malformed + last.malformed
      } satisfies ProspectRow;
    })
    .filter(row => {
      return Boolean(
        row.mls || row.address || row.ownerRaw || row.phone || row.emails.length ||
        row.listingStatus || row.dripStep || row.lastSentAt || row.nextSendAt
      );
    });
}

export function parseLeadId(id: string): { sourceKey: SourceKey; rowNumber: number } | null {
  const match = /^(expired|withdrawn|active):(\d+)$/.exec(id);
  if (!match) return null;
  const rowNumber = Number(match[2]);
  if (!Number.isInteger(rowNumber) || rowNumber < 2) return null;
  return { sourceKey: match[1] as SourceKey, rowNumber };
}

function spreadsheetId(): string {
  return process.env.GOOGLE_SPREADSHEET_ID?.trim() || DEFAULT_SPREADSHEET_ID;
}

async function googleJson(url: string): Promise<any> {
  const token = await getGoogleAccessToken();
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
    cache: 'no-store'
  });
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json() as { error?: { status?: string; message?: string } };
      detail = [body.error?.status, body.error?.message].filter(Boolean).join(': ');
    } catch {
      detail = '';
    }
    throw new Error(`Google Sheets request failed (${response.status})${detail ? `: ${detail}` : ''}.`);
  }
  return response.json();
}

export async function fetchAllSourceRows(): Promise<ProspectRow[]> {
  const id = encodeURIComponent(spreadsheetId());
  const params = new URLSearchParams();
  (Object.keys(SOURCE_TABS) as SourceKey[]).forEach(key => {
    params.append('ranges', `'${SOURCE_TABS[key].title.replace(/'/g, "''")}'!A2:R`);
  });
  params.set('majorDimension', 'ROWS');
  params.set('valueRenderOption', 'FORMATTED_VALUE');
  params.set('dateTimeRenderOption', 'FORMATTED_STRING');
  const json = await googleJson(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchGet?${params.toString()}`) as {
    valueRanges?: Array<{ values?: unknown[][] }>;
  };
  const keys = Object.keys(SOURCE_TABS) as SourceKey[];
  const ranges = json.valueRanges ?? [];
  return keys.flatMap((key, i) => mapSheetRows(key, ranges[i]?.values ?? [], 2));
}

export async function fetchLeadById(id: string): Promise<FullLead | null> {
  const parsed = parseLeadId(id);
  if (!parsed) return null;
  const { sourceKey, rowNumber } = parsed;
  const title = SOURCE_TABS[sourceKey].title.replace(/'/g, "''");
  const range = encodeURIComponent(`'${title}'!A${rowNumber}:R${rowNumber}`);
  const sid = encodeURIComponent(spreadsheetId());
  const json = await googleJson(`https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${range}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`) as { values?: unknown[][] };
  const row = mapSheetRows(sourceKey, json.values ?? [], rowNumber)[0];
  if (!row) return null;
  return {
    ...toRedactedLead(row),
    mls: row.mls,
    zipcode: row.zipcode,
    county: row.county,
    currentPrice: row.currentPrice,
    ownerRaw: row.ownerRaw,
    phone: row.phone,
    emails: row.emails,
    firstContact: row.firstContact
  };
}
