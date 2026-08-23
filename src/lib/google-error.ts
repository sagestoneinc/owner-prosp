export type GoogleDiagnostic =
  | 'GOOGLE_CONFIG_MISSING'
  | 'GOOGLE_PRIVATE_KEY_INVALID'
  | 'GOOGLE_AUTH_FAILED'
  | 'GOOGLE_SHEETS_403'
  | 'GOOGLE_SHEETS_404'
  | 'GOOGLE_SHEETS_FAILED';

export function googleDiagnostic(error: unknown): { code: GoogleDiagnostic; message: string } {
  const message = error instanceof Error ? error.message : String(error ?? '');
  if (/credentials are not configured/i.test(message)) {
    return { code: 'GOOGLE_CONFIG_MISSING', message: 'Google service-account credentials are missing in this deployment.' };
  }
  if (/private key/i.test(message) && /(invalid|parse|unsupported|decoder|pem)/i.test(message)) {
    return { code: 'GOOGLE_PRIVATE_KEY_INVALID', message: 'The Google service-account private key could not be parsed.' };
  }
  if (/Google authentication failed/i.test(message)) {
    return { code: 'GOOGLE_AUTH_FAILED', message: 'Google rejected the service-account authentication request.' };
  }
  if (/Google Sheets request failed \(403\)/i.test(message)) {
    return { code: 'GOOGLE_SHEETS_403', message: 'Google Sheets denied access. Share the spreadsheet with the service-account email and confirm Sheets API access.' };
  }
  if (/Google Sheets request failed \(404\)/i.test(message)) {
    return { code: 'GOOGLE_SHEETS_404', message: 'Google could not find the spreadsheet. Check GOOGLE_SPREADSHEET_ID and sharing.' };
  }
  return { code: 'GOOGLE_SHEETS_FAILED', message: 'The Google Sheets request failed.' };
}
