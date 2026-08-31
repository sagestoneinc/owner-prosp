import assert from 'node:assert/strict';
import { generateKeyPairSync, verify } from 'node:crypto';
import { buildServiceAccountAssertion } from './google-auth';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString();
const assertion = buildServiceAccountAssertion({
  clientEmail: 'dashboard@example.iam.gserviceaccount.com',
  privateKey: privatePem,
  nowSeconds: 1_800_000_000
});
const [h,p,s] = assertion.split('.');
const payload = JSON.parse(Buffer.from(p, 'base64url').toString('utf8'));
assert.equal(payload.iss, 'dashboard@example.iam.gserviceaccount.com');
assert.equal(payload.scope, 'https://www.googleapis.com/auth/spreadsheets');
assert.equal(payload.aud, 'https://oauth2.googleapis.com/token');
assert.equal(payload.iat, 1_800_000_000);
assert.equal(payload.exp, 1_800_003_600);
assert.equal(verify('RSA-SHA256', Buffer.from(`${h}.${p}`), publicKey, Buffer.from(s, 'base64url')), true);
console.log('google auth tests passed');
