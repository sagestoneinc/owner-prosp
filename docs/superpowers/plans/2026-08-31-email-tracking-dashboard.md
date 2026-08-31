# Email Tracking Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add recipient-level send/open tracking to the Owner Prospecting system and surface the KPIs in the existing Vercel dashboard.

**Architecture:** Make remains the only writer to Google Sheets. The Vercel app stays read-only against Sheets, exposes a public 1x1 tracking-pixel route that forwards opaque tracking IDs to a dedicated Make webhook, and extends the existing dashboard data model to read an `Email Activity` sheet.

**Tech Stack:** Next.js 15, React 19, TypeScript, Google Sheets API, Make.com, Zoho Mail.

**Spec:** `docs/superpowers/specs/2026-08-31-email-tracking-dashboard-design.md`

## Global Constraints

- Keep the dashboard password-protected.
- Keep the Google service account read-only.
- Never expose PII from the open-tracking endpoint.
- Track each recipient email independently for multi-email leads.
- Label open metrics as tracked opens because privacy/image proxies make opens directional.

---

### Task 1: Tracking data types and parsing

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/sheets.ts`
- Create: `src/lib/email-activity.test.ts`
- Create: `src/lib/email-activity.ts`

**Interfaces:**
- Produces: `EmailActivityRow`, `EmailTrackingMetrics`, `mapEmailActivityRows(values)`.

- [ ] Write tests for mapping Email Activity rows and aggregating sent/opened/not-opened/open-rate values.
- [ ] Run `npm test` and confirm the new tests fail because the implementation does not exist.
- [ ] Implement the minimal parser and metric helpers.
- [ ] Run `npm test` and confirm all tests pass.

### Task 2: Dashboard metrics integration

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/metrics.ts`
- Modify: `src/lib/metrics.test.ts`
- Modify: `src/app/api/dashboard/route.ts`
- Modify: `src/lib/sheets.ts`

**Interfaces:**
- `fetchEmailActivityRows(): Promise<EmailActivityRow[]>`
- `buildDashboardData(rows, now, emailActivity)` includes email tracking KPIs.

- [ ] Add failing tests proving dashboard headline and A/B data include sent/opened/open-rate values from recipient-level activity.
- [ ] Run tests and verify RED.
- [ ] Extend the Sheets loader and dashboard builder.
- [ ] Run tests and verify GREEN.

### Task 3: Tracking pixel endpoint

**Files:**
- Create: `src/lib/tracking.test.ts`
- Create: `src/lib/tracking.ts`
- Create: `src/app/api/track/open/route.ts`

**Interfaces:**
- `isValidTrackingId(id: string): boolean`
- `trackingWebhookUrl(id: string): string`

- [ ] Add failing tests for opaque tracking ID validation and webhook URL creation.
- [ ] Run tests and verify RED.
- [ ] Implement helpers and a public GET route that forwards the ID to `MAKE_OPEN_TRACKING_WEBHOOK_URL` and always returns a 1x1 transparent GIF with no-store headers.
- [ ] Run tests and verify GREEN.

### Task 4: Dashboard UI

**Files:**
- Modify: `src/components/dashboard-client.tsx`
- Modify: `src/components/variant-panel.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes new `DashboardData.headline` and variant tracking fields.

- [ ] Add KPI cards for Emails Sent, Tracked Opens, Tracked Open Rate, and Not Opened.
- [ ] Add tracked-open performance to A/B panel and clarify that opens are directional.
- [ ] Keep existing responsive visual language and auth behavior.
- [ ] Run `npm test` and `npm run build`.

### Task 5: Make send logging and pixel injection

**Systems:**
- Scenario `6031109`
- Spreadsheet `Leads - Owner Prospecting Project` → `Email Activity`

- [ ] Generate an opaque tracking ID per recipient/send before building HTML.
- [ ] Append `<img src="https://seeto-email.vercel.app/api/track/open?id=<tracking-id>" width="1" height="1" ...>` to the HTML content.
- [ ] After successful Zoho send, append one Email Activity row with recipient-level metadata and Zoho message ID.
- [ ] Preserve lead-level drip progression.
- [ ] Do not force-run the production scenario.

### Task 6: Make open webhook writer

**Systems:**
- Scenario `6103959`

- [ ] Teach the webhook the `id` query field.
- [ ] Find the Email Activity row whose Tracking ID matches `id`.
- [ ] Update Opened, First Opened At, Last Opened At, and Open Count.
- [ ] Activate and verify the scenario with a synthetic tracking ID row only.

### Task 7: Workbook formatting

**Spreadsheet:** `Leads - Owner Prospecting Project`

- [ ] Apply matching header styling to Expired, Withdrawn, Active, Listing Agents, Dashboard, and Email Activity.
- [ ] Freeze header rows and key identifying columns.
- [ ] Wrap body cells and set practical column widths.
- [ ] Add conditional formatting for stopped leads, validation flags, and opened events.
- [ ] Re-read representative ranges and metadata to confirm formatting and formulas remain intact.

### Task 8: Deployment verification

- [ ] Confirm the Vercel project connected to `sagestoneinc/owner-prosp` has `MAKE_OPEN_TRACKING_WEBHOOK_URL` configured.
- [ ] Verify tests and build on the final commit.
- [ ] Verify `/api/track/open?id=<synthetic-id>` returns an image and triggers the Make tracking scenario.
- [ ] Verify the production dashboard displays recipient-level tracking KPIs without exposing email addresses on the main page.
