import assert from 'node:assert/strict';
import { mapSheetRows, parseLeadId } from './sheets';

const values = [
  ['21222274','117 Brittons  Lane','Runaway Bay','Texas','76426','Wise','$2,350','Expired','KENTZY PROPERTY GROUP, LLC\nChong Koh','(214) 555-0100','CHONG@example.com\nalt@example.com','','Replied','2','2026-08-27T14:00:00Z','2026-08-23T14:00:00Z','Yes','B'],
  ['21222275','1712 Sandalwood  Way','Plano','Texas','75023','Collin','$2,500','Expired','ABC PROPERTIES LLC','','','','','0','','','','']
];
const rows = mapSheetRows('expired', values, 2);
assert.equal(rows.length, 2);
assert.equal(rows[0].rowNumber, 2);
assert.equal(rows[0].firstName, 'Chong');
assert.equal(rows[0].address, '117 Brittons Lane');
assert.deepEqual(rows[0].emails, ['chong@example.com','alt@example.com']);
assert.equal(rows[0].dripStep, 2);
assert.equal(rows[0].variant, 'B');
assert.equal(rows[0].malformedDateCount, 0);
assert.equal(rows[1].firstName, 'Owner');
assert.deepEqual(parseLeadId('withdrawn:42'), { sourceKey: 'withdrawn', rowNumber: 42 });
assert.equal(parseLeadId('other:42'), null);
assert.equal(parseLeadId('active:1'), null);
console.log('sheets mapping tests passed');
