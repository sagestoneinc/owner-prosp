import assert from 'node:assert/strict';
import { mapSheetRows, parseLeadId } from './sheets';

const expiredValues = [
  ['21222274','117 Brittons  Lane','Runaway Bay','Texas','76426','Wise','$2,350','Expired','KENTZY PROPERTY GROUP, LLC\nChong Koh','(214) 555-0100','CHONG@example.com\nalt@example.com','','Replied','2','2026-08-27T14:00:00Z','2026-08-23T14:00:00Z','Yes','B','undeliverable','Bad Lead'],
  ['21222275','1712 Sandalwood  Way','Plano','Texas','75023','Collin','$2,500','Expired','ABC PROPERTIES LLC','','','','','0','','','','','','']
];
const expiredRows = mapSheetRows('expired', expiredValues, 2);
assert.equal(expiredRows.length, 2);
assert.equal(expiredRows[0].rowNumber, 2);
assert.equal(expiredRows[0].firstName, 'Chong');
assert.equal(expiredRows[0].address, '117 Brittons Lane');
assert.deepEqual(expiredRows[0].emails, ['chong@example.com','alt@example.com']);
assert.equal(expiredRows[0].phone, '(214) 555-0100');
assert.equal(expiredRows[0].dripStep, 2);
assert.equal(expiredRows[0].variant, 'B');
assert.equal(expiredRows[0].disposition, 'Bad Lead');
assert.equal(expiredRows[0].malformedDateCount, 0);
assert.equal(expiredRows[1].firstName, 'Owner');

const activeValues = [[
  '21271539','1712 Sandalwood  Way','Princeton','Texas','75407','Collin','$1,795','Active','Kelly Young','kelly@example.com','2026-08-20','Replied','1','2026-08-27T07:11:18Z','2026-08-23T07:11:18Z','','B','(972) 555-0110','','Bad Lead'
]];
const activeRows = mapSheetRows('active', activeValues, 2);
assert.equal(activeRows[0].emails[0], 'kelly@example.com');
assert.equal(activeRows[0].phone, '(972) 555-0110');
assert.equal(activeRows[0].firstContact, '2026-08-20');
assert.equal(activeRows[0].status2, 'Replied');
assert.equal(activeRows[0].dripStep, 1);
assert.equal(activeRows[0].variant, 'B');
assert.equal(activeRows[0].disposition, 'Bad Lead');

assert.deepEqual(parseLeadId('withdrawn:42'), { sourceKey: 'withdrawn', rowNumber: 42 });
assert.equal(parseLeadId('other:42'), null);
assert.equal(parseLeadId('active:1'), null);
console.log('sheets mapping tests passed');
