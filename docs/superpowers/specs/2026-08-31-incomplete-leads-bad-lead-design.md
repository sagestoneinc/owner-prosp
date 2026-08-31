# Incomplete Leads + Bad Lead Workflow — Design Spec

Date: 2026-08-31
Status: Approved in chat; schema corrections verified against the live spreadsheet

## Goal
Fix existing lead-detail saves, add a dedicated incomplete-leads work queue, and add a reversible Bad Lead disposition that removes a lead from actionable queues without deleting or reordering source-sheet rows.

## Root Cause Fix
The service-account JWT previously requested `https://www.googleapis.com/auth/spreadsheets.readonly`, so reads succeeded but Google rejected writes. Use `https://www.googleapis.com/auth/spreadsheets` and keep regression coverage for the JWT payload scope.

## Live Source-Sheet Schema
Expired and Withdrawn use the existing contact/campaign layout:
- J: Phone Number
- K: Email
- N:R: campaign-control fields
- S: Skip Reason — existing Make-owned field, must be preserved
- T: Lead Disposition

Active Listings has a different existing schema:
- J: Email
- K: First Contact
- L: Status 2
- M: Drip Step
- N: Next Send At
- O: Last Sent At
- P: Stopped
- Q: Variant
- R: Phone Number — newly reserved because R:Y was verified empty
- T: Lead Disposition

The lead editor must therefore use source-aware field mappings. It must never assume Phone J / Email K for Active Listings.

## Incomplete Leads Page
Add authenticated route `/incomplete-leads` with the same dashboard shell/navigation. It shows existing source-sheet leads where at least one core field is missing: owner, email, phone, or property address. Bad leads are excluded.

Each row shows source, owner/name, property, non-sensitive missing-field labels, and actions:
- Edit Details — opens/reuses the existing editor and refreshes the list after save.
- Mark Bad Lead — requires confirmation.

No new-lead creation is added.

## Navigation
Add primary navigation links:
- Dashboard
- Incomplete Leads

Display the current incomplete count on the page.

## Bad Lead Storage
Use source-sheet column T as `Lead Disposition` on Expired, Withdrawn & Cancelled, and Active source tabs.

Canonical value: `Bad Lead`.

The row is never deleted. Marking bad writes only T for that exact existing row. Restoring a bad lead clears T only. Expired/Withdrawn column S remains the existing `Skip Reason` and is never repurposed.

## Campaign Safety
Extend source-sheet reads through column T and add `disposition` to the prospect model.

A lead with disposition `Bad Lead` is:
- excluded from dashboard actionable/active/due counts,
- excluded from the standard Prospect Queue by default,
- excluded from `/incomplete-leads`,
- never sent by Make Scenario 6031109.

Update Make filters in both Expired and Withdrawn send paths so a row with column T equal to `Bad Lead` cannot reach validation/send modules. Use two layers: initial candidate search exclusion plus a final send-filter re-check after reading A:T.

Do not manually execute the production send scenario during verification.

## API
Add authenticated disposition mutation for an existing lead:
`PATCH /api/leads/[id]/disposition`
Body: `{ "disposition": "Bad Lead" | "" }`

Server validates the lead id and allowed values, confirms the existing row, and writes only column T.

The existing detail-editor PATCH cannot edit disposition or campaign-control fields. Contact/property writes are source-aware: common A:I fields, Expired/Withdrawn Phone J + Email K, and Active Email J + Phone R.

## UI Safety
Mark Bad Lead requires confirmation explaining that the lead will be removed from active/incomplete queues and excluded from outreach but retained in the source sheet.

A `Bad leads` view in the main queue allows restoration in the first release.

## Tests
Add coverage for:
- full Sheets OAuth scope in service-account assertion,
- source-aware Expired/Withdrawn and Active parsing,
- disposition parsing from column T,
- Bad Lead exclusion from active/due/incomplete logic,
- disposition endpoint validation helpers,
- generated disposition write touches T only,
- normal lead editor uses the correct source-specific contact columns,
- incomplete page data excludes bad leads.

## Verification
- unit tests added and run where local execution is available,
- Vercel preview build succeeds,
- PR diff reviewed for write safety,
- Make scenario re-read confirms Bad Lead exclusion filters and A:T reads,
- no manual production campaign run,
- merge only after preview is green,
- verify production Vercel deployment succeeds.

## Non-Goals
- physical row deletion,
- adding new leads,
- automatically changing historical campaign outcomes,
- clearing contact information when marking bad,
- manually triggering outbound email during rollout.
