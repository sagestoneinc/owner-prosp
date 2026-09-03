import assert from 'node:assert/strict';
import { buildDispositionRange, isBadLeadDisposition, validateDispositionPayload } from './lead-disposition';
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
console.log('lead disposition tests passed');
