import assert from 'node:assert/strict';
import { buildDashboardData, toRedactedLead } from './metrics';
import type { ProspectRow } from './types';

const now = new Date('2026-08-23T14:00:00Z');
const base = (overrides: Partial<ProspectRow>): ProspectRow => ({
  sourceKey: 'expired', sourceLabel: 'Expired Listings', rowNumber: 2,
  mls: '1', address: '100 Main St', city: 'Plano', state: 'Texas', zipcode: '75000', county: 'Collin', currentPrice: '$2,500', listingStatus: 'Expired',
  ownerRaw: 'Kelly Young', firstName: 'Kelly', phone: '555-1111', emails: ['kelly@example.com'], firstContact: '', status2: '', dripStep: 0,
  nextSendAt: null, lastSentAt: null, stoppedRaw: '', variant: '', malformedDateCount: 0,
  ...overrides
});

const rows: ProspectRow[] = [
  base({ rowNumber: 2 }),
  base({ rowNumber: 3, sourceKey: 'withdrawn', sourceLabel: 'Withdrawn & Cancelled Listings', listingStatus: 'Withdrawn', dripStep: 2, lastSentAt: new Date('2026-08-23T13:00:00Z'), nextSendAt: new Date('2026-08-27T14:00:00Z'), variant: 'B' }),
  base({ rowNumber: 4, sourceKey: 'active', sourceLabel: 'Active Listings', listingStatus: 'Active', dripStep: 5, lastSentAt: new Date('2026-08-20T14:00:00Z'), stoppedRaw: 'Yes', variant: 'A' }),
  base({ rowNumber: 5, status2: 'Replied', dripStep: 2, lastSentAt: new Date('2026-08-22T14:00:00Z'), stoppedRaw: 'Yes', variant: 'B' }),
  base({ rowNumber: 6, emails: [], firstName: 'Owner', ownerRaw: 'ABC PROPERTIES LLC', malformedDateCount: 1 })
];

const data = buildDashboardData(rows, now);
assert.equal(data.headline.totalProspects, 5);
assert.equal(data.headline.withEmail, 4);
assert.equal(data.headline.activeSequences, 2);
assert.equal(data.headline.dueNow, 1);
assert.equal(data.headline.sentToday, 1);
assert.equal(data.headline.sentThisWeek, 3);
assert.equal(data.headline.contacted, 3);
assert.equal(data.headline.completed, 1);
assert.equal(data.headline.stopped, 1);
assert.equal(data.headline.knownReplies, 1);
assert.equal(data.sequence.find(x => x.step === 2)?.count, 2);
assert.equal(data.sources.find(x => x.sourceKey === 'active')?.total, 1);
assert.equal(data.variants.find(x => x.variant === 'B')?.knownReplies, 1);
assert.equal(data.dataQuality.noEmail, 1);
assert.equal(data.dataQuality.malformedDates, 1);
assert.equal(data.dataQuality.companyOnlyOwners, 1);

const redacted = toRedactedLead(rows[1], now);
const serialized = JSON.stringify(redacted);
assert.ok(!serialized.includes('kelly@example.com'));
assert.ok(!serialized.includes('555-1111'));
assert.ok(!serialized.includes('ownerRaw'));
assert.equal(redacted.id, 'withdrawn:3');
assert.equal(redacted.dueNow, false);
console.log('metrics tests passed');
