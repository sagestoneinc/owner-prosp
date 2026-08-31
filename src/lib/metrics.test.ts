import assert from 'node:assert/strict';
import { buildDashboardData, toRedactedLead } from './metrics';
import { mapEmailActivityRows } from './email-activity';
import type { ProspectRow } from './types';

const now = new Date('2026-08-23T14:00:00Z');
const base = (overrides: Partial<ProspectRow>): ProspectRow => ({
  sourceKey: 'expired', sourceLabel: 'Expired Listings', rowNumber: 2,
  mls: '1', address: '100 Main St', city: 'Plano', state: 'Texas', zipcode: '75000', county: 'Collin', currentPrice: '$2,500', listingStatus: 'Expired',
  ownerRaw: 'Kelly Young', firstName: 'Kelly', phone: '555-1111', emails: ['kelly@example.com'], firstContact: '', status2: '', dripStep: 0,
  nextSendAt: null, lastSentAt: null, stoppedRaw: '', variant: '', disposition: '', malformedDateCount: 0,
  ...overrides
});

const rows: ProspectRow[] = [
  base({ rowNumber: 2 }),
  base({ rowNumber: 3, sourceKey: 'withdrawn', sourceLabel: 'Withdrawn & Cancelled Listings', listingStatus: 'Withdrawn', dripStep: 2, lastSentAt: new Date('2026-08-23T13:00:00Z'), nextSendAt: new Date('2026-08-27T14:00:00Z'), variant: 'B' }),
  base({ rowNumber: 4, sourceKey: 'active', sourceLabel: 'Active Listings', listingStatus: 'Active', dripStep: 5, lastSentAt: new Date('2026-08-20T14:00:00Z'), stoppedRaw: 'Yes', variant: 'A' }),
  base({ rowNumber: 5, status2: 'Replied', dripStep: 2, lastSentAt: new Date('2026-08-22T14:00:00Z'), stoppedRaw: 'Yes', variant: 'B' }),
  base({ rowNumber: 6, emails: [], firstName: 'Owner', ownerRaw: 'ABC PROPERTIES LLC', malformedDateCount: 1 }),
  base({ rowNumber: 7, dripStep: 1, nextSendAt: new Date('2026-08-23T13:00:00Z'), disposition: 'Bad Lead' })
];

const data = buildDashboardData(rows, now);
assert.equal(data.headline.totalProspects, 6);
assert.equal(data.headline.withEmail, 5);
assert.equal(data.headline.activeSequences, 2);
assert.equal(data.headline.dueNow, 1);
assert.equal(data.headline.badLeads, 1);
assert.equal(data.headline.sentToday, 1);
assert.equal(data.headline.sentThisWeek, 3);
assert.equal(data.headline.contacted, 3);
assert.equal(data.headline.completed, 1);
assert.equal(data.headline.stopped, 1);
assert.equal(data.headline.knownReplies, 1);
assert.equal(data.sequence.find(x => x.step === 1)?.count, 0);
assert.equal(data.sequence.find(x => x.step === 2)?.count, 2);
assert.equal(data.sources.find(x => x.sourceKey === 'active')?.total, 1);
assert.equal(data.variants.find(x => x.variant === 'B')?.knownReplies, 1);
assert.equal(data.dataQuality.noEmail, 1);
assert.equal(data.dataQuality.malformedDates, 1);
assert.equal(data.dataQuality.companyOnlyOwners, 1);
assert.equal(data.leads.find(x => x.id === 'expired:7')?.badLead, true);
assert.equal(data.leads.find(x => x.id === 'expired:7')?.dueNow, false);

const activity = mapEmailActivityRows([
  ['trk-1','Expired','5','5001','500 Main St','one@example.com','A','1','Subject','z1','2026-08-22T10:00:00-04:00','deliverable','Yes','2026-08-22T10:05:00-04:00','2026-08-22T10:05:00-04:00','1','pixel','','jess.seeto@jeselcura.me'],
  ['trk-2','Expired','5','5001','500 Main St','two@example.com','A','1','Subject','z2','2026-08-22T10:02:00-04:00','deliverable','','','','0','pixel','','jess.seeto@jeselcura.me'],
  ['trk-3','Withdrawn','3','3001','300 Main St','three@example.com','B','2','Subject','z3','2026-08-23T10:00:00-04:00','deliverable','Yes','2026-08-23T10:03:00-04:00','2026-08-23T10:03:00-04:00','1','pixel','','second@seetorealty.com']
]);
const performance = buildDashboardData(rows, now, activity);
assert.equal(performance.senderPerformance.length, 2);
assert.equal(performance.senderPerformance.find(x => x.sender === 'jess.seeto@jeselcura.me')?.emailsSent, 2);
assert.equal(performance.senderPerformance.find(x => x.sender === 'jess.seeto@jeselcura.me')?.trackedOpenRate, 0.5);
assert.equal(performance.senderPerformance.find(x => x.sender === 'jess.seeto@jeselcura.me')?.knownReplies, 1);
assert.equal(performance.senderPerformance.find(x => x.sender === 'second@seetorealty.com')?.emailsSent, 1);
assert.equal(performance.dayOfWeekPerformance.find(x => x.day === 'Saturday')?.emailsSent, 2);
assert.equal(performance.dayOfWeekPerformance.find(x => x.day === 'Saturday')?.trackedOpens, 1);
assert.equal(performance.dayOfWeekPerformance.find(x => x.day === 'Saturday')?.knownReplies, 1);
assert.equal(performance.dayOfWeekPerformance.find(x => x.day === 'Sunday')?.emailsSent, 1);
assert.equal(performance.dayOfWeekPerformance.find(x => x.day === 'Sunday')?.knownReplies, 0);

const redacted = toRedactedLead(rows[1], now);
const serialized = JSON.stringify(redacted);
assert.ok(!serialized.includes('kelly@example.com'));
assert.ok(!serialized.includes('555-1111'));
assert.ok(!serialized.includes('ownerRaw'));
assert.equal(redacted.id, 'withdrawn:3');
assert.equal(redacted.dueNow, false);
console.log('metrics tests passed');
