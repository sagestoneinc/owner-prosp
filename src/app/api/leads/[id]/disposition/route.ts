import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { validateDispositionPayload } from '@/lib/lead-disposition';
import { parseLeadId, updateLeadDisposition } from '@/lib/sheets';

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  if (!parseLeadId(id)) return NextResponse.json({ error: 'Invalid lead id.' }, { status: 400 });
  let payload;
  try { payload = validateDispositionPayload(await request.json()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid disposition.' }, { status: 400 }); }
  try {
    const lead = await updateLeadDisposition(id, payload.disposition);
    if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    return NextResponse.json(lead, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const configuration = /not configured/i.test(message);
    return NextResponse.json({ error: configuration ? 'Dashboard data connection is not configured yet.' : 'Lead disposition update failed. Please try again.' }, { status: 503 });
  }
}
