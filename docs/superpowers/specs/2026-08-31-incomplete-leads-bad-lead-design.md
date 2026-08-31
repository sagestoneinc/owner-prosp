# Incomplete Leads + Bad Lead Workflow — Design Spec

Date: 2026-08-31
Status: Approved in chat

## Goal
Fix existing lead-detail saves, add a dedicated incomplete-leads work queue, and add a reversible Bad Lead disposition that removes a lead from actionable queues without deleting or reordering source-sheet rows.

## Root Cause Fix
The current service-account JWT requests `https://www.googleapis.com/auth/spreadsheets.readonly`, so reads succeed but Google rejects writes. Change the scope to `https://www.googleapis.com/auth/spreadsheets` and add regression coverage for the JWT payload scope.

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
Use source-sheet column S as `Lead Disposition` for Expired, Withdrawn & Cancelled, and Active source tabs.

Canonical value: `Bad Lead`.

The row is never deleted. Existing A:R data remains intact. Marking bad writes only S for that exact existing row. Restoring a bad lead clears S only.

## Campaign Safety
Extend source-sheet reads from A:R to A:S and add `disposition` to the prospect model.

A lead with disposition `Bad Lead` is:
- excluded from dashboard actionable/active/due counts,
- excluded from the standard Prospect Queue by default,
- excluded from `/incomplete-leads`,
- never sent by Make Scenario 6031109.

Update Make filters in both Expired and Withdrawn send paths so a row with column S equal to `Bad Lead` cannot reach validation/send modules. This is additive to existing reply/validation suppression.

Do not manually execute the production send scenario during verification.

## API
Add authenticated disposition mutation for an existing lead:
`PATCH /api/leads/[id]/disposition`
Body: `{ "disposition": "Bad Lead" | "" }`

Server validates the lead id and allowed values, confirms the existing row, and writes only column S.

The existing detail-editor PATCH remains limited to A:K and cannot edit disposition or campaign-control fields.

## UI Safety
Mark Bad Lead requires confirmation explaining that the lead will be removed from active/incomplete queues and excluded from outreach but retained in the source sheet.

A `Bad leads` filter in the main queue allows restoration in the first release.

## Tests
Add coverage for:
- full Sheets OAuth scope in service-account assertion,
- disposition parsing from column S,
- Bad Lead exclusion from active/due/incomplete logic,
- disposition endpoint validation helpers,
- generated disposition write touches S only,
- normal lead editor remains A:K only,
- incomplete page data excludes bad leads.

## Verification
- unit tests added and run where local execution is available,
- Vercel preview build succeeds,
- PR diff reviewed for write safety,
- Make scenario re-read confirms Bad Lead exclusion filters,
- no manual production campaign run,
- merge only after preview is green,
- verify production Vercel deployment succeeds.

## Non-Goals
- physical row deletion,
- adding new leads,
- automatically changing historical campaign outcomes,
- clearing contact information when marking bad,
- manually triggering outbound email during rollout.
