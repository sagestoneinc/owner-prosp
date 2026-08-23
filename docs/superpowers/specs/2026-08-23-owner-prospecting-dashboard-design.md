# Owner Prospecting Dashboard Design

## Goal
Build a password-protected, read-only web dashboard for Seeto Realty's Owner Prospecting automation. The dashboard is deployed on Vercel, reads the live Google Sheet server-side, and never exposes Google credentials or full prospect PII in the main list response.

## Source of truth
Spreadsheet: `Leads - Owner Prospecting Project`
Spreadsheet ID: `1xTTb6Wl-4vSHE08VrtjMyNJUdOQqH0nxq03Y7qt4uBo`
Spreadsheet timezone: `America/New_York`

Source tabs:
- `Expired Listings`
- `Withdrawn & Cancelled Listings`
- `Active Listings`

Relevant columns:
- A MLS #
- B Address
- C City
- D State
- E Zipcode
- F County
- G Current Price
- H Status
- I Owners Name
- J Phone Number
- K Email
- L First Contact
- M Status 2
- N Drip Step
- O Next Send At
- P Last Sent At
- Q Stopped
- R Variant

The attached Apps Script dashboard is the visual and metric reference. Its oxblood/cream palette, KPI-card hierarchy, sequence funnel, A/B section, coverage section, and recent-activity emphasis should be preserved where the current data model supports them. The current Make workflow uses three source tabs, Zoho Mail API, Emailable, and sheet-based sequence state, so the web dashboard must not assume the attachment's separate `KPI` or `Suppression` tabs exist.

## Architecture

Browser -> password/session layer -> Next.js server routes -> Google Sheets API -> source spreadsheet.

- Next.js App Router deployed to Vercel.
- All Google Sheets calls execute server-side.
- A dedicated Google service account has Viewer access to only this spreadsheet.
- Google service-account credentials live only in Vercel environment variables.
- A shared dashboard password is stored as a password hash, not plaintext.
- Successful login sets an HTTP-only, Secure, SameSite=Lax signed session cookie.
- The main dashboard API returns only redacted lead fields.
- A separate authenticated detail endpoint returns a full lead only when a row is opened.
- Data is fetched live on page load and on manual refresh. No persistent dashboard database is introduced.

## Authentication
Environment variables:
- `DASHBOARD_PASSWORD_HASH`
- `SESSION_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GOOGLE_SPREADSHEET_ID`

Session design:
- Password POST is rate-limited per process with a small in-memory limiter to deter accidental brute force.
- Password verification uses Node `crypto.scrypt` against a `scrypt:<salt>:<hash>` value.
- Session cookie payload contains only an authentication marker and expiry, signed with HMAC-SHA256.
- Cookie max age: 12 hours.
- Logout clears the cookie.

## Data normalization

### Email
Use the first email from a multi-email cell, split on newline, comma, or semicolon. Normalize with lowercase + trim. Do not expose email in list payloads.

### Owner name
For display:
1. Split owner field on newlines.
2. Prefer the last non-empty line that does not look like a company/entity name.
3. Entity indicators include LLC, Inc, Corp, Corporation, Ltd, LP, Trust, Holdings, Investments, Properties, and Property Group.
4. If a person-like line is found, use its first word in title case for the redacted list.
5. Otherwise display `Owner`.

The full detail endpoint may return the original owner field.

### Address
Collapse repeated whitespace in the property address.

### Dates
Parse `Next Send At` and `Last Sent At` defensively. Metrics use the spreadsheet's logical business date in `America/New_York` for Today/This Week calculations so the dashboard aligns with the sheet.

## Metrics
Because the current source of truth does not have a separate event log, metrics are state-derived rather than event-derived.

Headline KPIs:
- Total prospects: all data rows across the three source tabs.
- With email: rows with a normalized first email.
- Active sequences: rows with email, `Stopped != Yes`, and drip step < 5.
- Due now: active rows where `Next Send At` is blank or <= current time.
- Sent today: rows whose `Last Sent At` falls on the current America/New_York date.
- Sent this week: rows whose `Last Sent At` falls in the current Monday-Sunday week.
- Contacted: rows with `Last Sent At` present or drip step > 0.
- Completed: rows with drip step >= 5.
- Stopped: rows where Q is `Yes` and drip step < 5, plus rows whose Status 2 indicates `Replied`, `Unsubscribed`, `Stop`, `Do Not Contact`, `Bounced`, or `Converted`.
- Known replies: rows whose Status 2 contains `Replied` or `Converted`. This is explicitly labeled "Known replies" because the current master automation's just-in-time Zoho reply check can suppress a send without persisting a reply reason into the sheet.

