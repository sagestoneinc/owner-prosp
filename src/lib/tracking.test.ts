import assert from 'node:assert/strict';
import { isValidTrackingId, makeTrackingWebhookUrl } from './tracking';

assert.equal(isValidTrackingId('exp-22-1-1788181200000-1'), true);
assert.equal(isValidTrackingId('bad id with spaces'), false);
assert.equal(isValidTrackingId('../secret'), false);
assert.equal(isValidTrackingId('short'), false);
assert.equal(
  makeTrackingWebhookUrl('https://hook.example.test/open', 'exp-22-1-1788181200000-1'),
  'https://hook.example.test/open?id=exp-22-1-1788181200000-1'
);
console.log('tracking tests passed');
