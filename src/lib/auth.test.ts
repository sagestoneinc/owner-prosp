import assert from 'node:assert/strict';
import { createSessionToken, hashPassword, verifyPasswordAgainstHash, verifySessionToken } from './auth';

const encoded = hashPassword('correct horse battery staple', 'fixed-salt-for-test');
assert.equal(verifyPasswordAgainstHash('correct horse battery staple', encoded), true);
assert.equal(verifyPasswordAgainstHash('wrong password', encoded), false);
assert.equal(verifyPasswordAgainstHash('anything', 'bad-format'), false);

const now = new Date('2026-08-23T12:00:00Z');
const token = createSessionToken(now, 'test-secret-that-is-long-enough');
assert.equal(verifySessionToken(token, new Date('2026-08-23T13:00:00Z'), 'test-secret-that-is-long-enough'), true);
assert.equal(verifySessionToken(token + 'x', new Date('2026-08-23T13:00:00Z'), 'test-secret-that-is-long-enough'), false);
assert.equal(verifySessionToken(token, new Date('2026-08-24T01:00:01Z'), 'test-secret-that-is-long-enough'), false);
assert.equal(verifySessionToken(token, new Date('2026-08-23T13:00:00Z'), 'different-secret'), false);
console.log('auth tests passed');
