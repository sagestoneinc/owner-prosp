# Email Tracking & Live Dashboard Design

## Goal
Extend the existing owner-prospecting dashboard so recipient-level sends and tracked opens are visible at https://seeto-email.vercel.app/, while Make remains the only writer to the source Google Sheet.

## Architecture
- Add an `Email Activity` tab to the existing `Leads - Owner Prospecting Project` workbook. One row represents one successfully sent email to one recipient address.
- Scenario 6031109 logs every successful Zoho send into `Email Activity` with source, source row, MLS, recipient, A/B variant, drip step, subject, Zoho message ID, sent timestamp, validation state, tracking ID, and tracking type.
- HTML messages include a 1x1 pixel URL pointing to `/api/track/open?id=<tracking-id>` on the dashboard app.
- `/api/track/open` is public and returns an image response. It forwards the tracking ID to a dedicated Make webhook. Make updates the matching `Email Activity` row, setting Opened=Yes, First Opened At on first open, Last Opened At on every open, and incrementing Open Count.
- The dashboard Google service account remains read-only. It reads `Email Activity` together with the existing lead tabs.

## Dashboard KPIs
Prominently display: Emails Sent, Tracked Opens, Tracked Open Rate, Not Opened, Known Replies, Reply Rate, Active Sequences, Due Now, Rejected/Skipped validation flags, multi-email lead count, and A/B performance. Open metrics are explicitly labeled as tracked opens because image proxying and privacy protections can make them imperfect.

## Recipient-level behavior
Each valid email address for a lead is treated as its own recipient/send record. Opening one address does not mark other addresses for the same lead as opened.

## Sheet styling
Apply one visual system across operational tabs: dark charcoal header, white text, bold labels, frozen header row, frozen identifying columns, wrapped content, sensible widths, and conditional emphasis for stopped/opened/exception states. The existing Dashboard tab remains formula-driven; `Email Activity` becomes the detailed event log.

## Security
- Dashboard remains password-protected.
- The pixel endpoint does not expose PII; it accepts only an opaque tracking ID.
- No Google private key or service-account credential is exposed client-side.
- Make owns all sheet writes; the Vercel app remains a read-only Google Sheets consumer.

## Tracking caveat
Tracked opens are directional, not definitive. Apple Mail Privacy Protection, Gmail image proxies, security scanners, and image blocking can create false positives or false negatives. Replies remain the stronger engagement signal.
