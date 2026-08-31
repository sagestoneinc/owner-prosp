import assert from 'node:assert/strict';
import { buildLeadUpdateRanges, validateLeadUpdatePayload } from './lead-update';

const valid = validateLeadUpdatePayload({ ownerRaw:'  Jane Doe ', emails:'A@example.com; b@example.com', phone:' 555-1212 ' });
assert.equal(valid.ownerRaw, 'Jane Doe');
assert.equal(valid.emails, 'a@example.com\nb@example.com');
assert.equal(valid.phone, '555-1212');
assert.throws(() => validateLeadUpdatePayload({ dripStep:'2' }), /cannot be edited/i);
assert.throws(() => validateLeadUpdatePayload({ emails:'not-an-email' }), /valid email/i);
const ranges = buildLeadUpdateRanges('Expired Listings', 22, { ownerRaw:'Jane Doe', emails:'a@example.com' });
assert.deepEqual(ranges.map(x=>x.range), ["'Expired Listings'!I22", "'Expired Listings'!K22"]);
assert.ok(ranges.every(x => !/[L-R]22$/.test(x.range)));
console.log('lead update tests passed');
