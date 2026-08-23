import { createSign } from 'node:crypto';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/spreadsheets.readonly';

function base64urlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

export function buildServiceAccountAssertion(args: {
  clientEmail: string;
  privateKey: string;
  nowSeconds?: number;
}): string {
  const now = args.nowSeconds ?? Math.floor(Date.now() / 1000);
  const header = base64urlJson({ alg: 'RS256', typ: 'JWT' });
  const payload = base64urlJson({
    iss: args.clientEmail,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600
  });
  const unsigned = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  signer.end();
  let key = args.privateKey.trim();
  if ((key.startsWith('\"') && key.endsWith('\"')) || (key.startsWith("'") && key.endsWith("'"))) {
    key = key.slice(1, -1);
  }
  key = key.replace(/\\n/g, '\n');
  let signature: string;
  try {
    signature = signer.sign(key).toString('base64url');
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'unknown key parse error';
    throw new Error(`Google private key is invalid: ${reason}`);
  }
  return `${unsigned}.${signature}`;
}

let cachedToken: { value: string; expiresAtMs: number } | null = null;

export async function getGoogleAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAtMs - 60_000 > Date.now()) return cachedToken.value;
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;
  if (!clientEmail || !privateKey) throw new Error('Google Sheets credentials are not configured.');

  const assertion = buildServiceAccountAssertion({ clientEmail, privateKey });
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  });
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!response.ok) {
    let detail = '';
    try {
      const body = await response.json() as { error?: string; error_description?: string };
      detail = [body.error, body.error_description].filter(Boolean).join(': ');
    } catch {
      detail = '';
    }
    throw new Error(`Google authentication failed${detail ? ` (${detail})` : ''}.`);
  }
  const json = await response.json() as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error('Google authentication returned no access token.');
  cachedToken = {
    value: json.access_token,
    expiresAtMs: Date.now() + (json.expires_in ?? 3600) * 1000
  };
  return cachedToken.value;
}
