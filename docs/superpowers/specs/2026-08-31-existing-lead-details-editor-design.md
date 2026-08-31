# Existing Lead Details Editor — Design Spec

Date: 2026-08-31
Status: Awaiting user review

## Goal
Add a safe, easy editing workflow to the existing Seeto Realty owner-prospecting dashboard so authenticated users can complete missing details for leads that already exist in the Google Sheet.

The feature will not create new leads and will not allow users to edit campaign-control fields.

## User Experience

### Entry points
1. The existing Prospect Queue gets a `Missing details` filter.
2. A lead can be opened in the existing Lead Drawer.
3. The drawer gets an `Edit details` action.
4. Edit mode replaces editable detail blocks with a compact form while retaining the lead identity and source context.

### Editable fields
- Owner name
- Email address(es)
- Phone
- Property address
- City
- State
- ZIP code
- County
- MLS number
- Current price
- Listing status

### Read-only / protected fields
These remain visible but cannot be changed through the editor:
- Source tab
- First contact
- Drip step
- Next send at
- Last sent at
- Stopped flag
- A/B variant
- Campaign outcome / Status 2
- Email Activity / tracking fields

### Save behavior
- `Save changes` validates the form and writes only the approved editable columns to the exact existing Google Sheet row.
- `Cancel` exits edit mode without writing.
- After a successful save, the drawer reloads the canonical row and the dashboard refreshes so filters and missing-detail indicators reflect the new data.
- The UI shows explicit saving, success, validation-error, and server-error states.

## Missing Details Definition
A lead is considered to have missing details when one or more of these core enrichment fields are empty:
- Owner name / usable first name
- Email
- Phone
- Property address

The Missing Details filter will be additive to the existing search/source/step/state filters.

## Data Mapping
The existing source rows map columns as follows:
- A: MLS
- B: Property Address
- C: City
- D: State
- E: ZIP
- F: County
- G: Current Price
- H: Listing Status
- I: Owner
- J: Phone
- K: Email(s)
- L: First Contact — protected
- M: Status 2 / Outcome — protected
- N: Drip Step — protected
- O: Next Send At — protected
- P: Last Sent At — protected
- Q: Stopped — protected
- R: Variant — protected

The write operation may update A:K selectively but must never update L:R.

## API Design
Extend `src/app/api/leads/[id]/route.ts` with `PATCH`.

### Authentication
Use the same authenticated session-cookie verification as the existing GET endpoint. Unauthenticated writes return HTTP 401.

### Request
The route accepts a strict object containing only approved editable fields. Unknown fields are rejected rather than ignored.

### Validation
Server-side validation is authoritative:
- Lead ID must resolve to `expired`, `withdrawn`, or `active` plus an existing row number.
- The row must already exist; no append or row creation is allowed.
- Emails are normalized using the existing email normalization rules; multiple emails may be separated by comma, semicolon, or newline.
- Non-empty email input must contain at least one valid normalized address.
- Text values are trimmed and length-limited.
- State/ZIP/phone/current-price values remain text so formatting is preserved.

### Write safety
The server writes only the specified editable cells in the resolved row. It must not issue a whole-row replacement that could overwrite campaign fields changed by Make between read and save.

The Google Sheets API write helper will use targeted `values:batchUpdate` ranges for changed editable cells only.

## Concurrency and Campaign Safety
Because Make may update campaign columns while a user is editing, the web editor will never write L:R. This prevents a stale browser state from overwriting drip progress, send dates, stop flags, outcomes, or A/B assignment.

For editable A:K fields, the save operation is intentionally last-write-wins. The refreshed canonical row is returned after save.

## Dashboard Data Model
Add missing-detail metadata to the redacted dashboard row so filtering does not require exposing email/phone values in the main dashboard payload:
- `missingDetails: boolean`
- optionally `missingFields: string[]` containing non-sensitive labels only, e.g. `email`, `phone`, `owner`, `address`

The full values remain available only through the authenticated lead-detail endpoint.

## UI Details
### Prospect Queue
- Add a fifth filter control: `All records` / `Missing details` / `Complete details`.
- Optionally show a small `Needs details` badge in the Status/Name area for affected rows.

### Lead Drawer
Read mode keeps the current layout.

Edit mode:
- two-column form on desktop, single column on mobile
- email field supports multiple lines
- clear required/validation messages near affected fields
- `Cancel` and `Save changes` actions pinned near the top/bottom for usability
- automation-controlled fields remain rendered as read-only context below the form

## Files Expected to Change
- `src/lib/types.ts`
- `src/lib/normalize.ts` or a new focused lead-update validation module
- `src/lib/sheets.ts`
- `src/lib/metrics.ts`
- `src/lib/lead-filter.ts`
- corresponding unit tests
- `src/app/api/leads/[id]/route.ts`
- `src/components/lead-drawer.tsx`
- `src/components/lead-table.tsx`
- `src/components/dashboard-client.tsx` only if a refresh callback is required
- `src/app/globals.css`
- `src/lib/run-tests.ts` if a new test file is added

## Testing Strategy
Use TDD.

Unit coverage must verify:
- missing-details detection
- Missing Details filter behavior
- editable payload validation
- multiple-email normalization
- unknown/protected field rejection
- lead ID/source-row resolution
- Google write-range construction touches only A:K-approved fields
- no L:R automation column can be included in a generated update

Deployment verification:
- existing tests remain green
- Vercel preview build succeeds
- review PR diff for protected-column safety
- merge only after preview is green
- verify production Vercel deployment success

## Explicit Non-Goals
- Adding brand-new leads
- Deleting leads
- Changing source tabs
- Editing drip step, variant, campaign outcome, stop state, or send dates
- Triggering a Make scenario manually after an edit
- Automatically sending an email immediately when missing information is completed

A completed lead simply becomes eligible for the existing campaign logic according to its current protected automation fields and the next normal Make run.

## Success Criteria
An authenticated user can locate an incomplete existing lead, open it, safely enter missing contact/property information, save it to the exact source-sheet row, and immediately see the refreshed record—without any possibility of the editor overwriting campaign-control columns.