import { parseSheetDate } from './normalize';
import type { EmailActivityRow, EmailTrackingMetrics } from './types';

export const DEFAULT_SENDER_EMAIL = 'jess.seeto@jeselcura.me';

function cell(row: unknown[], index: number): string {
  const value = row[index];
  return value == null ? '' : String(value).trim();
}

export function mapEmailActivityRows(values: unknown[][], startRow = 2): EmailActivityRow[] {
  return values.map((row, index) => ({
    rowNumber: startRow + index,
    trackingId: cell(row, 0),
    source: cell(row, 1),
    sourceRow: Number.parseInt(cell(row, 2), 10) || 0,
    mls: cell(row, 3),
    propertyAddress: cell(row, 4),
    recipientEmail: cell(row, 5),
    variant: cell(row, 6).toUpperCase(),
    dripStep: Number.parseInt(cell(row, 7), 10) || 0,
    subject: cell(row, 8),
    zohoMessageId: cell(row, 9),
    sentAt: parseSheetDate(row[10]),
    validationState: cell(row, 11),
    opened: /^yes$/i.test(cell(row, 12)) || (Number.parseInt(cell(row, 15), 10) || 0) > 0,
    firstOpenedAt: parseSheetDate(row[13]),
    lastOpenedAt: parseSheetDate(row[14]),
    openCount: Number.parseInt(cell(row, 15), 10) || 0,
    trackingType: cell(row, 16),
    notes: cell(row, 17),
    senderEmail: cell(row, 18).toLowerCase() || DEFAULT_SENDER_EMAIL
  })).filter(row => Boolean(row.trackingId || row.recipientEmail || row.zohoMessageId));
}

export function buildEmailTrackingMetrics(rows: EmailActivityRow[]): EmailTrackingMetrics {
  const emailsSent = rows.length;
  const trackedOpens = rows.filter(row => row.opened).length;
  const byVariant = Object.fromEntries(['A', 'B'].map(variant => {
    const subset = rows.filter(row => row.variant === variant);
    const opened = subset.filter(row => row.opened).length;
    return [variant, {
      emailsSent: subset.length,
      trackedOpens: opened,
      trackedOpenRate: subset.length ? opened / subset.length : 0
    }];
  })) as EmailTrackingMetrics['byVariant'];
  return {
    emailsSent,
    trackedOpens,
    notOpened: Math.max(0, emailsSent - trackedOpens),
    trackedOpenRate: emailsSent ? trackedOpens / emailsSent : 0,
    byVariant
  };
}
