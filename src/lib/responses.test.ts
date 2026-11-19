import assert from 'node:assert/strict';
import { buildResponseMetrics, estimatedFirstSendKey, replyDate, replyType } from './responses';
import type { ProspectRow } from './types';

const toKey = (d: Date) => d.toISOString().slice(0, 10);
function row(over: Partial<ProspectRow>): ProspectRow {
  return { sourceKey: 'expired', sourceLabel: 'Expired Listings', rowNumber: 2, mls: '', address: '', city: '', state: '', zipcode: '', county: '', currentPrice: '', listingStatus: '', ownerRaw: '', firstName: 'Pat', phone: '', emails: ['a@b.com'], firstContact: '', status2: '', dripStep: 0, nextSendAt: null, lastSentAt: null, stoppedRaw: '', variant: 'A', disposition: '', skipReason: '', malformedDateCount: 0, ...over };
}

assert.equal(replyType(row({ disposition: 'Interested' })), 'Interested');
assert.equal(replyType(row({ disposition: 'not interested' })), 'Not interested');
assert.equal(replyType(row({ disposition: 'Unsubscribed' })), 'Unsubscribed');
assert.equal(replyType(row({ disposition: 'Replied' })), 'Replied, not yet sorted');
assert.equal(replyType(row({ status2: 'REPLIED' })), 'Replied, not yet sorted');
assert.equal(replyType(row({ disposition: 'Bad Lead' })), null);
assert.equal(replyDate(row({ skipReason: 'Reply received 2026-11-24, drip stopped' })), '2026-11-24');
assert.equal(replyDate(row({ skipReason: '' })), null);
// Step 3 is sent 10 days after email 1.
assert.equal(estimatedFirstSendKey(row({ dripStep: 3, lastSentAt: new Date('2026-12-01T15:00:00Z') }), toKey), '2026-11-21');

const rows = [
  row({ dripStep: 1, lastSentAt: new Date('2026-11-23T15:00:00Z'), disposition: 'Interested', skipReason: 'Reply received 2026-11-24, drip stopped' }),
  row({ dripStep: 2, lastSentAt: new Date('2026-11-27T15:00:00Z'), disposition: 'Replied', skipReason: 'Reply received 2026-11-17, drip stopped' }),
  row({ dripStep: 2, lastSentAt: new Date('2026-11-27T15:00:00Z') }),
  row({ dripStep: 5, lastSentAt: new Date('2026-11-10T15:00:00Z'), status2: 'REPLIED' }),
  row({ dripStep: 0 }),
];
const m = buildResponseMetrics(rows, { todayKey: '2026-11-25', weekStartKey: '2026-11-23', lastWeekStartKey: '2026-11-16', toKey, weeklyGoal: 4 });
assert.deepEqual(m.byStep.map(s => [s.step, s.reached, s.replies]), [[1, 4, 1], [2, 3, 1], [3, 1, 0], [4, 1, 0], [5, 1, 1]]);
assert.equal(m.byStep[0].replyRate, 0.25);
assert.deepEqual(m.types, [
  { type: 'Interested', count: 1 }, { type: 'Not interested', count: 0 }, { type: 'Unsubscribed', count: 0 }, { type: 'Replied, not yet sorted', count: 2 },
]);
assert.deepEqual(m.goal, { weeklyTarget: 4, thisWeek: 1, lastWeek: 1, progress: 0.25 });
assert.equal(m.undatedReplies, 1);
assert.deepEqual(m.copy.newCopy, { contacted: 3, replies: 2, replyRate: 2 / 3 });
assert.deepEqual(m.copy.oldCopy, { contacted: 1, replies: 1, replyRate: 1 });
console.log('response metrics tests passed');
