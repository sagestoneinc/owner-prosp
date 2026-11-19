import type { ResponseMetrics } from '@/lib/types';

function pct(value: number) { return `${(value * 100).toFixed(1)}%`; }
function fmtLaunch(key: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${key}T12:00:00Z`));
}

export default function ResponsePanel({ responses }: { responses: ResponseMetrics }) {
  const { goal, byStep, types, copy, launchDate, undatedReplies } = responses;
  const launch = fmtLaunch(launchDate);
  const totalTyped = types.reduce((sum, t) => sum + t.count, 0);
  const bestStep = byStep.reduce((best, s) => (s.replies > best.replies ? s : best), byStep[0]);
  return (
    <section className="panel response-panel">
      <div className="panel-header">
        <div><div className="section-kicker">RESPONSES</div><h2>Are owners writing back?</h2></div>
      </div>

      <div className="response-grid">
        <div className="response-card">
          <div className="response-label">Weekly reply goal</div>
          <div className="response-big">{goal.thisWeek}<span> / {goal.weeklyTarget}</span></div>
          <div className="bar-track"><span style={{ width: `${Math.round(goal.progress * 100)}%` }} /></div>
          <small>{goal.lastWeek} last week{undatedReplies ? ` · ${undatedReplies} older replies have no date` : ''}</small>
        </div>

        <div className="response-card">
          <div className="response-label">New copy vs old copy</div>
          <table className="compact-table">
            <thead><tr><th /><th>Contacted</th><th>Replies</th><th>Rate</th></tr></thead>
            <tbody>
              <tr><td><strong>New</strong><small>first email {launch} on</small></td><td>{copy.newCopy.contacted}</td><td>{copy.newCopy.replies}</td><td>{pct(copy.newCopy.replyRate)}</td></tr>
              <tr><td><strong>Old</strong><small>before {launch}</small></td><td>{copy.oldCopy.contacted}</td><td>{copy.oldCopy.replies}</td><td>{pct(copy.oldCopy.replyRate)}</td></tr>
            </tbody>
          </table>
        </div>

        <div className="response-card">
          <div className="response-label">Reply type</div>
          {totalTyped ? (
            <ul className="response-types">
              {types.map(t => (
                <li key={t.type}><span>{t.type}</span><strong>{t.count}</strong></li>
              ))}
            </ul>
          ) : <div className="empty-state">No replies yet.</div>}
          <small>Set Lead Disposition to Interested, Not interested or Unsubscribed to sort replies.</small>
        </div>
      </div>

      <div className="table-wrap">
        <table className="compact-table">
          <thead><tr><th>Email that got the reply</th><th>Owners reached</th><th>Replies</th><th>Reply rate</th></tr></thead>
          <tbody>
            {byStep.map(s => (
              <tr key={s.step}>
                <td><strong>{s.label}</strong>{s.step === bestStep.step && s.replies > 0 ? <small>most replies</small> : null}</td>
                <td>{s.reached.toLocaleString()}</td>
                <td>{s.replies.toLocaleString()}</td>
                <td>{pct(s.replyRate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="panel-note subtle">The scenario stops a sequence when an owner replies, so the last email sent is the one they answered. New vs old is grouped by when each owner's first email went out, estimated from the send schedule.</p>
    </section>
  );
}
