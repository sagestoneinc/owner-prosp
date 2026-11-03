# Seeto Realty — Owner Prospecting Email Outreach: Action Plan

**Date:** 2026-11-03
**Owner:** Marketing & Sales
**Scope:** Cold email outreach to the owners of Expired, Withdrawn & Cancelled, and Active MLS listings in the `Leads - Owner Prospecting Project` workbook. Make runs the sends through the Zoho Mail API, and the results show on the Seeto dashboard.

---

## 1. Where we are today

What the codebase and current automation tell us:

| Area | Current state | Implication |
|---|---|---|
| Lead sources | Three tabs: Expired, Withdrawn & Cancelled, Active | Each tab carries different intent and different compliance rules. Today all three get the same message. |
| Sequence | 5 steps over 28 days: Day 0 "Two numbers on the property", Day 4 "The 11pm call", Day 10 "A person, not a queue", Day 18 "Already have a manager?", Day 28 "Closing your file" | The cadence is sound. The angles are all about service, and none leads with a concrete offer the owner can say "yes" to. |
| A/B | Variant A/B in column R. The dashboard holds any verdict until each arm has about 300 contacted prospects. | Good guardrail. Keep it. |
| Engagement signal | Open tracking was **turned off Oct 8, 2026**. Replies come from `Status 2` / `Lead Disposition`. | Correct for deliverability. But replies are now the *only* signal, and the reply check can suppress a send without writing a reason to the sheet. **Reply capture is the #1 measurement gap.** |
| Disposition | The dashboard can only set `Bad Lead`. Make writes `Replied / Interested / Not interested`. | We have no taxonomy for *why* owners say no (already managed, wants to sell, wrong person), so we can't improve the copy. |
| Data quality | The dashboard counts no-email leads, company-only owners, and malformed dates. | No-email and LLC-owned leads are a separate opportunity (direct mail or phone, plus investor messaging). They aren't junk. |

## 2. Research findings that shape the plan

