import assert from 'node:assert/strict';
import { cleanAddress, displayFirstName, normalizeEmailCell, parseSheetDate } from './normalize';

assert.deepEqual(normalizeEmailCell(' First@Example.COM\nsecond@example.com; third@example.com '), [
  'first@example.com', 'second@example.com', 'third@example.com'
]);
assert.equal(displayFirstName('KENTZY PROPERTY GROUP, LLC\nChong Koh\n'), 'Chong');
assert.equal(displayFirstName('KENTZY PROPERTY GROUP, LLC'), 'Owner');
assert.equal(displayFirstName('KELLY YOUNG'), 'Kelly');
assert.equal(cleanAddress('1712 Sandalwood  Way'), '1712 Sandalwood Way');
assert.equal(parseSheetDate('not-a-date'), null);
console.log('normalize tests passed');
