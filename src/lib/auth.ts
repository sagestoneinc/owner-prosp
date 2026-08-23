import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'owner_dashboard_session';
const SESSION_MS = 12 * 60 * 60 * 1000;

export function hashPassword(password: string, salt = randomBytes(16).toString('base64url')): string {
  const derived = scryptSync(password, salt, 32);
  return `scrypt:${Buffer.from(salt).toString('base64url')}:${derived.toString('base64url')}`;
}


export function verifyPasswordAgainstHash(password: string, encoded: string): boolean {
  try {
    const [scheme, saltB64, hashB64] = encoded.split(':');
    if (scheme !== 'scrypt' || !saltB64 || !hashB64) return false;
    const salt = Buffer.from(saltB64, 'base64url').toString();
    const expected = Buffer.from(hashB64, 'base64url');
    const actual = scryptSync(password, salt, expected.length);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

export function verifyDashboardPassword(password: string): boolean {
  const encoded = process.env.DASHBOARD_PASSWORD_HASH;
  if (!encoded) throw new Error('Dashboard password is not configured.');
  return verifyPasswordAgainstHash(password, encoded);
}

function resolveSecret(secret?: string): string {
  const value = secret ?? process.env.SESSION_SECRET;
  if (!value) throw new Error('Session secret is not configured.');
  return value;
}

export function createSessionToken(now = new Date(), secret?: string): string {
  const payload = Buffer.from(JSON.stringify({
    v: 1,
    exp: now.getTime() + SESSION_MS
  })).toString('base64url');
  const signature = createHmac('sha256', resolveSecret(secret)).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null, now = new Date(), secret?: string): boolean {
  if (!token) return false;
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return false;
    const expected = createHmac('sha256', resolveSecret(secret)).update(payload).digest();
    const received = Buffer.from(signature, 'base64url');
    if (expected.length !== received.length || !timingSafeEqual(expected, received)) return false;
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { v?: number; exp?: number };
    return parsed.v === 1 && typeof parsed.exp === 'number' && parsed.exp > now.getTime();
  } catch {
    return false;
  }
}
