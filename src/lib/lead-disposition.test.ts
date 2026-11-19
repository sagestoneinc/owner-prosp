import assert from 'node:assert/strict';
import { buildDispositionRange, buildDispositionRanges, dispositionCategory, isBadLeadDisposition, isPositiveDisposition, isReplyDisposition, isStopDisposition, validateDispositionPayload } from './lead-disposition';
import { buildSheetSchema } from './sheet-schema';

const headers = ['MLS #','Address','City','State','Zipcode','County','Current Price','Status','Owners Name','Phone Number','Email','First Contact','Status 2','Drip Step','Next Send At','Last Sent At','Stopped','Variant','Skip Reason','Lead Disposition'];
const schema = buildSheetSchema('Expired Listings', headers);
assert.deepEqual(validateDispositionPayload({ disposition: 'Bad Lead' }), { disposition: 'Bad Lead' });
assert.deepEqual(validateDispositionPayload({ disposition: '' }), { disposition: '' });
assert.throws(() => validateDispositionPayload({ disposition: 'Delete' }), /Invalid lead disposition/);
assert.throws(() => validateDispositionPayload({ disposition: 'Bad Lead', dripStep: '0' }), /Only disposition/);
assert.deepEqual(buildDispositionRange(schema, 'Expired Listings', 22, 'Bad Lead'), { range: "'Expired Listings'!T22", values: [['Bad Lead']] });
assert.equal(isBadLeadDisposition(' bad lead '), true);
assert.equal(isBadLeadDisposition(''), false);
// Outcome taxonomy from the action plan.
for (const value of ['Interested','Call booked','Agreement signed','Already managed','Wants to sell','Self-managing','Not interested','Wrong person','Unsubscribe']) {
  assert.deepEqual(validateDispositionPayload({ disposition: value }), { disposition: value });
}
assert.throws(() => validateDispositionPayload({ disposition: 'interested' }), /Invalid lead disposition/);
assert.throws(() => validateDispositionPayload({ disposition: 'Replied' }), /Invalid lead disposition/);
assert.equal(dispositionCategory('Agreement signed'), 'positive');
assert.equal(dispositionCategory('Replied'), 'reply');
assert.equal(dispositionCategory('Already managed'), 'reply');
assert.equal(dispositionCategory('Unsubscribe'), 'unsubscribe');
assert.equal(dispositionCategory('In sequence'), 'none');
assert.equal(dispositionCategory('Completed'), 'none');
assert.equal(isReplyDisposition('Unsubscribe'), false);
assert.equal(isStopDisposition('Unsubscribe'), true);
assert.equal(isStopDisposition('Completed'), false);
assert.equal(isPositiveDisposition('call booked'), true);
assert.equal(isPositiveDisposition('Not interested'), false);
// Outcomes also set Stopped = Yes so the live Make filter (which honors Stopped) halts the drip.
assert.deepEqual(buildDispositionRanges(schema, 'Expired Listings', 22, 'Unsubscribe'), [
  { range: "'Expired Listings'!T22", values: [['Unsubscribe']] },
  { range: "'Expired Listings'!Q22", values: [['Yes']] }
]);
assert.equal(buildDispositionRanges(schema, 'Expired Listings', 22, 'Bad Lead').length, 1);
assert.equal(buildDispositionRanges(schema, 'Expired Listings', 22, '').length, 1);
console.log('lead disposition tests passed');
