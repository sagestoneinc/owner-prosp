# Existing Lead Details Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let authenticated dashboard users complete missing information on existing owner-prospecting leads while guaranteeing campaign-control columns are never overwritten.

**Architecture:** Extend the existing authenticated lead endpoint with a PATCH route. Validate a strict editable payload, convert it into targeted Google Sheets batch updates for columns A:K only, write only changed cells to the resolved existing row, then return the canonical refreshed lead. Add non-sensitive missing-detail metadata to dashboard rows and an edit form inside the existing lead drawer.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.8, Google Sheets API, existing cookie/session auth.

**Spec:** `docs/superpowers/specs/2026-08-31-existing-lead-details-editor-design.md`

## Global Constraints
- Existing leads only; no append/create/delete behavior.
- Editable fields are MLS, property address, city, state, ZIP, county, current price, listing status, owner, phone, and email(s).
- Campaign-control columns L:R are protected and must never appear in generated write ranges.
- Server-side validation is authoritative; unknown/protected input keys are rejected.
- Multiple emails may be separated by comma, semicolon, or newline and must normalize to valid addresses.
- Existing authenticated session-cookie verification must protect PATCH.
- Successful saves refresh the canonical row and dashboard.

---

### Task 1: Lead update validation and safe range generation

**Files:**
- Create: `src/lib/lead-update.ts`
- Create: `src/lib/lead-update.test.ts`
- Modify: `src/lib/run-tests.ts`

**Interfaces:**
- Produces: `validateLeadUpdatePayload(input: unknown): LeadUpdatePayload`
- Produces: `buildLeadUpdateRanges(sourceTitle: string, rowNumber: number, payload: LeadUpdatePayload): Array<{ range: string; values: string[][] }>`

- [ ] **Step 1: Write failing tests** covering trimmed text, multiple-email normalization, rejection of malformed non-empty emails, rejection of unknown/protected keys, and assertion that generated ranges use only columns A:K.
- [ ] **Step 2: Run `npm test` and verify the new tests fail because the module does not exist.**
- [ ] **Step 3: Implement strict validation.** Use an explicit key-to-column map: `mls:A`, `address:B`, `city:C`, `state:D`, `zipcode:E`, `county:F`, `currentPrice:G`, `listingStatus:H`, `ownerRaw:I`, `phone:J`, `emails:K`. Reject every key outside this map. Keep phone/state/ZIP/price as trimmed strings. Normalize email input with `normalizeEmailCell`; if the submitted email field is non-empty and normalizes to zero addresses, return a validation error.
- [ ] **Step 4: Implement targeted range generation.** Build one-cell ranges such as `'Expired Listings'!K22`; never build an `A:R` whole-row update.
- [ ] **Step 5: Run `npm test` and verify all tests pass.**

### Task 2: Missing-detail metadata and filters

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/metrics.ts`
- Modify: `src/lib/lead-filter.ts`
- Modify: corresponding tests

**Interfaces:**
- Produces `RedactedLead.missingDetails: boolean`
- Produces `RedactedLead.missingFields: Array<'owner'|'email'|'phone'|'address'>`
- Extends `LeadFilters` with `details: 'all'|'missing'|'complete'`

- [ ] **Step 1: Add failing tests** for a lead missing owner/email/phone/address and for combining the details filter with existing search/source/step/state filters.
- [ ] **Step 2: Run `npm test` and verify failures.**
- [ ] **Step 3: Add missing-detail calculation** without exposing email or phone values in the redacted payload.
- [ ] **Step 4: Extend lead filtering** so `missing` and `complete` are additive to existing filters.
- [ ] **Step 5: Run `npm test` and verify all tests pass.**

### Task 3: Google Sheets targeted update helper and PATCH endpoint

**Files:**
- Modify: `src/lib/sheets.ts`
- Modify: `src/app/api/leads/[id]/route.ts`
- Add/modify tests as needed

**Interfaces:**
- Produces: `updateLeadDetails(id: string, payload: LeadUpdatePayload): Promise<FullLead | null>`
- PATCH `/api/leads/[id]` returns refreshed `FullLead` or 400/401/404/503.

- [ ] **Step 1: Add failing tests** for lead-id resolution and safe batch-update request generation.
- [ ] **Step 2: Run `npm test` and verify failures.**
- [ ] **Step 3: Add authenticated PATCH.** Reject unauthorized requests before reading the body. Validate the id and payload. Resolve the source title and exact existing row. Confirm the row exists using the existing fetch path before writing.
- [ ] **Step 4: Call Google Sheets `values:batchUpdate`** with only generated A:K ranges and `valueInputOption: USER_ENTERED` (or RAW if existing data preservation requires it). Do not include L:R under any condition.
- [ ] **Step 5: Re-fetch and return the canonical updated lead.**
- [ ] **Step 6: Run `npm test` and verify all tests pass.**

### Task 4: Lead drawer editing UX

**Files:**
- Modify: `src/components/lead-drawer.tsx`
- Modify: `src/components/dashboard-client.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- `LeadDrawer` receives an `onSaved?: () => void` callback.

- [ ] **Step 1: Add edit/read state to the drawer.** Keep read mode unchanged and add `Edit details`.
- [ ] **Step 2: Build the form** for the 11 approved fields. Use a multiline email textarea. Keep campaign fields visible as read-only context.
- [ ] **Step 3: Add save/cancel states.** PATCH the lead endpoint, display field/server errors, reload the returned canonical lead on success, then invoke `onSaved` so dashboard data refreshes.
- [ ] **Step 4: Add responsive CSS** for two-column desktop / single-column mobile form layout and save actions.
- [ ] **Step 5: Run `npm test` and `npm run build`.**

### Task 5: Missing-details queue UX and production verification

**Files:**
- Modify: `src/components/lead-table.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Details filter values: `all`, `missing`, `complete`.

- [ ] **Step 1: Add the fifth filter** with `All records`, `Missing details`, and `Complete details`.
- [ ] **Step 2: Add a `Needs details` badge** for incomplete leads without exposing missing field values.
- [ ] **Step 3: Run the full unit test suite and production build.**
- [ ] **Step 4: Review the complete PR diff specifically for any Google write touching columns L:R.**
- [ ] **Step 5: Verify Vercel preview deployment succeeds.**
- [ ] **Step 6: Merge the PR and verify production deployment succeeds.**
