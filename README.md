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

The app resolves these fields by header name and derives metrics from the Make tracking fields (`Status 2`, `Drip Step`, `Next Send At`, `Last Sent At`, `Stopped`, `Variant`). If a source tab's header row is invalid (for example a blank `Address` header), that tab is skipped and a warning is shown, rather than failing the whole dashboard.

Additional tabs read by the dashboard:
- `Email Activity`: per-recipient send log (historical opens).
- `Listing Agents` (optional): agent referral program. Only aggregate counts are returned to the browser. Log agent outcomes in its `Status 2` column (`Partner – interested`, `Referral agreement signed`, `Referred owner`, `Not interested`, `Unsubscribe`).

### Lead Disposition values

The lead drawer can write `Bad Lead` or a reply outcome: `Interested`, `Call booked`, `Agreement signed`, `Already managed`, `Wants to sell`, `Self-managing`, `Not interested`, `Wrong person`, `Unsubscribe`. Any outcome stops the drip. `Interested`, `Call booked` and `Agreement signed` count as positive replies. Values written by Make (`Replied`, `In sequence`, `Completed`) are still read.

### Outreach tracks

Leads are assigned to action-plan tracks automatically (see `docs/marketing/`):
- **T4:** Active listing. Owner email is paused.
- **T3:** Withdrawn. Owner email is gated.
- **T6:** No email.
- **T5:** Entity or LLC owner.
- **T1 / T2:** Expired / Cancelled.

The checks run in that order, and the first match wins.

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
