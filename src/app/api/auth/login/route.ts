import { NextRequest, NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE, verifyDashboardPassword } from '@/lib/auth';

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

function clientKey(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

function allowed(key: string): boolean {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) {
    attempts.set(key, { count: 0, resetAt: now + WINDOW_MS });
    return true;
  }
  return current.count < MAX_ATTEMPTS;
}

function recordFailure(key: string) {
  const current = attempts.get(key) || { count: 0, resetAt: Date.now() + WINDOW_MS };
  current.count += 1;
  attempts.set(key, current);
}

export async function POST(request: NextRequest) {
  const key = clientKey(request);
  if (!allowed(key)) {
    return NextResponse.json({ error: 'Too many attempts. Try again later.' }, { status: 429 });
  }

  let password = '';
  try {
    const body = await request.json() as { password?: string };
    password = body.password || '';
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  try {
    if (!verifyDashboardPassword(password)) {
      recordFailure(key);
      return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }
  } catch {
    return NextResponse.json({ error: 'Dashboard authentication is not configured yet.' }, { status: 503 });
  }

  attempts.delete(key);
  try {
    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, createSessionToken(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60
    });
    return response;
  } catch {
    return NextResponse.json(
      { error: 'Dashboard session is not configured. Check SESSION_SECRET in Vercel and redeploy.' },
      { status: 503 }
    );
  }
}
