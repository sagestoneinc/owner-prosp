import assert from 'node:assert/strict';
import { readJsonResponse } from './http-json';

async function run() {
  const empty = await readJsonResponse({
    ok: false,
    status: 500,
    text: async () => ''
  });
  assert.deepEqual(empty, { error: 'Server returned an empty response (HTTP 500).' });

  const json = await readJsonResponse({
    ok: false,
    status: 503,
    text: async () => JSON.stringify({ error: 'Session configuration is missing.' })
  });
  assert.deepEqual(json, { error: 'Session configuration is missing.' });

  const html = await readJsonResponse({
    ok: false,
    status: 500,
    text: async () => '<html>Internal Server Error</html>'
  });
  assert.deepEqual(html, { error: 'Server returned a non-JSON response (HTTP 500).' });

  console.log('http-json tests passed');
}

void run();
