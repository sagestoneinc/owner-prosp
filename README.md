# Seeto Realty — Owner Prospecting Dashboard

Private Vercel dashboard for the Owner Prospecting automation, including controlled editing of existing lead details.

## Security model

- Shared password verified server-side with scrypt.
- Authenticated session stored in an HTTP-only signed cookie.
- Google service-account credentials are server-only.
- Main dashboard data is redacted: no email, phone, or raw owner field.
- Full PII is loaded only when an authenticated user opens one lead.
- Google Sheets access must be granted as **Editor** to a dedicated service account and limited to the source spreadsheet so authenticated lead-detail updates can be saved.
- Lead updates resolve target columns from the live header row and reject missing or duplicate required headers instead of writing by a fixed column position.

## Live data source

Spreadsheet: `Leads - Owner Prospecting Project`

Tabs:
- `Expired Listings`
- `Withdrawn & Cancelled Listings`
- `Active Listings`

Canonical lead headers A:T:
`MLS # | Address | City | State | Zipcode | County | Current Price | Status | Owners Name | Phone Number | Email | First Contact | Status 2 | Drip Step | Next Send At | Last Sent At | Stopped | Variant | Skip Reason | Lead Disposition`

The app resolves these fields by header name and derives metrics from the Make tracking fields (`Status 2`, `Drip Step`, `Next Send At`, `Last Sent At`, `Stopped`, `Variant`).

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
4. Share the Owner Prospecting spreadsheet with the service-account email as **Editor**.
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
