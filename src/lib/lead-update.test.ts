import assert from 'node:assert/strict';
import { buildLeadUpdateRanges, validateLeadUpdatePayload } from './lead-update';
import { buildSheetSchema } from './sheet-schema';

const headers = ['MLS #','Address','City','State','Zipcode','County','Current Price','Status','Owners Name','Phone Number','Email','First Contact','Status 2','Drip Step','Next Send At','Last Sent At','Stopped','Variant','Skip Reason','Lead Disposition'];
const schema = buildSheetSchema('Expired Listings', headers);
const valid = validateLeadUpdatePayload({ ownerRaw:'  Jane Doe ', emails:'A@example.com; b@example.com', phone:' 555-1212 ' });
assert.equal(valid.ownerRaw, 'Jane Doe');
assert.equal(valid.emails, 'a@example.com\nb@example.com');
assert.equal(valid.phone, '555-1212');
assert.throws(() => validateLeadUpdatePayload({ dripStep:'2' }), /cannot be edited/i);
assert.throws(() => validateLeadUpdatePayload({ emails:'not-an-email' }), /valid email/i);
const ranges = buildLeadUpdateRanges(schema, 'Expired Listings', 22, { ownerRaw:'Jane Doe', phone:'555-1212', emails:'a@example.com' });
assert.deepEqual(ranges.map(x=>x.range), ["'Expired Listings'!I22", "'Expired Listings'!J22", "'Expired Listings'!K22"]);
const movedHeaders = [...headers];
[movedHeaders[9], movedHeaders[10]] = [movedHeaders[10], movedHeaders[9]];
const movedSchema = buildSheetSchema('Moved', movedHeaders);
const moved = buildLeadUpdateRanges(movedSchema, 'Moved', 22, { phone:'555-1212', emails:'a@example.com' });
assert.deepEqual(moved.map(x=>x.range), ["'Moved'!K22", "'Moved'!J22"]);
console.log('lead update tests passed');

// Editing a lead on a tab without "Status" skips that field instead of failing.
const noStatusSchema = buildSheetSchema('Active Listings', headers.filter(h => h !== 'Status'));
const noStatusRanges = buildLeadUpdateRanges(noStatusSchema, 'Active Listings', 3, { listingStatus: 'Active', ownerRaw: 'Jane Doe' });
assert.deepEqual(noStatusRanges, [{ range: "'Active Listings'!H3", values: [['Jane Doe']] }]);
