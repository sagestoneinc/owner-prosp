# Seeto Realty — Owner Prospecting Email Outreach: Action Plan

**Date:** 2026-11-03
**Owner:** Marketing & Sales
**Scope:** Cold email outreach to the owners of Expired, Withdrawn & Cancelled, and Active MLS listings in the `Leads - Owner Prospecting Project` workbook, **plus an Agent Referral program for listing agents** (the workbook's `Listing Agents` tab). Make runs the sends through the Zoho Mail API, and the results show on the Seeto dashboard.

---

## 1. Where we are today

### 1.1 Live data snapshot (from the workbook, Nov 3, 2026 5:02 PM dashboard calc)

| Metric | Expired | Withdrawn & Cancelled | Active | Total |
|---|---|---|---|---|
| Owner leads | 1,719 | 1,830 (≈1,790 Cancelled, ≈40 Withdrawn) | ≈3,085 rows | 6,600+ |
| With email | 303 (17.6%) | 102 (5.6%) | not tracked | **405 of 3,549 (11.4%)** in Expired + W/C |
| Contacted | 13 | 17 | — | **30** |
| Active drip / Stopped or completed | 5 / 14 | 10 / 15 | — | 15 / 29 |
| Variant A / B contacted | | | | 19 / 13 |

Other data points:
- **Drip distribution:** 375 not started, 4 at Step 1, 5 at Step 2, 5 at Step 3, 1 at Step 4, 15 completed.
- **Exceptions:** 55 validation or skip flags. 305 leads have multiple emails.
- **`Listing Agents` tab:** 1,000 rows. Every row is a **Closed** sale. The columns are MLS, Address, County, Price, Status, Listing Agent, Phone, Listing Office, Email, First Contact, Status 2.
- **Active Listings tab:** the column B header read blank (`" "`) instead of `Address` on first check. It reads `Address` as of a re-check on Nov 3. The Dashboard tab's formulas don't include Active at all, and the tab has no listing-agent columns.

**What the numbers change:**
1. **The bottleneck is data, not copy.** 88.6% of Expired and W/C owners have no email. Only about 375 emailable owners are left to start. At 2 mailboxes × 30 sends a day, the email pool runs out in about **2 weeks**. Getting contact data for the rest (section 9) is now the #1 priority, ahead of copy changes.
2. **Cancelled is the biggest pool by far.** It has about 1,790 rows against about 40 Withdrawn. The T3 Withdrawn gate affects very few leads. T2 (Cancelled) deserves T1-level priority, but it also has the lowest email coverage (5.6%), so it needs enrichment first.
3. **The A/B test can't reach a verdict on email volume alone.** 300 contacted per arm means about 600 owners, more than we have emails for. Pool A/B results across the owner tracks, or judge Step 1 tests on positive reply rate with a lower bar until enrichment adds volume.
4. **The `Listing Agents` tab is a list of agents who just closed sales.** It isn't the agents on our owners' listings. That's ideal for *partner recruitment* (section 6, T7a). Property-specific referral asks (T7b) need listing-agent columns added to the Active and W/C exports.
5. **The Active tab needs care before anything else runs on it.** Its `Address` header is now restored. The web app validates headers by name, and it now skips a broken tab with a warning instead of failing entirely. It still needs a decision on whether it belongs on the Dashboard tab, and it has no listing-agent columns.

### 1.2 What the codebase and current automation tell us

| Area | Current state | Implication |
|---|---|---|
| Lead sources | Three tabs: Expired, Withdrawn & Cancelled, Active | Each tab carries different intent and different compliance rules. Today all three get the same message. |
| Sequence | 5 steps over 28 days: Day 0 "Two numbers on the property", Day 4 "The 11pm call", Day 10 "A person, not a queue", Day 18 "Already have a manager?", Day 28 "Closing your file" | The cadence is sound. The angles are all about service, and none leads with a concrete offer the owner can say "yes" to. |
| A/B | Variant A/B in column R. The dashboard holds any verdict until each arm has about 300 contacted prospects. | Good guardrail. Keep it. |
| Engagement signal | Open tracking was **turned off Oct 8, 2026**. Replies come from `Status 2` / `Lead Disposition`. | Correct for deliverability. But replies are now the *only* signal, and the reply check can suppress a send without writing a reason to the sheet. **Reply capture is the #1 measurement gap.** |
| Disposition | The dashboard can only set `Bad Lead`. Make writes `Replied / Interested / Not interested`. | We have no taxonomy for *why* owners say no (already managed, wants to sell, wrong person), so we can't improve the copy. |
| Listing agents | The workbook has a `Listing Agents` tab (1,000 closed-sale rows), but no sequence targets it and the dashboard doesn't read it. | Recently closed agents are an untapped, compliant referral-partner channel. The listings we can't email the owner about (Active, Withdrawn) also have agents we *can* email, once their contact columns are added to those exports. |
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

### 2.3a Broker answers (Nov 5, 2026)
- **Seeto agents are NAR members.** Article 16 applies, so Active-listing owners are **permanently off owner email** (T4). Active and Withdrawn listings are reached only through the listing agent (T7b). Expired and Cancelled owners (T1/T2) are fine to email, because no exclusive listing is in place.
- **Broker of record:** Michael Seeto, Seeto Realty (Broker/Owner).
- **Footer.** The live Make templates already include all of these:
  - "Seeto Realty is a licensed Texas real estate brokerage"
  - 700 W Spring Creek Pkwy #212, Plano, TX 75023 · (972) 509-7100
  - links to TREC's Information About Brokerage Services and Consumer Protection Notice
  - an unsubscribe link

  Optional addition: "Michael Seeto, Broker". Before relying on the address, confirm it is current. HAR lists 1721 W. Plano Pkwy #101 (Plano) and 6588 Corporate Dr #368 (Houston) for the firm, while seetorealty.com lists Spring Creek. CAN-SPAM needs a valid postal address.
- **From seetorealty.com, usable in copy:**
  - Tenant screening standards: 580+ credit score, combined income of 3× rent, verifiable income and rental history, no evictions, no broken leases, no money owed to prior landlords, and a criminal background check. Use these in Step 4 ("what you get").
  - Service areas: DFW (Plano, Frisco, McKinney, Allen, Dallas, Irving, and others; Collin and Denton counties) and Houston.
  - No management fees or referral program are published yet. Those are still needed (questions 4 and 6).

### 2.4 Deliverability: the 2024–2026 sender rules are enforced
- Google, Yahoo, and Microsoft (Microsoft since May 5, 2025) require **SPF, DKIM, and aligned DMARC**. They reject non-compliant bulk mail outright instead of just sending it to spam ([Red Sift](https://redsift.com/guides/bulk-email-sender-requirements), [Hothawk](https://hothawk.ai/blog/deliverability/email-deliverability-news-2026)).
- Keep the spam-complaint rate **under 0.1%** and never above 0.3%. Yahoo expects one-click unsubscribe (RFC 8058) requests to be honored within about 2 days ([Warmy](https://www.warmy.io/guides/google-yahoo-sender-requirements/), [Prospeo](https://prospeo.io/s/google-email-sender-guidelines)).
- Turning off open-tracking pixels for cold outreach is widely recommended, and we already did it.

## 3. Strategy

Stop sending one generic sequence to everyone. **Segment by listing status and owner type.** Lead every first touch with a **free, address-specific "Rent vs. Re-list" estimate**, and make **booking a 15-minute call** the single next step. Protect the sending domain like an asset. Run it as a **two-sided program**:
- Email the owner directly when the listing has ended (Expired, Cancelled).
- Email the **listing agent** with a referral offer when the listing is still live (Active, Withdrawn). Agents become a referral channel instead of competitors: Seeto manages the rental, pays the agent's broker a referral fee, and sends the owner back to that agent when they're ready to sell.

Then measure the program by **positive replies → booked calls → signed management agreements**, not by opens or sends.

## 4. Segments and messaging tracks

| Track | Who | Priority | Angle | CTA |
|---|---|---|---|---|
| **T1 — Expired** | Expired Listings tab, ≤ 90 days since expiry | **Highest** | "The sale didn't happen. Here's what the home could earn while you decide." Empathetic, data-led, no blame on the prior agent. | Reply "estimate" or book a call for the Rent vs. Re-list sheet |
| **T2 — Cancelled** | Cancelled rows in the Withdrawn & Cancelled tab, agreement ended | High | The same as T1, plus "you pulled it off the market for a reason. Renting keeps the option to sell later." | Same as T1 |
| **T3 — Withdrawn (gated)** | Withdrawn rows | Gated | **No owner email.** Route to T7 (listing agent) now. Move the owner to T2 once the listing-agreement end date passes. | — |
| **T4 — Active (no owner email)** | Active Listings tab | **Owner email off. Seeto agents are NAR members, so Article 16 applies.** | **No owner email, ever, while listed.** Route to T7b (listing agent) instead. We work *with* the agent rather than soliciting their client. | — |
| **T5 — Investor / LLC** | Entity owners (`Owner` fallback name, LLC/Trust/Holdings) | Medium–High | Portfolio language: cap rate, vacancy cost, owner reporting, maintenance network. Address "Hi there," not a fake first name. | Book a portfolio review |
| **T6 — No-email** | `dataQuality.noEmail` rows | Medium | Not email: a postcard with a QR code to the rent estimate page, plus phone *after* a DNC scrub. | QR code → booking |
| **T7a — Agent partner recruitment** | The `Listing Agents` tab: 1,000 rows of agents with recent **closed** sales. De-duplicate to one row per agent. | **High (start here)** | "You close deals in {County}. When a seller can't get their price, or a buyer turns out to be an investor who needs a manager, send them to us. We pay your broker a referral fee and never compete for your listing." | Reply "referral" or book a 10-minute partner call |
| **T7b — Property-specific referral** | Listing agents on Active and Withdrawn rows (and Expired rows where the agent is still in touch with the owner). **Needs agent name/email columns added to those exports.** | High (once data exists) | "If {Street} doesn't sell, don't lose the client. Refer them to us to lease and manage. We pay your broker a referral fee and hand the owner back to you when they sell." | Reply "referral" or book a 10-minute partner call |

Add to every track: localization by county and **price band**. Homes above about $500k get "premium tenant placement" language.

**County focus (live data, Expired + W/C).** The lead list is **entirely DFW**; Houston counties don't appear. Priorities:
- **Core:** Collin 1,030 and Denton 783 (51% of leads, home turf near the Plano office). Start here.
- **Next:** Dallas 579 and Tarrant 533.
- **Ring:** Kaufman 176, Rockwall 115, Ellis 57, Johnson 46, Parker 36.
- **Fringe, outside the published service cities:** Grayson 56, Hunt 50, Wise 21, Hood 19, Henderson 11, Cooke 8, and others. That's about 5% of leads. Enrich and email these last, or route them to an agent referral.

The Houston office gets no leads from this pipeline today. Add a Houston MLS export (Harris, Fort Bend, Montgomery) if Houston management growth is a goal.

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

## 6. Agent Referral program (T7)

### 6.1 Why it works
- Expired, stale, or price-reduced listings are a problem for the listing agent too. The agent risks losing the client to the next agent who calls when the listing expires.
- A rental-management referral lets the agent keep the relationship and earn a fee now. It also protects their future listing: a managed rental often becomes a sale in 1–3 years.
- National and Texas PM firms already run this model. Published examples include a flat **$500–$750** per signed management agreement, or **half a month's rent** ([PURE Property Management TX](https://tx.purepm.co/company/agent-referral-program/), [Real Property Management Gold](https://www.realpmgold.com/realtor-referrals), [Evernest](https://evernest.co/agents)).
- It turns our **Active and Withdrawn** tabs from "do not touch" into a compliant pipeline.

### 6.2 The offer (broker to finalize numbers)
| Element | Recommendation |
|---|---|
| Referral fee | Flat **$500 per signed management agreement**, or 50% of the first month's leasing fee, whichever the broker prefers. Paid to the **agent's sponsoring broker** after the owner signs and the first tenant moves in. |
| Client-return promise | Written into the referral agreement: Seeto will **not** list the property for sale. When the owner decides to sell, Seeto refers them back to the referring agent. Add a disclaimer in the management agreement that the owner is free to choose any agent to sell, which PURE uses. |
| Speed promise | Rent estimate to the agent within **1 business day** of the referral, so the agent can present "plan B" to their seller with confidence. |
| Transparency | The agent gets status updates: estimate sent, owner meeting held, agreement signed, tenant placed. |
| Eligibility | The owner must not already be in Seeto's owner pipeline (avoids double-paying T1/T2 leads). The agent must hold an active license (Texas, or a broker licensed in another state). |

### 6.3 Agent sequence (4 touches over 21 days, plain text, from a named Seeto PM lead)

The table below is written for **T7b** (a specific listing). For **T7a** (the closed-sale `Listing Agents` list), use the same 4 steps with a partnership opener instead of a property hook. For example, Step 1: "Congrats on closing {Street}. Quick idea for your next stale listing". Then reference their county and price band.

| Step | Day | Angle | Sample subject |
|---|---|---|---|
| 1 | 0 | **Keep the client.** Name the listing, offer the referral fee and the client-return promise. | "If {Street} doesn't sell — referral for you" |
| 2 | 5 | **What your seller gets.** A sample Rent vs. Re-list sheet the agent can forward as-is. | "A one-pager you can send your seller" |
| 3 | 12 | **Proof.** One case where an agent referred, earned the fee, and later relisted the home with the same owner. | "How {Agent first name or 'one agent'} kept a client after an expired listing" |
| 4 | 21 | **Standing offer.** No more emails about this listing. Invite them to save Seeto as their rental partner for any future listing. | "Our standing referral offer" |

Rules:
- **One sequence per agent, not per listing.** Agents with several listings in the sheet get one email that names their properties, so we don't spam them.
- When a listing expires mid-sequence, the agent sequence continues. The owner moves to T1 only after a **14-day hold**, so a referring agent gets first chance to make the introduction. Stop the owner track for any owner the agent refers.
- Never contact the owner of a property the agent has said they will refer. Wait for the warm intro.

### 6.4 Partner nurture (agents who say yes)
- Add them to a **"Referral Partners"** list. Send a monthly 3-line email: rental market stats for their county plus their referral status.
- Quarterly: a short lunch-and-learn or webinar, "Rent vs. Sell in a soft market," for partner agents and their brokerages.
- Recognize top referrers by name (with permission) in the partner email.

### 6.5 Compliance for the referral program
- **Pay only license holders, through their broker.** TREC can discipline a license holder who pays any part of a fee to anyone other than a licensed Texas broker or a broker licensed in another state (TRELA §1101.652(b)(11)). Paying an unlicensed person for a referral is a violation ([TREC FAQ](https://www.trec.texas.gov/can-license-holder-be-disciplined-paying-commission-or-fee-or-dividing-commission-or-fee-unlicensed), [TREC FAQ](https://www.trec.texas.gov/node/470)). Pay the **sponsoring broker**, not the individual agent.
- **Put it in writing.** Use a written referral agreement that names both license holders, the referred owner, the fee and when it's payable, and the term ([Texas A&M Real Estate Research Center](https://trerc.tamu.edu/article/understanding-real-estate-referrals-in-texas/)).
- **Disclose the fee to the owner** in the management agreement, consistent with the broker's fiduciary duties.
- **No owner negotiation through the agent's listing.** The referral covers leasing and management only. Seeto does not discuss selling or listing terms while the other broker's exclusive listing is in place (TREC §535.153).
- **CAN-SPAM still applies.** Agent emails are commercial email, so the same footer rules apply: broker name, postal address, and opt-out. Agents who opt out go on the global suppression list.

### 6.6 Agent KPIs
| Metric | Initial target* |
|---|---|
| Agent positive reply rate (wants the referral terms) | 3–6% |
| Agents who sign a referral agreement | ≥ 40% of positive replies |
| Referred owners → signed management agreement | ≥ 35% |
| Referral fees paid ÷ new doors from referrals | Tracks cost per door; compare against the owner-email cost per door |
| Repeat partners (2+ referrals in 12 months) | Track from day 90 |

*Assumptions. Re-baseline after 60 days.

## 7. Deliverability and infrastructure checklist

- [ ] Send cold outreach from a **dedicated secondary domain** (for example `seetorealtyhomes.com`), not the primary brokerage domain. The primary domain then handles warm replies.
- [ ] SPF, DKIM (Zoho), and DMARC set to `p=quarantine` with aggregate reports, aligned for every sending domain.
- [ ] Enroll in Google Postmaster Tools and Microsoft SNDS. Review complaint rates weekly.
- [ ] Send agent referral emails (T7) from a **separate mailbox** from owner outreach, so one audience's complaints can't hurt the other.
- [ ] Cap each mailbox at **30–40 cold sends per day**. Ramp new mailboxes over 3–4 weeks. Spread volume across 2–4 sender mailboxes (the dashboard already shows per-sender performance).
- [ ] Keep Emailable validation before every first send. Suppress `undeliverable`, `risky`, and catch-all results unless the broker approves.
- [ ] Add `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers. Route unsubscribes to a **global suppression list** shared across all three tabs, so an owner with multiple properties is suppressed everywhere.
- [ ] Send only on weekdays, 8–11am Central (the audience is in Texas; the dashboard timezone is America/New_York, so watch the offset).
- [ ] Keep open tracking **off**.
- [ ] Bounce rate over 2% or complaints over 0.1% in any week → pause that mailbox and investigate.

## 8. Measurement and the dashboard

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

Agent dispositions, in the `Listing Agents` tab:

`Partner – interested` · `Referral agreement signed` · `Referred owner` · `Not now` · `Not interested` · `Unsubscribe`

**Engineering backlog** for this repo:
1. ✅ **Shipped.** The `Lead Disposition` taxonomy. The lead drawer has a "Reply outcome" picker, and the API accepts every value above. Metrics classify each one as positive, reply, or unsubscribe (`src/lib/lead-disposition.ts`, `src/lib/metrics.ts`).
2. ✅ **Shipped.** A "Reply reasons" panel and the outcome funnel: positive replies → calls booked → agreements signed, as headline KPIs.
3. ⏳ **Open.** A "Speed to first touch" KPI. It needs a status-change date column in the sheet.
4. ✅ **Shipped, without a sheet column.** Tracks T1–T6 are *derived* in code (`trackOf` in `src/lib/metrics.ts`), so no column has to be added or kept up to date by Make. An "Outreach tracks" panel shows leads, email, contacted, replies and positives per track.
5. ✅ **Shipped.** Compliance gates on the dashboard. T3/T4 are flagged as owner-email gated. A "Needs attention" banner fires when any Withdrawn or Active owner is *due* for an owner email. **Make still has to stop those sends; the dashboard only reports them.** A global suppression list is still open.
6. ✅ **Shipped, aggregates only.** The dashboard reads the `Listing Agents` tab and shows an **Agent Referral panel**: unique agents → with email → contacted → interested → referral agreements → owners referred. Agent outcomes go in that tab's `Status 2` column. No agent PII leaves the server. Fees owed or paid are still open.
7. ⏳ **Open.** A `Referred By` column on lead rows. It needs a new sheet column and a matching Make change.
**Make automation check (Nov 4, read-only):** the live scenario is *LIVE v2 — Owner Prospecting — Streamlined*. It runs weekdays at 09:00 ET and reads only Expired and Withdrawn & Cancelled. **It never emails Active Listings owners, so the T4 gate already holds.** Its row filter skips `Stopped = Yes` and the dispositions Bad Lead, Replied, Interested, Not interested and Completed.
- **Withdrawn gate, done Nov 4 in the sheet:** Make's filter does not exclude `Status = Withdrawn`. All 40 Withdrawn rows (none of which had an email) were set to `Stopped = Yes`, with Skip Reason `Withdrawn: owner email gated (agent referral)`, so they stay excluded after enrichment.
  - **Still open:** newly imported Withdrawn rows need the same treatment. The permanent fix is a one-condition edit in Make: add `H (Status) — Text not equal (case insensitive) — Withdrawn` to the *Due Withdrawn* filter in "LIVE v2 — Owner Prospecting — Streamlined".
  - **When the gate lifts:** once a listing agreement ends, clear `Stopped` and the Skip Reason to move the row to T2.
- **Handled by the dashboard:** the newer outcome values are not in Make's list, so the dashboard also writes `Stopped = Yes` whenever an outcome is saved. Any outcome therefore halts the drip with no Make change.

8. ✅ **Shipped.** Resilience: a source tab with a broken header row (for example a blank `Address`) is now skipped with a warning, instead of taking the whole dashboard down.

## 9. Multichannel follow-up (where email can't do it alone)

- **Positive reply → call within 1 business hour.** Speed is the conversion lever. Use a Cal.com 15-minute event type ("Rent vs. Re-list review") as the booking link.
- **"Wants to sell" replies** → hand off to the Seeto listing side as a warm seller lead. This is a revenue win even if it isn't a PM win.
- **No-email owners (T6). This is now the majority: about 3,100 Expired and W/C owners, plus Active.**
  - **Enrich first.** Skip-trace the highest-value no-email owners in batches of 250–500, starting with Expired from the last 90 days, then Cancelled, sorted by price. Run every new email through Emailable before it enters the drip. Record the data source and date per row.
  - **Mail the rest.** A monthly postcard batch with a QR code to a landing page with the rent-estimate form.
- **Phone outreach** only after scrubbing against the National DNC Registry and confirming Texas telemarketing requirements with the broker.

## 10. 30/60/90-day plan

### Days 0–30: Fix the foundation (no volume increase)
- [ ] **Broker/compliance sign-off:** pause T4 (Active) and gate T3 (Withdrawn). Confirm the footer content (broker name, postal address, IABS/CPN links) and whether Seeto agents are NAR members.
- [ ] Set up the secondary sending domain and warm-up. Run the authentication audit (SPF/DKIM/DMARC) and enroll in Postmaster Tools.
- [ ] Build the global suppression list. Backfill it from every past `Stopped = Yes`, unsubscribe, and bounce.
- [ ] Make: write the reply taxonomy to `Lead Disposition` on *every* reply detection, including the just-in-time check that suppresses a send.
- [ ] Build the Rent vs. Re-list one-pager template (rent comps, days on market, vacancy cost) and the booking page.
- [ ] Rewrite the 5-step copy for T1/T2 and T5 (section 5). Have the broker review it.
- [x] Restore the `Address` header in Active Listings column B. It reads correctly as of Nov 3.
- [ ] **Fix the workbook data:** decide whether Active goes on the Dashboard tab. Add listing-agent name/email/office columns to the Active and W/C exports so T7b can run.
- [ ] **Run the first enrichment batch:** 500 no-email owners (Expired ≤ 90 days, then Cancelled by price), validated through Emailable. Target: double the emailable pool from 405 to 800+ by day 30.
- [ ] **Agent Referral setup:** broker sets the fee. Draft the written referral agreement and the management-agreement disclosure, and write the 4-step agent copy (section 6). Clean the `Listing Agents` tab and de-duplicate it to one row per agent with their listings attached.

### Days 31–60: Relaunch T1/T2/T5 and measure
- [ ] Relaunch Expired and Cancelled under the new copy at a capped volume (about 150–250 new owners per week across mailboxes).
- [ ] Start A/B Test 1 (subject line) on Step 1.
- [ ] SLA: positive replies get a call or personal reply within 1 business hour.
- [ ] **Launch T7a partner recruitment** to the de-duplicated `Listing Agents` list (1,000 closed-sale rows), about 50–100 new agents per week from a dedicated mailbox.
- [ ] **Launch T7b** on Active and Withdrawn listings once the agent columns exist. Set up the 14-day owner hold when a listing expires.
- [ ] Continue enrichment at about 500 owners every 2 weeks so the owner drip never runs dry.
- [x] Ship dashboard backlog items 1–2 (the reply taxonomy and reasons panel).
- [ ] Hold a weekly 30-minute review covering deliverability health, reply reasons, and the copy changes queued from them.

### Days 61–90: Scale what works
- [ ] Call A/B Test 1 once both arms reach about 300 contacted, then start Test 2 (CTA).
- [ ] Add the T6 postcard channel and evaluate phone follow-up.
- [ ] Revisit owner email for T3/T4 based on the broker's decision. Agents stay on T7 either way.
- [ ] Start the Referral Partners nurture (section 6.4). Agent Referral panel (backlog item 6) is shipped. Add `Referred By` (item 7).
- [ ] Compare cost per signed door: owner email vs. agent referral. Shift volume toward whichever is cheaper.
- [ ] Re-baseline the KPI targets on 60 days of clean data. Set the Q1 2027 volume plan, adding mailboxes only if complaints stay < 0.1%.
- [ ] Build a quarterly "{County} rental market update" for non-responders who gave consent, as a long-term nurture.

## 11. Roles (RACI-lite)

| Workstream | Responsible | Approves |
|---|---|---|
| Compliance gates, footer, Article 16 call | Marketing | Broker/Owner |
| Domain, DNS, warm-up, Postmaster | Ops / automation (Make) | Marketing |
| Copy and A/B tests | Marketing | Broker/Owner |
| Rent vs. Re-list sheets and booking calls | PM sales / leasing | PM lead |
| Dashboard backlog | Engineering | Marketing |
| Reply handling SLA | PM sales | PM lead |
| Agent Referral program (agreements, partner nurture, fee payouts) | PM sales / partnerships | Broker/Owner |

## 12. Open questions for the broker

1. ~~Are Seeto agents NAR members?~~ **Yes (Nov 5).** Active-listing owner email stays off, and those listings go to T7b.
2. Do we have the listing-agreement end dates for Withdrawn rows?
3. ~~Which broker name goes in the footer?~~ **Michael Seeto, Seeto Realty.** Still open: confirm the current office address. The website says 700 W Spring Creek Pkwy #212; HAR says 1721 W. Plano Pkwy #101.
4. What are the published PM fees and guarantees we can state in Step 4 (leasing fee, monthly %, lease-up guarantee)?
5. Do we have 2–3 real, shareable lease-up case studies for Step 3?
6. **Agent Referral:** which fee structure (flat $ vs. % of leasing fee), when is it paid, and will the broker sign a "won't list it for sale" client-return commitment?
7. Can we add listing-agent name, email and office to the Active and Withdrawn & Cancelled exports? The current `Listing Agents` tab is closed sales only. Do we have a budget for skip tracing to raise owner email coverage above 11%?

---

**Sources:** [Seeto Realty profile](https://www.provenexpert.com/seeto-realty/) · [TREC §535.153 (Cornell LII)](https://www.law.cornell.edu/regulations/texas/22-Tex-Admin-Code-SS-535-153) · [TREC FAQ](https://www.trec.texas.gov/node/360) · [NAR Article 16](https://www.nar.realtor/sites/default/files/policies/2012/code-of-ethics-article-16-2012-08-30.pdf) · [CandysDirt — Dallas rents](https://candysdirt.com/?p=429946) · [HAR — Houston rents](https://www.har.com/web/aubrielayne/blogs/143090) · [Point2Homes — Plano](https://www.point2homes.com/US/Average-Rent/TX/Plano.html) · [Red Sift — sender requirements](https://redsift.com/guides/bulk-email-sender-requirements) · [Warmy — Google/Yahoo rules](https://www.warmy.io/guides/google-yahoo-sender-requirements/) · [Hothawk — 2026 deliverability](https://hothawk.ai/blog/deliverability/email-deliverability-news-2026) · [gdprlocal — CAN-SPAM](https://gdprlocal.com/usa-e-mail-marketing-rules/) · [Arab MLS — MLS to PM clients](https://arabmls.org/converting-mls-listings-into-long-term-property-management-clients/) · [Luxury Presence — expired listings](https://www.luxurypresence.com/blogs/winning-over-expired-listings/) · [The Close — expired listings](https://theclose.com/how-to-get-expired-listings) · [TREC — fees to unlicensed persons](https://www.trec.texas.gov/can-license-holder-be-disciplined-paying-commission-or-fee-or-dividing-commission-or-fee-unlicensed) · [TREC — cash to unlicensed referrers](https://www.trec.texas.gov/node/470) · [Texas A&M — referrals in Texas](https://trerc.tamu.edu/article/understanding-real-estate-referrals-in-texas/) · [PURE PM TX — agent referral program](https://tx.purepm.co/company/agent-referral-program/) · [Real Property Management Gold — realtor referrals](https://www.realpmgold.com/realtor-referrals) · [Evernest — agent referrals](https://evernest.co/agents)

*This plan is marketing guidance, not legal advice. Have the broker of record confirm the compliance items in sections 2.3, 6.5 and 12 before relaunch.*
