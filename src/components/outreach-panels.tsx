import type { DashboardData } from '@/lib/types';

function pct(value: number) { return `${(value * 100).toFixed(1)}%`; }
function plural(n: number, one: string, many: string) { return `${n.toLocaleString()} ${n === 1 ? one : many}`; }

export function DashboardWarnings({ warnings, compliance }: { warnings: string[]; compliance: DashboardData['compliance'] }) {
  const items = [...warnings];
  if (compliance.gatedDueNow > 0) items.unshift(`${plural(compliance.gatedDueNow, 'Withdrawn or Active-listing owner is', 'Withdrawn or Active-listing owners are')} due for an owner email. The plan keeps owner email off for these tracks. Route them to agent referral and stop them in Make.`);
  if (!items.length) return null;
  return <section className="setup-alert outreach-alert" role="status"><strong>Needs attention</strong><span>{items.map((item, i) => <span className="alert-line" key={i}>{item}</span>)}</span></section>;
}

export function TrackPanel({ tracks, compliance }: { tracks: DashboardData['tracks']; compliance: DashboardData['compliance'] }) {
  return <section className="panel">
    <div className="panel-header"><div><div className="section-kicker">ACTION PLAN SEGMENTS</div><h2>Outreach tracks</h2></div></div>
    <div className="table-wrap"><table className="compact-table"><thead><tr><th>Track</th><th>Leads</th><th>Email</th><th>Contacted</th><th>Replies</th><th>Positive</th></tr></thead><tbody>
      {tracks.map(t => <tr key={t.track}>
        <td><strong>{t.track} · {t.label}</strong>{t.gate ? <small className={t.ownerEmailAllowed ? '' : 'gate-note'}>{t.gate}</small> : <small>Owner email allowed</small>}</td>
        <td>{t.total.toLocaleString()}</td><td>{t.withEmail.toLocaleString()}</td><td>{t.contacted.toLocaleString()}</td><td>{t.knownReplies.toLocaleString()}</td><td>{t.positiveReplies.toLocaleString()}</td>
      </tr>)}
    </tbody></table></div>
    <p className="panel-note subtle">Tracks are derived automatically: Active → T4, Withdrawn → T3, no email → T6, entity owners → T5, then Expired (T1) or Cancelled (T2). {plural(compliance.gatedContacted, 'gated-track owner has', 'gated-track owners have')} already been contacted.</p>
  </section>;
}

export function ReplyReasonsPanel({ reasons, headline }: { reasons: DashboardData['replyReasons']; headline: DashboardData['headline'] }) {
  const max = Math.max(...reasons.map(r => r.count), 1);
  return <section className="panel">
    <div className="panel-header"><div><div className="section-kicker">WHY OWNERS RESPOND</div><h2>Reply reasons</h2></div></div>
    <div className="funnel-list">{reasons.length ? reasons.map(r => <div className="reason-row" key={r.reason}><div className="reason-label"><strong>{r.reason}</strong></div><div className="bar-track"><span style={{ width: `${Math.max(3, (r.count / max) * 100)}%` }} /></div><div className="funnel-count">{r.count.toLocaleString()}</div></div>) : <div className="empty-state">No replies logged yet. Set an outcome on a lead to start this view.</div>}</div>
    <p className="panel-note">Funnel: {plural(headline.positiveReplies, 'positive reply', 'positive replies')} ({pct(headline.positiveReplyRate)} of contacted) → {plural(headline.callsBooked, 'call booked', 'calls booked')} → {plural(headline.agreementsSigned, 'agreement signed', 'agreements signed')}.</p>
    <p className="panel-note subtle">Outcomes come from Lead Disposition (set in the lead drawer or by Make) and Status 2. "Replied (no reason logged)" means a reply was detected without a reason. Set one so the copy can improve.</p>
  </section>;
}

export function AgentReferralPanel({ agents }: { agents: DashboardData['agents'] }) {
  if (!agents) return <section className="panel"><div className="panel-header"><div><div className="section-kicker">T7 · AGENT REFERRAL</div><h2>Listing agent partners</h2></div></div><div className="empty-state">The Listing Agents tab is unavailable.</div></section>;
  const steps: Array<[string, number]> = [['Unique agents', agents.uniqueAgents], ['With email', agents.withEmail], ['Contacted', agents.contacted], ['Interested', agents.interested], ['Referral agreements', agents.agreementsSigned], ['Owners referred', agents.referredOwners]];
  const max = Math.max(agents.uniqueAgents, 1);
  return <section className="panel">
    <div className="panel-header"><div><div className="section-kicker">T7 · AGENT REFERRAL</div><h2>Listing agent partners</h2></div></div>
    <div className="funnel-list">{steps.map(([label, value]) => <div className="reason-row" key={label}><div className="reason-label"><strong>{label}</strong></div><div className="bar-track"><span style={{ width: `${Math.max(2, (value / max) * 100)}%` }} /></div><div className="funnel-count">{value.toLocaleString()}</div></div>)}</div>
    <p className="panel-note">{agents.listingRows.toLocaleString()} listing rows · {agents.multiListingAgents.toLocaleString()} agents with 2+ listings (send them one email) · {agents.unsubscribed.toLocaleString()} unsubscribed.{agents.topCounties.length ? ` Top counties: ${agents.topCounties.map(c => `${c.county} (${c.count})`).join(', ')}.` : ''}</p>
    <p className="panel-note subtle">Counts come from the Listing Agents tab. Log agent outcomes in its Status 2 column: Partner – interested, Referral agreement signed, Referred owner, Not interested, Unsubscribe. Referral fees are paid only to the agent’s sponsoring broker.</p>
  </section>;
}
