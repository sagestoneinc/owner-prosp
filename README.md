# Seeto Realty — Owner Prospecting Dashboard

Private, read-only Vercel dashboard for the Owner Prospecting automation.

## Security model

- Shared password verified server-side with scrypt.
- Authenticated session stored in an HTTP-only signed cookie.
- Google service-account credentials are server-only.
- Main dashboard data is redacted: no email, phone, or raw owner field.
- Full PII is loaded only when an authenticated user opens one lead.
- Google Sheets access should be granted as **Viewer** to a dedicated service account and limited to the source spreadsheet.

## Live data source

Spreadsheet: `Leads - Owner Prospecting Project`

Tabs:
- `Expired Listings`
- `Withdrawn & Cancelled Listings`
- `Active Listings`

The app reads columns A:R and derives metrics from the current Make tracking fields (`Status 2`, `Drip Step`, `Next Send At`, `Last Sent At`, `Stopped`, `Variant`).

## Required Vercel environment variables

Copy `.env.example` and configure:

- `DASHBOARD_PASSWORD_HASH`
- `SESSION_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SPREADSHEET_ID`

### Generate the password hash

Run:

```bash
node scripts/hash-password.mjs "YOUR PASSWORD"
```

Copy the resulting `scrypt:<salt>:<hash>` string to `DASHBOARD_PASSWORD_HASH`.

### Google service account

1. Create a dedicated service account in Google Cloud.
2. Enable the Google Sheets API for that project.
3. Create a JSON key for the service account.
4. Share the Owner Prospecting spreadsheet with the service-account email as **Viewer**.
5. Copy `client_email` to `GOOGLE_SERVICE_ACCOUNT_EMAIL`.
6. Copy `private_key` to `GOOGLE_PRIVATE_KEY`.

Never commit the JSON key or private key.

## Development

```bash
npm install
npm test
npm run dev
```

## Deployment

Deploy to Vercel, add all required environment variables for Production and Preview as appropriate, then redeploy. The app intentionally returns a configuration-required message rather than exposing any fallback data when credentials are absent.