### 2.1 Market context: DFW and Houston rentals are softening
- Dallas: the median asking rent for a 3-bed single-family home fell **2.2% YoY to about $2,200** in H1 2026, the third straight year of decline. US rental vacancy hit **7.3% in Q1 2026**, the highest since 2017 ([CandysDirt](https://candysdirt.com/?p=429946)).
- Houston: single-family rents fell **3.3% YoY** to their lowest level since late 2023, and homes are taking longer to lease ([HAR](https://www.har.com/web/aubrielayne/blogs/143090)).
- Plano apartments averaged about **$1,689**, down 2.3% YoY ([Point2Homes](https://www.point2homes.com/US/Average-Rent/TX/Plano.html)).

**So what:** "Rents are high, just rent it out!" is the wrong pitch for late 2026. The honest and more persuasive angle is: *the market got harder, and in a harder market, pricing, marketing, and tenant screening decide whether a home leases in 3 weeks or sits for 3 months.* That is the case for a professional manager. Every first touch should carry a **specific rent estimate and an expected time-to-lease** for the owner's address.

### 2.2 Who these owners are
- Owners of expired and withdrawn listings are often frustrated after a failed sale. Property management sources call them high-value leads, with renting framed as the "backup plan" if the home doesn't sell. Speed matters: reach out within 24–48 hours of the status change ([Arab MLS](https://arabmls.org/converting-mls-listings-into-long-term-property-management-clients/), [Luxury Presence](https://www.luxurypresence.com/blogs/winning-over-expired-listings/), [The Close](https://theclose.com/how-to-get-expired-listings)).
- The strongest sub-segments are **out-of-state or absentee owners** and **vacant homes**, which cost the owner money every month.
- The guidance is consistent: lead with empathy, listen, and offer an option. Don't hard-sell.

### 2.3 Compliance (verify with the broker or counsel before launch)
- **TREC 22 TAC §535.153:** a Texas license holder *may* solicit a listing from an owner whose property is under an exclusive listing with another broker. They may **not** negotiate a sale or lease on that property while the other broker's exclusive arrangement is in place ([Cornell LII](https://www.law.cornell.edu/regulations/texas/22-Tex-Admin-Code-SS-535-153), [TREC FAQ](https://www.trec.texas.gov/node/360)).
- **NAR Code of Ethics Article 16** is stricter: REALTORS® shall not solicit a listing that is currently listed exclusively with another broker ([NAR](https://www.nar.realtor/sites/default/files/policies/2012/code-of-ethics-article-16-2012-08-30.pdf)). NAR's interpretations allow general mailings that aren't targeted at specific listed properties. If Seeto agents are REALTORS®, sending emails to the **Active Listings** tab that reference the owner's listed property is a real ethics risk.
- **Withdrawn ≠ unrepresented.** Some sources note that a withdrawn listing may still be under contract with its agent, while expired and cancelled listings are not ([Luxury Presence](https://www.luxurypresence.com/?p=28470)). Treat Withdrawn the same as Active until the listing agreement end date is confirmed.
- **CAN-SPAM** has no B2B or "cold" exemption. It requires:
  - an accurate From line and a non-deceptive subject
  - a valid **physical postal address**
  - a clear opt-out that keeps working for 30 days and is honored within **10 business days**
  ([gdprlocal summary](https://gdprlocal.com/usa-e-mail-marketing-rules/); per-email penalty figures are on [ftc.gov](https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business), so confirm current amounts there).
- **TREC advertising rules:** include the broker's name as licensed in every message. Confirm with the broker whether the IABS and Consumer Protection Notice links should go in the email footer.

### 2.4 Deliverability: the 2024–2026 sender rules are enforced
- Google, Yahoo, and Microsoft (Microsoft since May 5, 2025) require **SPF, DKIM, and aligned DMARC**. They reject non-compliant bulk mail outright instead of just sending it to spam ([Red Sift](https://redsift.com/guides/bulk-email-sender-requirements), [Hothawk](https://hothawk.ai/blog/deliverability/email-deliverability-news-2026)).
- Keep the spam-complaint rate **under 0.1%** and never above 0.3%. Yahoo expects one-click unsubscribe (RFC 8058) requests to be honored within about 2 days ([Warmy](https://www.warmy.io/guides/google-yahoo-sender-requirements/), [Prospeo](https://prospeo.io/s/google-email-sender-guidelines)).
- Turning off open-tracking pixels for cold outreach is widely recommended, and we already did it.

## 3. Strategy in one paragraph

Stop sending one generic sequence to everyone. **Segment by listing status and owner type.** Lead every first touch with a **free, address-specific "Rent vs. Re-list" estimate**, and make **booking a 15-minute call** the single next step. Protect the sending domain like an asset. Then measure the program by **positive replies → booked calls → signed management agreements**, not by opens or sends.

## 4. Segments and messaging tracks

| Track | Who | Priority | Angle | CTA |
|---|---|---|---|---|
| **T1 — Expired** | Expired Listings tab, ≤ 90 days since expiry | **Highest** | "The sale didn't happen. Here's what the home could earn while you decide." Empathetic, data-led, no blame on the prior agent. | Reply "estimate" or book a call for the Rent vs. Re-list sheet |
| **T2 — Cancelled** | Cancelled rows in the Withdrawn & Cancelled tab, agreement ended | High | The same as T1, plus "you pulled it off the market for a reason. Renting keeps the option to sell later." | Same as T1 |
| **T3 — Withdrawn (gated)** | Withdrawn rows | Gated | Hold until the listing-agreement end date passes, then move to T2. Until then, send only a general, non-property-specific newsletter, if the broker approves. | — |
| **T4 — Active (gated)** | Active Listings tab | **Paused pending broker review** | If allowed, use only a "plan B for *after* your listing period" message. Never discuss terms or negotiate. Article 16 risk if our agents are REALTORS®. | Soft: "Save this for later" |
| **T5 — Investor / LLC** | Entity owners (`Owner` fallback name, LLC/Trust/Holdings) | Medium–High | Portfolio language: cap rate, vacancy cost, owner reporting, maintenance network. Address "Hi there," not a fake first name. | Book a portfolio review |
| **T6 — No-email** | `dataQuality.noEmail` rows | Medium | Not email: a postcard with a QR code to the rent estimate page, plus phone *after* a DNC scrub. | QR code → booking |

Add to every track: **Houston vs. DFW** localization (county column) and **price band**. Homes above about $500k get "premium tenant placement" language.

## 5. Sequence rewrite (keep the 5-touch / 28-day cadence)

Rules for every email:
- Plain text with one link, under 120 words, sent from a real person's name.
- The footer carries the Seeto Realty broker name, postal address, and a one-line opt-out ("Reply 'no thanks' and I won't email again"), plus List-Unsubscribe headers.

| Step | Day | New angle (T1/T2) | Sample subject | What it gives the owner |
|---|---|---|---|---|
| 1 | 0 | **The number** | "{Street} — rent estimate" | One specific monthly rent range and expected days-to-lease for their address, with an offer to send the full one-pager |
| 2 | 4 | **The vacancy math** | "What an empty month costs on {Street}" | Mortgage + taxes + insurance per month vacant vs. a leased month. Positioned against the soft-market data. |
| 3 | 10 | **Proof** | "A {City} home we leased in {N} days" | One short case study (real, anonymized) with photos-to-lease timeline and screening standards |
| 4 | 18 | **Objection handling** | "Already have someone in mind?" | Covers "I'll self-manage," "I'll sell later," and "I already have a manager." Fees in plain English and what's included. |
| 5 | 28 | **Breakup** | "Closing your file" | Courteous close, and the rent sheet stays available. Owners who don't reply move to a quarterly market-update list (with consent language), not the void. |

**A/B plan:** test *one* variable at a time, and only on Step 1 (it drives most replies).
1. **Test 1:** subject with the street name vs. subject with the dollar figure.
2. **Test 2:** CTA "reply with 'estimate'" vs. a Cal.com booking link.

Keep the dashboard's rule of about 300 contacted prospects per arm before calling a winner.

## 6. Deliverability and infrastructure checklist

- [ ] Send cold outreach from a **dedicated secondary domain** (for example `seetorealtyhomes.com`), not the primary brokerage domain. The primary domain then handles warm replies.
- [ ] SPF, DKIM (Zoho), and DMARC set to `p=quarantine` with aggregate reports, aligned for every sending domain.
- [ ] Enroll in Google Postmaster Tools and Microsoft SNDS. Review complaint rates weekly.
- [ ] Cap each mailbox at **30–40 cold sends per day**. Ramp new mailboxes over 3–4 weeks. Spread volume across 2–4 sender mailboxes (the dashboard already shows per-sender performance).
- [ ] Keep Emailable validation before every first send. Suppress `undeliverable`, `risky`, and catch-all results unless the broker approves.
- [ ] Add `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers. Route unsubscribes to a **global suppression list** shared across all three tabs, so an owner with multiple properties is suppressed everywhere.
- [ ] Send only on weekdays, 8–11am Central (the audience is in Texas; the dashboard timezone is America/New_York, so watch the offset).
- [ ] Keep open tracking **off**.
- [ ] Bounce rate over 2% or complaints over 0.1% in any week → pause that mailbox and investigate.

## 7. Measurement and the dashboard

**North-star metric:** signed management agreements per 1,000 owners contacted.

| Funnel metric | Definition | Initial target* |
|---|---|---|
| Valid-email rate | Emailable "deliverable" ÷ leads with email | ≥ 90% |
| Bounce rate | Hard bounces ÷ sends | < 2% |
| Complaint rate | Postmaster spam rate | < 0.1% |
| Positive reply rate | Interested replies ÷ contacted owners | 1.5–3% |
| Reply → booked call | Calls booked ÷ interested replies | ≥ 50% |
| Call → signed agreement | Agreements ÷ calls held | ≥ 25% |
| Speed to first touch | Status-change date → Step 1 sent | ≤ 48 hrs (T1/T2) |

*These are starting assumptions from industry benchmarks. Re-baseline after the first 60 days of clean data.

**Reply taxonomy.** Make writes the `Lead Disposition` column; the dashboard should accept and report these values:

`Interested` · `Call booked` · `Agreement signed` · `Already managed` · `Wants to sell (refer to listing agent)` · `Self-managing` · `Not interested` · `Wrong person` · `Unsubscribe` · `Bad Lead`

**Engineering backlog** for this repo (separate PRs):
1. Extend the `Lead Disposition` validation (`src/lib/lead-disposition.ts`) and the stop/reply regexes (`src/lib/metrics.ts`) to the taxonomy above.
2. Add a "Reply reasons" panel and a per-source funnel (contacted → interested → booked → signed).
3. Add a "Speed to first touch" KPI, which needs a status-change date column in the sheet.
4. Add a `Track` column (T1–T6) so the funnel and the A/B results can be filtered by segment.
5. Show suppression-list and compliance gates (Active/Withdrawn paused) on the dashboard so nobody re-enables them by accident.

## 8. Multichannel follow-up (where email can't do it alone)

- **Positive reply → call within 1 business hour.** Speed is the conversion lever. Use a Cal.com 15-minute event type ("Rent vs. Re-list review") as the booking link.
- **"Wants to sell" replies** → hand off to the Seeto listing side as a warm seller lead. This is a revenue win even if it isn't a PM win.
- **No-email owners (T6)** → a monthly postcard batch with a QR code to a landing page with the rent-estimate form.
- **Phone outreach** only after scrubbing against the National DNC Registry and confirming Texas telemarketing requirements with the broker.

## 9. 30/60/90-day plan

### Days 0–30: Fix the foundation (no volume increase)
- [ ] **Broker/compliance sign-off:** pause T4 (Active) and gate T3 (Withdrawn). Confirm the footer content (broker name, postal address, IABS/CPN links) and whether Seeto agents are NAR members.
- [ ] Set up the secondary sending domain and warm-up. Run the authentication audit (SPF/DKIM/DMARC) and enroll in Postmaster Tools.
- [ ] Build the global suppression list. Backfill it from every past `Stopped = Yes`, unsubscribe, and bounce.
- [ ] Make: write the reply taxonomy to `Lead Disposition` on *every* reply detection, including the just-in-time check that suppresses a send.
- [ ] Build the Rent vs. Re-list one-pager template (rent comps, days on market, vacancy cost) and the booking page.
- [ ] Rewrite the 5-step copy for T1/T2 and T5 (section 5). Have the broker review it.

### Days 31–60: Relaunch T1/T2/T5 and measure
- [ ] Relaunch Expired and Cancelled under the new copy at a capped volume (about 150–250 new owners per week across mailboxes).
- [ ] Start A/B Test 1 (subject line) on Step 1.
- [ ] SLA: positive replies get a call or personal reply within 1 business hour.
- [ ] Ship dashboard backlog items 1–2 (the reply taxonomy and reasons panel).
- [ ] Hold a weekly 30-minute review covering deliverability health, reply reasons, and the copy changes queued from them.

### Days 61–90: Scale what works
- [ ] Call A/B Test 1 once both arms reach about 300 contacted, then start Test 2 (CTA).
- [ ] Add the T6 postcard channel and evaluate phone follow-up.
- [ ] Revisit T3/T4 based on the broker's decision. If approved, launch a general "after your listing" track.
- [ ] Re-baseline the KPI targets on 60 days of clean data. Set the Q1 2027 volume plan, adding mailboxes only if complaints stay < 0.1%.
- [ ] Build a quarterly "{County} rental market update" for non-responders who gave consent, as a long-term nurture.

## 10. Roles (RACI-lite)

| Workstream | Responsible | Approves |
|---|---|---|
| Compliance gates, footer, Article 16 call | Marketing | Broker/Owner |
| Domain, DNS, warm-up, Postmaster | Ops / automation (Make) | Marketing |
| Copy and A/B tests | Marketing | Broker/Owner |
| Rent vs. Re-list sheets and booking calls | PM sales / leasing | PM lead |
| Dashboard backlog | Engineering | Marketing |
| Reply handling SLA | PM sales | PM lead |

## 11. Open questions for the broker

1. Are Seeto agents NAR members, so that Article 16 applies? That decides the fate of the Active tab.
2. Do we have the listing-agreement end dates for Withdrawn rows?
3. Which postal address and licensed broker name go in the footer?
4. What are the published PM fees and guarantees we can state in Step 4 (leasing fee, monthly %, lease-up guarantee)?
5. Do we have 2–3 real, shareable lease-up case studies for Step 3?

---

**Sources:** [Seeto Realty profile](https://www.provenexpert.com/seeto-realty/) · [TREC §535.153 (Cornell LII)](https://www.law.cornell.edu/regulations/texas/22-Tex-Admin-Code-SS-535-153) · [TREC FAQ](https://www.trec.texas.gov/node/360) · [NAR Article 16](https://www.nar.realtor/sites/default/files/policies/2012/code-of-ethics-article-16-2012-08-30.pdf) · [CandysDirt — Dallas rents](https://candysdirt.com/?p=429946) · [HAR — Houston rents](https://www.har.com/web/aubrielayne/blogs/143090) · [Point2Homes — Plano](https://www.point2homes.com/US/Average-Rent/TX/Plano.html) · [Red Sift — sender requirements](https://redsift.com/guides/bulk-email-sender-requirements) · [Warmy — Google/Yahoo rules](https://www.warmy.io/guides/google-yahoo-sender-requirements/) · [Hothawk — 2026 deliverability](https://hothawk.ai/blog/deliverability/email-deliverability-news-2026) · [gdprlocal — CAN-SPAM](https://gdprlocal.com/usa-e-mail-marketing-rules/) · [Arab MLS — MLS to PM clients](https://arabmls.org/converting-mls-listings-into-long-term-property-management-clients/) · [Luxury Presence — expired listings](https://www.luxurypresence.com/blogs/winning-over-expired-listings/) · [The Close — expired listings](https://theclose.com/how-to-get-expired-listings)

*This plan is marketing guidance, not legal advice. Have the broker of record confirm the compliance items in sections 2.3 and 11 before relaunch.*
