import type { ProspectRow, ResponseMetrics } from './types';

/** Date the rewritten, image-free email copy went live in Make (first run on this day). */
export const NEW_COPY_LAUNCH = '2026-11-20';
export const DEFAULT_WEEKLY_REPLY_GOAL = 5;

/** Days after email 1 that each step is sent (day 0 / 4 / 10 / 18 / 28 cadence). */
const STEP_OFFSET_DAYS: Record<number, number> = { 1: 0, 2: 4, 3: 10, 4: 18, 5: 28 };
const STEP_NAMES: Record<number, string> = {
  1: 'Email 1 · Two numbers', 2: 'Email 2 · The 11pm call', 3: 'Email 3 · A person, not a ticket',
  4: 'Email 4 · Second opinion', 5: 'Email 5 · Closing the file'
};
const REPLY_DATE_RE = /reply received\s+(\d{4}-\d{2}-\d{2})/i;

export type ReplyType = 'Interested' | 'Not interested' | 'Unsubscribed' | 'Replied, not yet sorted';

export function replyType(row: Pick<ProspectRow, 'disposition' | 'status2'>): ReplyType | null {
  const d = (row.disposition || '').trim().toLowerCase();
  if (d === 'interested') return 'Interested';
  if (d === 'not interested') return 'Not interested';
  if (/^unsubscribe/.test(d)) return 'Unsubscribed';
  if (d === 'replied' || /(REPLIED|CONVERTED)/i.test(row.status2 || '')) return 'Replied, not yet sorted';
  return null;
}

export function replyDate(row: Pick<ProspectRow, 'skipReason'>): string | null {
  const match = REPLY_DATE_RE.exec(row.skipReason || '');
  return match ? match[1] : null;
}

/** Estimated local date email 1 went out, worked back from the last send and the cadence. */
export function estimatedFirstSendKey(row: Pick<ProspectRow, 'dripStep' | 'lastSentAt'>, toKey: (d: Date) => string): string | null {
  const step = Math.min(Math.max(row.dripStep, 0), 5);
  if (!row.lastSentAt || step < 1) return null;
  const first = new Date(row.lastSentAt.getTime() - STEP_OFFSET_DAYS[step] * 86_400_000);
  return toKey(first);
}

function rate(n: number, d: number) { return d ? n / d : 0; }

export function buildResponseMetrics(
  rows: ProspectRow[],
  opts: { todayKey: string; weekStartKey: string; lastWeekStartKey: string; toKey: (d: Date) => string; weeklyGoal?: number; launchKey?: string }
): ResponseMetrics {
  const launch = opts.launchKey ?? NEW_COPY_LAUNCH;
  const goal = opts.weeklyGoal && opts.weeklyGoal > 0 ? opts.weeklyGoal : DEFAULT_WEEKLY_REPLY_GOAL;
  const contacted = rows.filter(r => r.dripStep > 0 || r.lastSentAt);
  const replied = contacted.filter(r => replyType(r) !== null);

  const byStep = [1, 2, 3, 4, 5].map(step => {
    const reached = contacted.filter(r => r.dripStep >= step).length;
    // The scenario stops sending once an owner replies, so drip step = the email they answered.
    const replies = replied.filter(r => Math.min(r.dripStep, 5) === step).length;
    return { step, label: STEP_NAMES[step], reached, replies, replyRate: rate(replies, reached) };
  });

  const typeOrder: ReplyType[] = ['Interested', 'Not interested', 'Unsubscribed', 'Replied, not yet sorted'];
  const types = typeOrder.map(type => ({ type, count: replied.filter(r => replyType(r) === type).length }));

  const cohortOf = (r: ProspectRow) => { const key = estimatedFirstSendKey(r, opts.toKey); return key && key >= launch ? 'new' : 'old'; };
  const cohort = (which: 'new' | 'old') => {
    const subset = contacted.filter(r => cohortOf(r) === which);
    const replies = subset.filter(r => replyType(r) !== null).length;
    return { contacted: subset.length, replies, replyRate: rate(replies, subset.length) };
  };

  const dated = replied.map(replyDate).filter((d): d is string => Boolean(d));
  const thisWeek = dated.filter(d => d >= opts.weekStartKey && d <= opts.todayKey).length;
  const lastWeek = dated.filter(d => d >= opts.lastWeekStartKey && d < opts.weekStartKey).length;

  return {
    launchDate: launch,
    goal: { weeklyTarget: goal, thisWeek, lastWeek, progress: Math.min(thisWeek / goal, 1) },
    byStep,
    types,
    copy: { newCopy: cohort('new'), oldCopy: cohort('old') },
    undatedReplies: replied.length - dated.length,
  };
}
