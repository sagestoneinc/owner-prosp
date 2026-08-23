# Owner Prospecting Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a password-protected Next.js dashboard that reads the live Owner Prospecting Google Sheet server-side and exposes redacted metrics/list data plus authenticated lead details.

**Architecture:** A Next.js App Router app runs on Vercel. Server-only modules authenticate a signed cookie and query the Google Sheets API with a read-only service account; UI routes consume sanitized server API responses. No dashboard database or separate Make scenario is added.

**Tech Stack:** Next.js 15+, React, TypeScript, Node crypto, Google Sheets REST API via signed service-account JWT, ts-node/Node assertions for local pure-unit tests, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-23-owner-prospecting-dashboard-design.md`

## Global Constraints
- Source spreadsheet ID is `1xTTb6Wl-4vSHE08VrtjMyNJUdOQqH0nxq03Y7qt4uBo` unless overridden by `GOOGLE_SPREADSHEET_ID`.
- Source tabs are exactly `Expired Listings`, `Withdrawn & Cancelled Listings`, and `Active Listings`.
- Main list/API responses must never expose email, phone, or the raw owner field.
- Full PII is returned only by an authenticated single-lead detail endpoint.
- Google credentials remain server-only.
- Data is fetched live on page load/manual refresh; no persistent cache/database is introduced.
- UI follows the attached oxblood/warm-paper dashboard direction.
- Do not introduce a second Make scenario.

---

### Task 1: Scaffold app and normalization core

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `vitest.config.ts`
- Create: `src/lib/types.ts`
- Create: `src/lib/normalize.ts`
- Create: `src/lib/normalize.test.ts`

**Interfaces:**
- Produces `normalizeEmailCell(value: unknown): string[]`
- Produces `displayFirstName(value: unknown): string`
- Produces `cleanAddress(value: unknown): string`
- Produces `parseSheetDate(value: unknown): Date | null`

- [ ] Write normalization tests for multi-email cells, company/person owner lines, company-only fallback, repeated address whitespace, and invalid dates.
- [ ] Run `npm test -- src/lib/normalize.test.ts` and confirm failure.
- [ ] Implement normalization functions.
- [ ] Run normalization tests and confirm pass.

### Task 2: Server-side Google Sheets reader and derived metrics

**Files:**
- Create: `src/lib/google-auth.ts`
- Create: `src/lib/sheets.ts`
- Create: `src/lib/metrics.ts`
- Create: `src/lib/metrics.test.ts`

**Interfaces:**
- Produces `fetchAllSourceRows(): Promise<ProspectRow[]>`
- Produces `fetchLeadById(id: string): Promise<FullLead | null>`
- Produces `buildDashboardData(rows: ProspectRow[], now?: Date): DashboardData`

- [ ] Write metrics tests covering active/due/contacted/completed/stopped/known-replies, source counts, variant counts, sequence distribution, upcoming sends, recent activity, and redaction.
- [ ] Run metrics tests and confirm failure.
- [ ] Implement service-account JWT token exchange and bounded Sheets range fetches.
- [ ] Implement row mapping for columns A:R and derived dashboard metrics.
- [ ] Run metrics tests and confirm pass.

### Task 3: Password authentication and protected APIs

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/lib/auth.test.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/logout/route.ts`
- Create: `src/app/api/dashboard/route.ts`
- Create: `src/app/api/leads/[id]/route.ts`

**Interfaces:**
- Produces `verifyDashboardPassword(password: string): Promise<boolean>`
- Produces `createSessionToken(now?: Date): string`
- Produces `verifySessionToken(token: string, now?: Date): boolean`

- [ ] Write auth tests for valid/invalid hash, valid signature, tampering, and expiry.
- [ ] Run auth tests and confirm failure.
- [ ] Implement scrypt password hash verification and HMAC session tokens.
- [ ] Implement login/logout endpoints and server-page/API cookie protection.
- [ ] Implement dashboard and detail endpoints with safe 401/400/503 responses.
- [ ] Run auth/unit tests and confirm pass.

### Task 4: Dashboard UI

**Files:**
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/login/page.tsx`
- Create: `src/app/page.tsx`
- Create: `src/components/dashboard-client.tsx`
- Create: `src/components/kpi-card.tsx`
- Create: `src/components/sequence-funnel.tsx`
- Create: `src/components/source-breakdown.tsx`
- Create: `src/components/variant-panel.tsx`
- Create: `src/components/lead-table.tsx`
- Create: `src/components/lead-drawer.tsx`

**Interfaces:**
- Dashboard page fetches only `/api/dashboard`.
- Lead detail drawer fetches `/api/leads/:id` only on open.

- [ ] Build password screen with inline error/loading states.
- [ ] Build responsive KPI grid using the approved oxblood/paper palette.
- [ ] Build sequence/source/variant sections and upcoming/recent panels.
- [ ] Build redacted searchable/filterable lead list.
- [ ] Build authenticated full-detail drawer loaded on demand.
- [ ] Verify no email/phone/raw-owner fields are rendered or serialized by the list path.

### Task 5: Configuration, build verification, and deployment

**Files:**
- Create: `.env.example`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Requires production env vars `DASHBOARD_PASSWORD_HASH`, `SESSION_SECRET`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SPREADSHEET_ID`.

- [ ] Document service-account Viewer sharing and environment-variable setup without including secrets.
- [ ] Run `npm test` and confirm all tests pass.
- [ ] Run `npm run build` and confirm production build succeeds.
- [ ] Deploy to Vercel.
- [ ] Verify login protection and deployment health.
- [ ] If service-account credentials are not yet available, leave deployment visibly in configuration-required state and provide the exact remaining setup steps rather than using personal OAuth or embedding a key.
