import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { fetchLeadById, parseLeadId, updateLeadDetails } from '@/lib/sheets';
import { validateLeadUpdatePayload } from '@/lib/lead-update';

export const dynamic = 'force-dynamic';

function authorized(request: NextRequest) { return verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value); }
function leadDataError(message:string, fallback:string){
  if(/not configured/i.test(message)) return {error:'Dashboard data connection is not configured yet.',status:503};
  if(/missing required header|duplicate header/i.test(message)) return {error:message,status:409};
  if(/Google Sheets request failed \(403\)/i.test(message)) return {error:'Google Sheets denied the update. Confirm the dashboard service account has Editor access to the spreadsheet.',status:503};
  if(/Google Sheets request failed/i.test(message)) return {error:message,status:503};
  return {error:fallback,status:503};
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  if (!parseLeadId(id)) return NextResponse.json({ error: 'Invalid lead id.' }, { status: 400 });
  try {
    const lead = await fetchLeadById(id);
    if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    return NextResponse.json(lead, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
  } catch (error) {
    const problem=leadDataError(error instanceof Error?error.message:'','Lead data is temporarily unavailable.');
    return NextResponse.json({error:problem.error},{status:problem.status});
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!authorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await context.params;
  if (!parseLeadId(id)) return NextResponse.json({ error: 'Invalid lead id.' }, { status: 400 });
  let payload;
  try { payload = validateLeadUpdatePayload(await request.json()); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid update payload.' }, { status: 400 }); }
  try {
    const lead = await updateLeadDetails(id, payload);
    if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    return NextResponse.json(lead, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
  } catch (error) {
    const problem=leadDataError(error instanceof Error?error.message:'','Lead update failed. Please try again.');
    return NextResponse.json({error:problem.error},{status:problem.status});
  }
}
