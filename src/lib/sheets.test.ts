import assert from 'node:assert/strict';
import { mapSheetRows, parseLeadId } from './sheets';

const headers = ['MLS #','Address','City','State','Zipcode','County','Current Price','Status','Owners Name','Phone Number','Email','First Contact','Status 2','Drip Step','Next Send At','Last Sent At','Stopped','Variant','Skip Reason','Lead Disposition'];
const expiredValues = [
  ['21222274','117 Brittons  Lane','Runaway Bay','Texas','76426','Wise','$2,350','Expired','KENTZY PROPERTY GROUP, LLC\nChong Koh','(214) 555-0100','CHONG@example.com\nalt@example.com','','Replied','2','2026-08-27T14:00:00Z','2026-08-23T14:00:00Z','Yes','B','undeliverable','Bad Lead'],
  ['21222275','1712 Sandalwood  Way','Plano','Texas','75023','Collin','$2,500','Expired','ABC PROPERTIES LLC','','','','','0','','','','','','']
];
const expiredRows = mapSheetRows('expired', expiredValues, 2, headers);
assert.equal(expiredRows.length, 2);
assert.equal(expiredRows[0].firstName, 'Chong');
assert.deepEqual(expiredRows[0].emails, ['chong@example.com','alt@example.com']);
assert.equal(expiredRows[0].phone, '(214) 555-0100');
assert.equal(expiredRows[0].variant, 'B');
assert.equal(expiredRows[0].disposition, 'Bad Lead');

const movedHeaders = [...headers];
[movedHeaders[9], movedHeaders[10]] = [movedHeaders[10], movedHeaders[9]];
const movedValues = [['21271539','1712 Sandalwood Way','Princeton','Texas','75407','Collin','$1,795','Active','Kelly Young','kelly@example.com','(972) 555-0110','2026-08-20','Replied','1','2026-08-27T07:11:18Z','2026-08-23T07:11:18Z','','B','','']];
const activeRows = mapSheetRows('active', movedValues, 2, movedHeaders);
assert.equal(activeRows[0].emails[0], 'kelly@example.com');
assert.equal(activeRows[0].phone, '(972) 555-0110');
assert.equal(activeRows[0].variant, 'B');

assert.deepEqual(parseLeadId('withdrawn:42'), { sourceKey: 'withdrawn', rowNumber: 42 });
assert.equal(parseLeadId('other:42'), null);
assert.equal(parseLeadId('active:1'), null);
console.log('sheets mapping tests passed');
