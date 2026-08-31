const TRACKING_ID_RE = /^[A-Za-z0-9_-]{8,128}$/;

export function isValidTrackingId(id: string): boolean {
  return TRACKING_ID_RE.test(id);
}

export function makeTrackingWebhookUrl(base: string, id: string): string {
  const url = new URL(base);
  url.searchParams.set('id', id);
  return url.toString();
}
