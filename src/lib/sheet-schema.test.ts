import assert from 'node:assert/strict';
import { buildSheetSchema, columnLetter } from './sheet-schema';

const headers = ['MLS #','Address','City','State','Zipcode','County','Current Price','Status','Owners Name','Phone Number','Email','First Contact','Status 2','Drip Step','Next Send At','Last Sent At','Stopped','Variant','Skip Reason','Lead Disposition'];
const schema = buildSheetSchema('Active Listings', headers);
assert.equal(schema.indexOf('Phone Number'), 9);
assert.equal(schema.indexOf('Email'), 10);
assert.equal(schema.columnOf('Variant'), 'R');
assert.equal(schema.columnOf('Lead Disposition'), 'T');
assert.equal(columnLetter(0), 'A');
assert.equal(columnLetter(25), 'Z');
assert.equal(columnLetter(26), 'AA');
assert.throws(() => buildSheetSchema('Active Listings', [...headers.slice(0,17), 'Phone Number', ...headers.slice(18)]), /duplicate.*Phone Number/i);
assert.throws(() => buildSheetSchema('Active Listings', headers.filter(h => h !== 'Email')), /missing.*Email/i);
console.log('sheet schema tests passed');
