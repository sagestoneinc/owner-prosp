# Incomplete Leads + Bad Lead Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore lead-detail saving, add a dedicated incomplete-leads work queue, and add a reversible Bad Lead disposition that prevents outreach without deleting source rows.

**Architecture:** Expand the Google service-account scope to writable Sheets access, extend source-row parsing through column S, and model `Bad Lead` as a reversible disposition. Add authenticated disposition mutation and a dedicated `/incomplete-leads` page reusing the existing lead editor. Update Make Scenario 6031109 filters so bad leads cannot reach validation/send modules.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.8, Google Sheets API, Make.com scenario 6031109, existing cookie/session auth.

**Spec:** `docs/superpowers/specs/2026-08-31-incomplete-leads-bad-lead-design.md`

## Global Constraints
- Never delete or reorder source rows.
- Existing detail edits remain limited to A:K.
- Bad Lead disposition writes only S on the exact existing source row.
- A Bad Lead is excluded from actionable/active/due/incomplete queues and outbound Make send paths.
- Do not manually run production Scenario 6031109 during verification.
- Restore clears only column S.

---

### Task 1: Writable Google Sheets scope regression fix

**Files:**
- Modify: `src/lib/google-auth.ts`
- Modify: `src/lib/google-auth.test.ts`

**Interfaces:**
- Existing `buildServiceAccountAssertion()` must encode scope `https://www.googleapis.com/auth/spreadsheets`.

- [ ] **Step 1:** Add a test that decodes the JWT payload and asserts the full Sheets scope.
- [ ] **Step 2:** Verify the test would fail against the prior read-only scope.
- [ ] **Step 3:** Change the scope constant to `https://www.googleapis.com/auth/spreadsheets`.
- [ ] **Step 4:** Run the unit test suite when local execution is available and rely on Vercel TypeScript build as deployment gate.

### Task 2: Disposition data model and queue logic

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/sheets.ts`
- Modify: `src/lib/metrics.ts`
- Modify: `src/lib/lead-filter.ts`
- Modify: corresponding tests

**Interfaces:**
- `ProspectRow.disposition: string`
- `RedactedLead.disposition: string`
- `RedactedLead.badLead: boolean`
- Source reads use A:S.
- Standard queue excludes Bad Lead by default but can filter to Bad Leads.

- [ ] **Step 1:** Add tests for parsing S and identifying Bad Lead.
- [ ] **Step 2:** Extend row parsing/read ranges to A:S.
- [ ] **Step 3:** Make `isActive`/`isDue` return false for Bad Lead and omit bad leads from normal queue/upcoming actionable lists.
- [ ] **Step 4:** Extend lead filtering with a disposition filter supporting `active` and `bad` views.
- [ ] **Step 5:** Verify incomplete filtering excludes bad leads.

### Task 3: Safe disposition write API

**Files:**
- Create: `src/lib/lead-disposition.ts`
- Create: `src/lib/lead-disposition.test.ts`
- Modify: `src/lib/sheets.ts`
- Create: `src/app/api/leads/[id]/disposition/route.ts`
- Modify: `src/lib/run-tests.ts`

**Interfaces:**
- `validateDispositionPayload(input): { disposition: 'Bad Lead' | '' }`
- `buildDispositionRange(sourceTitle,rowNumber,value)` generates only column S.
- `updateLeadDisposition(id, disposition)` confirms row exists, updates S only, returns refreshed lead.

- [ ] **Step 1:** Add tests rejecting unknown disposition values/keys and asserting generated range is S only.
- [ ] **Step 2:** Implement strict validation and S-only range builder.
- [ ] **Step 3:** Add Google Sheets update helper using RAW and exact S cell.
- [ ] **Step 4:** Add authenticated PATCH endpoint returning canonical refreshed lead.

### Task 4: Incomplete Leads page and navigation

**Files:**
- Create: `src/app/incomplete-leads/page.tsx`
- Create: `src/components/incomplete-leads-client.tsx`
- Create or modify shared navigation component/styles as appropriate
- Modify: `src/components/dashboard-client.tsx`
- Modify: `src/components/lead-drawer.tsx` only if callback reuse needs adjustment
- Modify: CSS

**Interfaces:**
- `/incomplete-leads` uses authenticated dashboard API data and filters `missingDetails && !badLead`.
- Edit action opens existing `LeadDrawer`.
- Mark Bad Lead PATCHes disposition after confirmation and refreshes the queue.

- [ ] **Step 1:** Add Dashboard / Incomplete Leads navigation.
- [ ] **Step 2:** Build dedicated page with count, search/source filters, missing-field labels, Edit Details and Mark Bad Lead actions.
- [ ] **Step 3:** Add confirmation copy before disposition change.
- [ ] **Step 4:** Refresh after save/disposition mutation.
- [ ] **Step 5:** Add responsive styling.

### Task 5: Bad Lead view and restore

**Files:**
- Modify: `src/components/lead-table.tsx`
- Modify: `src/components/lead-drawer.tsx`
- Modify: filtering/tests/styles

**Interfaces:**
- Main Prospect Queue can switch to `Bad leads`.
- Bad lead drawer exposes `Restore lead` which sends `{disposition:''}`.

- [ ] **Step 1:** Add a Bad Leads filter/view in main queue.
- [ ] **Step 2:** Show Bad Lead badge and suppress normal actionable status for bad rows.
- [ ] **Step 3:** Add Restore Lead with confirmation; clear S only.

### Task 6: Make campaign exclusion and verification

**Systems:**
- Make Scenario `6031109`

- [ ] **Step 1:** Fetch fresh scenario state and relevant search/filter module mappings.
- [ ] **Step 2:** Add `column S != Bad Lead` protection to both Expired and Withdrawn candidate/send paths, preserving all current reply and validation conditions.
- [ ] **Step 3:** Re-read scenario and confirm both protections are saved and scenario remains active/scheduled.
- [ ] **Step 4:** Do not manually run the scenario.

### Task 7: Deployment and safety review

- [ ] **Step 1:** Open PR and inspect diff for Google write ranges: normal editor A:K only; disposition S only.
- [ ] **Step 2:** Verify Vercel preview succeeds.
- [ ] **Step 3:** Merge after green preview and Make verification.
- [ ] **Step 4:** Verify production Vercel deployment succeeds.
