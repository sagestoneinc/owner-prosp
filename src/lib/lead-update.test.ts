import assert from 'node:assert/strict';
import { buildLeadUpdateRanges, validateLeadUpdatePayload } from './lead-update';

const valid = validateLeadUpdatePayload({ ownerRaw:'  Jane Doe ', emails:'A@example.com; b@example.com', phone:' 555-1212 ' });
assert.equal(valid.ownerRaw, 'Jane Doe');
assert.equal(valid.emails, 'a@example.com\nb@example.com');
assert.equal(valid.phone, '555-1212');
assert.throws(() => validateLeadUpdatePayload({ dripStep:'2' }), /cannot be edited/i);
assert.throws(() => validateLeadUpdatePayload({ emails:'not-an-email' }), /valid email/i);
const expiredRanges = buildLeadUpdateRanges('expired', 'Expired Listings', 22, { ownerRaw:'Jane Doe', phone:'555-1212', emails:'a@example.com' });
assert.deepEqual(expiredRanges.map(x=>x.range), ["'Expired Listings'!I22", "'Expired Listings'!J22", "'Expired Listings'!K22"]);
const activeRanges = buildLeadUpdateRanges('active', 'Active Listings', 22, { phone:'555-1212', emails:'a@example.com' });
assert.deepEqual(activeRanges.map(x=>x.range), ["'Active Listings'!R22", "'Active Listings'!J22"]);
assert.ok(expiredRanges.every(x => !/[L-T]22$/.test(x.range)));
assert.ok(activeRanges.every(x => !/[K-QS-T]22$/.test(x.range)));
console.log('lead update tests passed');
