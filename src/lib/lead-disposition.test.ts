import assert from 'node:assert/strict';
import { buildDispositionRange, isBadLeadDisposition, validateDispositionPayload } from './lead-disposition';

assert.deepEqual(validateDispositionPayload({ disposition: 'Bad Lead' }), { disposition: 'Bad Lead' });
assert.deepEqual(validateDispositionPayload({ disposition: '' }), { disposition: '' });
assert.throws(() => validateDispositionPayload({ disposition: 'Delete' }), /Invalid lead disposition/);
assert.throws(() => validateDispositionPayload({ disposition: 'Bad Lead', dripStep: '0' }), /Only disposition/);
assert.deepEqual(buildDispositionRange('Expired Listings', 22, 'Bad Lead'), { range: "'Expired Listings'!S22", values: [['Bad Lead']] });
assert.equal(isBadLeadDisposition(' bad lead '), true);
assert.equal(isBadLeadDisposition(''), false);
console.log('lead disposition tests passed');