Sequence distribution:
- Count rows by current drip step 0-5.
- Display authored sequence labels from the attachment/current Make copy:
  - Step 1: Day 0 · Two numbers on the property
  - Step 2: Day 4 · The 11pm call
  - Step 3: Day 10 · A person, not a queue
  - Step 4: Day 18 · Already have a manager?
  - Step 5: Day 28 · Closing your file

A/B section:
- Count prospects assigned A or B from column R.
- Count contacted prospects by variant.
- Count known replies by variant when Status 2 supports it.
- Show reply rate only as `known replies / contacted prospects` and label it accordingly.
- If a variant has fewer than 300 contacted prospects, show "Too early to call" in line with the attached dashboard brief.

Source breakdown:
- Total / with email / active / due / contacted / stopped per source tab.

Upcoming sends:
- First 15 non-stopped rows with a valid `Next Send At` >= now, sorted ascending.

Recent activity:
- First 15 rows with `Last Sent At`, sorted descending.
- Show redacted first name, address, source, step, and timestamp.

Data quality:
- Count rows with malformed dates.
- Count rows with no email.
- Count rows with company-only/empty owner names.
- Surface as a compact "Data quality" card, not an alert unless parsing blocks a request.

## Lead table
Default list payload fields:
- stable id: `sourceKey:rowNumber`
- firstName
- address
- city
- state
- listingStatus
- source label
- dripStep
- lastSentAt
- nextSendAt
- stopped
- outcome/status2
- variant

Not included in list payload:
- email
- phone
- full owner field

Filters:
- text search over firstName/address/city
- source
- drip step
- active/stopped/completed
- due now

Sorting defaults to upcoming send time, with contacted-but-unscheduled rows after scheduled rows.

## Lead detail
Authenticated endpoint `/api/leads/[id]` reads the requested sheet row server-side and returns:
- full owner field
- property address and listing metadata
- phone
- normalized email(s)
- sequence state

The row identifier is validated against the fixed source-tab allowlist and a positive row number. No arbitrary range is accepted from the client.

## UI
Visual direction follows the attached dashboard mockup:
- Oxblood `#6E1423`
- Ink `#1F2328`
- Muted `#5A6068`
- Warm paper `#F6F3EF`
- Border `#E3DDD5`
- Good `#2E6B4F`
- Warning `#B4541F`

Desktop:
- Header with Seeto Realty / Owner Prospecting label, last refresh timestamp, refresh, logout.
- 4-column KPI grid collapsing responsively.
- Sequence funnel + source breakdown.
- A/B performance + upcoming sends.
- Recent activity.
- Search/filter lead table.
- Right-side lead detail drawer on large screens.

Mobile:
- 2-column KPI cards.
- Horizontal table overflow avoided by stacked lead rows/cards.
- Full lead detail opens as a full-width sheet/dialog.

No decorative animation beyond subtle loading and state transitions.

## Error handling
- Unauthenticated API requests return 401 without sheet data; the dashboard server page redirects unauthenticated users to `/login`.
- Missing environment variables produce a generic configuration error in the UI; secrets are never echoed.
- Google API failure returns 503 with a short safe message.
- Malformed individual rows are tolerated and counted in data quality metrics.
- Empty source tabs return zero metrics, not an exception.
- Main response includes `fetchedAt` and `timezone`.

## Testing
- Unit tests for email, owner, address, date, state, and KPI normalization.
- Unit tests for redaction: list payloads must not contain email/phone/full owner.
- Unit tests for authentication signing and expiry.
- Pure auth/session tests plus production route verification after the Next.js remote build; local route importing is blocked until npm dependencies are available.
- Build/typecheck/lint before deployment.
- Production verification: login page renders, unauthenticated dashboard redirects, authenticated dashboard data endpoint responds, and no PII appears in the list payload.

## Deployment
- Deploy to Vercel.
- Production remains configuration-incomplete until the dedicated Google service account is created, granted Viewer access to the spreadsheet, and its credentials plus the password hash/session secret are added to Vercel.
- Do not place the private key in source control, chat-visible code, or browser-side environment variables.
