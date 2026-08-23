import assert from 'node:assert/strict';
import { googleDiagnostic } from './google-error';

assert.equal(googleDiagnostic(new Error('Google Sheets credentials are not configured.')).code, 'GOOGLE_CONFIG_MISSING');
assert.equal(googleDiagnostic(new Error('Google authentication failed (invalid_grant).')).code, 'GOOGLE_AUTH_FAILED');
assert.equal(googleDiagnostic(new Error('Google Sheets request failed (403).')).code, 'GOOGLE_SHEETS_403');
assert.equal(googleDiagnostic(new Error('Google Sheets request failed (404).')).code, 'GOOGLE_SHEETS_404');
console.log('google error tests passed');
