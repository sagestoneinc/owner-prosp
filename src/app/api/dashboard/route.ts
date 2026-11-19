import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/auth';
import { buildDashboardData } from '@/lib/metrics';
import { fetchAgentReferralSummary, fetchEmailActivityRows, fetchSourceRowsWithWarnings } from '@/lib/sheets';
import { googleDiagnostic } from '@/lib/google-error';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const [{ rows, warnings }, emailActivity, agents] = await Promise.all([
      fetchSourceRowsWithWarnings(),
      fetchEmailActivityRows(),
      // The Listing Agents tab is optional: a failure here must not hide owner metrics.
      fetchAgentReferralSummary().catch(error => {
        console.error('[dashboard] Listing Agents fetch failed', { message: error instanceof Error ? error.message : String(error ?? '') });
        return null;
      })
    ]);
    const allWarnings = agents ? warnings : [...warnings, 'Listing Agents tab could not be read, so agent referral metrics are hidden.'];
    return NextResponse.json(buildDashboardData(rows, new Date(), emailActivity, { agents, warnings: allWarnings }), {
      headers: { 'Cache-Control': 'private, no-store, max-age=0' }
    });
  } catch (error) {
    const diagnostic = googleDiagnostic(error);
    const rawMessage = error instanceof Error ? error.message : String(error ?? '');
    console.error('[dashboard] Google Sheets fetch failed', { code: diagnostic.code, message: rawMessage });
    return NextResponse.json({ error: diagnostic.message, diagnostic: diagnostic.code }, { status: 503 });
  }
}
