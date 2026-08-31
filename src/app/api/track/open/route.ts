import { NextRequest, NextResponse } from 'next/server';
import { isValidTrackingId, makeTrackingWebhookUrl } from '@/lib/tracking';

export const dynamic = 'force-dynamic';

const PIXEL = Buffer.from('R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=', 'base64');

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')?.trim() || '';
  const webhook = process.env.MAKE_OPEN_TRACKING_WEBHOOK_URL?.trim();

  if (webhook && isValidTrackingId(id)) {
    try {
      await fetch(makeTrackingWebhookUrl(webhook, id), { method: 'GET', cache: 'no-store' });
    } catch (error) {
      console.error('[tracking] open webhook failed', error instanceof Error ? error.message : String(error));
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Content-Length': String(PIXEL.length),
      'Cache-Control': 'private, no-store, no-cache, max-age=0, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0'
    }
  });
}
