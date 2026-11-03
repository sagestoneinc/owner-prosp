import type { AgentReferralSummary, DashboardData, DayOfWeekPerformance, EmailActivityRow, MissingField, ProspectRow, RedactedLead, SenderPerformance, SourceKey, Track, TrackSummary } from './types';
import { buildEmailTrackingMetrics } from './email-activity';
import { dispositionCategory, isBadLeadDisposition, isPositiveDisposition, isReplyDisposition, isStopDisposition } from './lead-disposition';

export const DASHBOARD_TIMEZONE = 'America/New_York';

const STEP_LABELS: Record<number, string> = {
  0: 'Not contacted', 1: 'Day 0 · Two numbers on the property', 2: 'Day 4 · The 11pm call',
  3: 'Day 10 · A person, not a queue', 4: 'Day 18 · Already have a manager?', 5: 'Day 28 · Closing your file'
};
const STOP_REASON_RE = /(REPLIED|CONVERTED|UNSUBSCRIBED|UNSUBSCRIBE|STOP|DO NOT CONTACT|BOUNCED)/i;
const REPLY_RE = /(REPLIED|CONVERTED)/i;
const POSITIVE_STATUS_RE = /CONVERTED/i;
// The streamlined Make automation (Oct 2026) records outcomes in Lead Disposition instead of Status 2.
// Disposition classification (reply / positive / unsubscribe) lives in lead-disposition.ts.
const WEEKDAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'] as const;

function localDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: DASHBOARD_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' }).formatToParts(date);
  const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return { year: Number(map.year), month: Number(map.month), day: Number(map.day), weekday: map.weekday };
}
function dateKey(date: Date): string { const { year, month, day } = localDateParts(date); return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`; }
function weekStartKey(date: Date): string {
  const { year, month, day, weekday } = localDateParts(date); const weekdays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const idx = weekdays.indexOf(weekday); const mondayOffset = idx === 0 ? -6 : 1 - idx; const localNoonUtc = new Date(Date.UTC(year, month - 1, day, 12));
  localNoonUtc.setUTCDate(localNoonUtc.getUTCDate() + mondayOffset); return localNoonUtc.toISOString().slice(0,10);
}
function weekdayIndex(date: Date): number { const short = localDateParts(date).weekday; return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(short); }
function isKnownReply(row: ProspectRow) { return REPLY_RE.test(row.status2 || '') || isReplyDisposition(row.disposition); }
function isPositiveReply(row: ProspectRow) { return POSITIVE_STATUS_RE.test(row.status2 || '') || isPositiveDisposition(row.disposition); }
function isCompleted(row: ProspectRow) { return row.dripStep >= 5; }
function isBadLead(row: ProspectRow) { return isBadLeadDisposition(row.disposition); }
function isStopped(row: ProspectRow) { if (isBadLead(row)) return false; if (isCompleted(row) && !STOP_REASON_RE.test(row.status2 || '')) return false; return /^yes$/i.test(row.stoppedRaw.trim()) || STOP_REASON_RE.test(row.status2 || '') || isStopDisposition(row.disposition); }
function isActive(row: ProspectRow) { return !isBadLead(row) && row.emails.length > 0 && !isStopped(row) && !isCompleted(row); }
function isDue(row: ProspectRow, now: Date) { return isActive(row) && (!row.nextSendAt || row.nextSendAt.getTime() <= now.getTime()); }
function emailsSentFromSteps(subset: ProspectRow[]) { return subset.reduce((sum, r) => sum + Math.min(Math.max(r.dripStep, 0), 5), 0); }
function prospectKey(sourceKey: SourceKey, rowNumber: number) { return `${sourceKey}:${rowNumber}`; }
function activitySourceKey(source: string): SourceKey | null { const value=source.trim().toLowerCase(); if(value.startsWith('expired'))return'expired'; if(value.startsWith('withdrawn')||value.startsWith('cancelled'))return'withdrawn'; if(value.startsWith('active'))return'active'; return null; }
function activityProspectKey(row: EmailActivityRow): string | null { const sourceKey=activitySourceKey(row.source); return sourceKey&&row.sourceRow>0?prospectKey(sourceKey,row.sourceRow):null; }
function missingFields(row: ProspectRow): MissingField[] {
  const missing: MissingField[] = [];
  if (!row.ownerRaw.trim() || row.firstName === 'Owner') missing.push('owner');
  if (!row.emails.length) missing.push('email');
  if (!row.phone.trim()) missing.push('phone');
  if (!row.address.trim()) missing.push('address');
  return missing;
}

export const TRACK_DEFS: Record<Track, { label: string; ownerEmailAllowed: boolean; gate: string | null }> = {
  T1: { label: 'Expired', ownerEmailAllowed: true, gate: null },
  T2: { label: 'Cancelled', ownerEmailAllowed: true, gate: null },
  T3: { label: 'Withdrawn', ownerEmailAllowed: false, gate: 'Owner email gated until the listing agreement ends. Route to agent referral.' },
  T4: { label: 'Active listing', ownerEmailAllowed: false, gate: 'Owner email paused pending broker review. Route to agent referral.' },
  T5: { label: 'Investor / LLC owner', ownerEmailAllowed: true, gate: null },
  T6: { label: 'No email (enrich or mail)', ownerEmailAllowed: false, gate: 'No email on file. Enrich (skip trace) or use direct mail.' }
};

/** Assigns the action-plan outreach track. Compliance gates (T3/T4) win over channel and owner type. */
export function trackOf(row: ProspectRow): Track {
  if (row.sourceKey === 'active') return 'T4';
  if (row.sourceKey === 'withdrawn' && /withdrawn/i.test(row.listingStatus)) return 'T3';
  if (row.emails.length === 0) return 'T6';
  if (row.ownerRaw.trim() && row.firstName === 'Owner') return 'T5';
  return row.sourceKey === 'expired' ? 'T1' : 'T2';
}

export function toRedactedLead(row: ProspectRow, now = new Date()): RedactedLead {
  const missing = missingFields(row); const badLead=isBadLead(row); const track=trackOf(row);
  return { id:`${row.sourceKey}:${row.rowNumber}`, firstName:row.firstName, address:row.address, city:row.city, state:row.state, county:row.county, listingStatus:row.listingStatus,
    sourceKey:row.sourceKey, sourceLabel:row.sourceLabel, dripStep:row.dripStep, lastSentAt:row.lastSentAt?.toISOString() ?? null,
    nextSendAt:row.nextSendAt?.toISOString() ?? null, stopped:isStopped(row), outcome:row.status2, variant:row.variant, disposition:row.disposition, badLead, dueNow:isDue(row,now), completed:isCompleted(row), missingDetails:missing.length>0, missingFields:missing, track, ownerEmailAllowed:TRACK_DEFS[track].ownerEmailAllowed };
}

function abReadout(variants: DashboardData['variants']): string {
  const a = variants.find(v=>v.variant==='A') || { contacted:0, knownReplyRate:0 };
  const b = variants.find(v=>v.variant==='B') || { contacted:0, knownReplyRate:0 };
  if (a.contacted + b.contacted === 0) return 'No contacted prospects have a variant assigned yet.';
  if (a.contacted < 300 || b.contacted < 300) return `Too early to call. ${a.contacted} contacted on A and ${b.contacted} on B. Treat any gap as directional until each arm reaches about 300 contacted prospects.`;
  if (a.knownReplyRate === b.knownReplyRate) return `Known reply rate is even at ${(a.knownReplyRate*100).toFixed(1)}%.`;
  const leader = a.knownReplyRate > b.knownReplyRate ? 'A':'B'; const diff = Math.abs(a.knownReplyRate-b.knownReplyRate)*100;
  return `Variant ${leader} leads known reply rate by ${diff.toFixed(1)} percentage points. Confirm statistically before retiring the other arm.`;
}

function buildSenderPerformance(rows: ProspectRow[], emailActivity: EmailActivityRow[]): SenderPerformance[] {
  const prospects = new Map(rows.map(row => [prospectKey(row.sourceKey, row.rowNumber), row]));
  const latestSenderByProspect = new Map<string, { sender: string; sentAt: number }>();
  for (const activity of emailActivity) { const key=activityProspectKey(activity); if(!key||!prospects.has(key))continue; const sentAt=activity.sentAt?.getTime()??0; const current=latestSenderByProspect.get(key); if(!current||sentAt>=current.sentAt)latestSenderByProspect.set(key,{sender:activity.senderEmail,sentAt}); }
  const senders=Array.from(new Set(emailActivity.map(row=>row.senderEmail).filter(Boolean))).sort();
  return senders.map(sender=>{ const activity=emailActivity.filter(row=>row.senderEmail===sender); const trackedOpens=activity.filter(row=>row.opened).length; const attributedKeys=Array.from(latestSenderByProspect.entries()).filter(([,value])=>value.sender===sender).map(([key])=>key); const attributedRows=attributedKeys.map(key=>prospects.get(key)).filter((row):row is ProspectRow=>Boolean(row)); const knownReplies=attributedRows.filter(isKnownReply).length; return {sender,emailsSent:activity.length,trackedOpens,trackedOpenRate:activity.length?trackedOpens/activity.length:0,contactedProspects:attributedRows.length,knownReplies,knownReplyRate:attributedRows.length?knownReplies/attributedRows.length:0}; });
}
function buildDayOfWeekPerformance(rows: ProspectRow[], emailActivity: EmailActivityRow[]): DayOfWeekPerformance[] {
  return WEEKDAYS.map((day,dayIndex)=>{ const activity=emailActivity.filter(row=>row.sentAt&&weekdayIndex(row.sentAt)===dayIndex); const trackedOpens=activity.filter(row=>row.opened).length; const contactedRows=rows.filter(row=>row.lastSentAt&&weekdayIndex(row.lastSentAt)===dayIndex); const knownReplies=contactedRows.filter(isKnownReply).length; return {day,dayIndex,emailsSent:activity.length,trackedOpens,trackedOpenRate:activity.length?trackedOpens/activity.length:0,contactedProspects:contactedRows.length,knownReplies,knownReplyRate:contactedRows.length?knownReplies/contactedRows.length:0}; });
}

function buildTrackSummaries(actionableRows: ProspectRow[]): TrackSummary[] {
  return (Object.keys(TRACK_DEFS) as Track[]).map(track => {
    const subset = actionableRows.filter(r => trackOf(r) === track); const def = TRACK_DEFS[track];
    return { track, label: def.label, ownerEmailAllowed: def.ownerEmailAllowed, gate: def.gate, total: subset.length, withEmail: subset.filter(r => r.emails.length > 0).length,
      contacted: subset.filter(r => r.lastSentAt || r.dripStep > 0).length, knownReplies: subset.filter(isKnownReply).length, positiveReplies: subset.filter(isPositiveReply).length };
  });
}

function replyReasonOf(row: ProspectRow): string | null {
  const disposition = (row.disposition || '').trim(); const category = dispositionCategory(disposition);
  if (category === 'positive' || category === 'reply' || category === 'unsubscribe') return disposition.toLowerCase() === 'replied' ? 'Replied (no reason logged)' : disposition;
  if (/UNSUBSCRIB/i.test(row.status2 || '')) return 'Unsubscribe';
  if (REPLY_RE.test(row.status2 || '')) return POSITIVE_STATUS_RE.test(row.status2) ? 'Converted' : 'Replied (no reason logged)';
  return null;
}

function buildReplyReasons(actionableRows: ProspectRow[]): Array<{ reason: string; count: number }> {
  const counts = new Map<string, number>();
  for (const row of actionableRows) { const reason = replyReasonOf(row); if (reason) counts.set(reason, (counts.get(reason) ?? 0) + 1); }
  return Array.from(counts.entries()).map(([reason, count]) => ({ reason, count })).sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));
}

export function buildDashboardData(rows: ProspectRow[], now = new Date(), emailActivity: EmailActivityRow[] = [], extras: { agents?: AgentReferralSummary | null; warnings?: string[] } = {}): DashboardData {
  const tracking=buildEmailTrackingMetrics(emailActivity); const today=dateKey(now); const monday=weekStartKey(now); const actionableRows=rows.filter(r=>!isBadLead(r));
  const totalProspects=rows.length; const withEmail=rows.filter(r=>r.emails.length>0).length; const activeSequences=actionableRows.filter(isActive).length; const dueNow=actionableRows.filter(r=>isDue(r,now)).length; const badLeads=rows.filter(isBadLead).length;
  const contactedRows=actionableRows.filter(r=>r.lastSentAt||r.dripStep>0); const completed=actionableRows.filter(isCompleted).length; const stopped=actionableRows.filter(r=>isStopped(r)&&!isCompleted(r)).length; const knownReplies=actionableRows.filter(isKnownReply).length;
  const positiveReplies=actionableRows.filter(isPositiveReply).length; const callsBooked=actionableRows.filter(r=>/^(call booked|agreement signed)$/i.test((r.disposition||'').trim())).length; const agreementsSigned=actionableRows.filter(r=>/^agreement signed$/i.test((r.disposition||'').trim())).length;
  const gated=actionableRows.filter(r=>{const t=trackOf(r);return t==='T3'||t==='T4';});
  const sentToday=actionableRows.filter(r=>r.lastSentAt&&dateKey(r.lastSentAt)===today).length; const sentThisWeek=actionableRows.filter(r=>{if(!r.lastSentAt)return false;const key=dateKey(r.lastSentAt);return key>=monday&&key<=today;}).length;
  const sequence=Array.from({length:6},(_,step)=>({step,label:STEP_LABELS[step],count:actionableRows.filter(r=>Math.min(Math.max(r.dripStep,0),5)===step).length}));
  const sourceDefs:Array<{key:SourceKey;label:string}>=[{key:'expired',label:'Expired Listings'},{key:'withdrawn',label:'Withdrawn & Cancelled'},{key:'active',label:'Active Listings'}];
  const sources=sourceDefs.map(({key,label})=>{const subset=rows.filter(r=>r.sourceKey===key);const actionable=subset.filter(r=>!isBadLead(r));return{sourceKey:key,label,total:subset.length,withEmail:subset.filter(r=>r.emails.length>0).length,active:actionable.filter(isActive).length,due:actionable.filter(r=>isDue(r,now)).length,contacted:actionable.filter(r=>r.lastSentAt||r.dripStep>0).length,stopped:actionable.filter(r=>isStopped(r)&&!isCompleted(r)).length};});
  const variants=['A','B'].map(variant=>{const assigned=actionableRows.filter(r=>(r.variant||'').trim().toUpperCase()===variant);const contacted=assigned.filter(r=>r.lastSentAt||r.dripStep>0);const replies=assigned.filter(isKnownReply).length;const t=tracking.byVariant[variant as'A'|'B'];return{variant,prospects:assigned.length,contacted:contacted.length,knownReplies:replies,knownReplyRate:contacted.length?replies/contacted.length:0,emailsSent:emailsSentFromSteps(assigned),trackedOpens:t.trackedOpens,trackedOpenRate:t.trackedOpenRate};});
  const senderPerformance=buildSenderPerformance(actionableRows,emailActivity); const dayOfWeekPerformance=buildDayOfWeekPerformance(actionableRows,emailActivity); const leads=rows.map(r=>toRedactedLead(r,now));
  const upcoming=actionableRows.filter(r=>isActive(r)&&r.nextSendAt&&r.nextSendAt.getTime()>=now.getTime()).sort((a,b)=>a.nextSendAt!.getTime()-b.nextSendAt!.getTime()).slice(0,15).map(r=>toRedactedLead(r,now));
  const recent=rows.filter(r=>!!r.lastSentAt).sort((a,b)=>b.lastSentAt!.getTime()-a.lastSentAt!.getTime()).slice(0,15).map(r=>toRedactedLead(r,now));
  return {fetchedAt:now.toISOString(),timezone:DASHBOARD_TIMEZONE,headline:{positiveReplies,callsBooked,agreementsSigned,positiveReplyRate:contactedRows.length?positiveReplies/contactedRows.length:0,totalProspects,withEmail,activeSequences,dueNow,sentToday,sentThisWeek,contacted:contactedRows.length,completed,stopped,badLeads,knownReplies,emailsSent:emailsSentFromSteps(rows),trackedOpens:tracking.trackedOpens,trackedOpenRate:tracking.trackedOpenRate,notOpened:tracking.notOpened,knownReplyRate:contactedRows.length?knownReplies/contactedRows.length:0},sequence,sources,variants,senderPerformance,dayOfWeekPerformance,abReadout:abReadout(variants),upcoming,recent,leads,dataQuality:{noEmail:actionableRows.filter(r=>r.emails.length===0).length,malformedDates:rows.reduce((sum,r)=>sum+r.malformedDateCount,0),companyOnlyOwners:actionableRows.filter(r=>r.firstName==='Owner').length},
    tracks:buildTrackSummaries(actionableRows),replyReasons:buildReplyReasons(actionableRows),
    compliance:{gatedContacted:gated.filter(r=>r.lastSentAt||r.dripStep>0).length,gatedDueNow:gated.filter(r=>isDue(r,now)).length},
    agents:extras.agents??null,warnings:extras.warnings??[]};
}
