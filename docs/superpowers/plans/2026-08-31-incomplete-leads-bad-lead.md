# Incomplete Leads + Bad Lead Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore lead-detail saving, add a dedicated incomplete-leads work queue, and add a reversible Bad Lead disposition that prevents outreach without deleting source rows.

**Architecture:** Expand the Google service-account scope to writable Sheets access, parse each source tab using its verified live schema through column T, and model `Bad Lead` as a reversible disposition in T. Add authenticated disposition mutation and `/incomplete-leads`, reuse the existing editor with source-aware contact mappings, and update Make Scenario 6031109 so bad leads cannot reach send modules.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript 5.8, Google Sheets API, Make.com scenario 6031109, existing cookie/session auth.

**Spec:** `docs/superpowers/specs/2026-08-31-incomplete-leads-bad-lead-design.md`

## Global Constraints
- Never delete or reorder source rows.
- Expired/Withdrawn S remains `Skip Reason`.
- Lead Disposition is T on all source tabs.
- Expired/Withdrawn contact writes: Phone J, Email K.
- Active contact writes: Email J, Phone R; existing K:Q campaign fields are protected.
- Bad Lead writes only T on the exact existing source row.
- A Bad Lead is excluded from actionable/active/due/incomplete queues and outbound Make send paths.
- Do not manually run production Scenario 6031109 during verification.
- Restore clears only T.

---

### Task 1: Writable Google Sheets scope regression fix
- [x] Add JWT-scope regression test.
- [x] Change scope to `https://www.googleapis.com/auth/spreadsheets`.

### Task 2: Verify and implement source-aware sheet schemas
- [x] Inspect live Expired and Active headers.
- [x] Confirm Expired/Withdrawn S is Skip Reason.
- [x] Confirm Active R:Y is unused.
- [x] Parse Expired/Withdrawn using Phone J / Email K / disposition T.
- [x] Parse Active using Email J / campaign K:Q / Phone R / disposition T.
- [x] Make editor range generation source-aware.

### Task 3: Safe disposition API
- [x] Validate only `Bad Lead` or empty disposition.
- [x] Generate T-only write range.
- [x] Add authenticated `PATCH /api/leads/[id]/disposition`.
- [x] Add restore behavior by clearing T only.

### Task 4: Incomplete Leads page and navigation
- [x] Add Dashboard / Incomplete Leads navigation.
- [x] Add `/incomplete-leads` work queue.
- [x] Reuse LeadDrawer editor.
- [x] Add Mark Bad Lead confirmation and refresh behavior.

### Task 5: Bad Lead view and restore
- [x] Default main queue to actionable leads.
- [x] Add Bad Leads view.
- [x] Add Bad Lead badge and Restore Lead action.

### Task 6: Make campaign exclusion
- [x] Add T != Bad Lead to Expired and Withdrawn candidate searches.
- [x] Extend row reads to A:T.
- [x] Add final send-filter T re-check on both Zoho send modules.
- [x] Update Ensure Columns so Expired/Withdrawn T is Lead Disposition and Active R/T headers are provisioned.
- [ ] Re-read final Make state after all changes; do not manually run.

### Task 7: Deployment and safety review
- [ ] Confirm unit-test/build compatibility.
- [ ] Open PR and inspect all write paths: source-aware contact fields, T-only disposition, S untouched.
- [ ] Verify Vercel preview succeeds.
- [ ] Merge only after green preview and Make verification.
- [ ] Verify production Vercel deployment succeeds.
