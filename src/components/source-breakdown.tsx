import type { DashboardData } from '@/lib/types';

export default function SourceBreakdown({ sources }: { sources: DashboardData['sources'] }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="section-kicker">LIST COVERAGE</div>
          <h2>By source</h2>
        </div>
      </div>
      <div className="table-wrap compact-table">
        <table>
          <thead><tr><th>Source</th><th>Total</th><th>Email</th><th>Active</th><th>Due</th><th>Contacted</th><th>Stopped</th></tr></thead>
          <tbody>
            {sources.map(source => (
              <tr key={source.sourceKey}>
                <td><span className={`source-dot source-${source.sourceKey}`} />{source.label}</td>
                <td>{source.total.toLocaleString()}</td>
                <td>{source.withEmail.toLocaleString()}</td>
                <td>{source.active.toLocaleString()}</td>
                <td>{source.due.toLocaleString()}</td>
                <td>{source.contacted.toLocaleString()}</td>
                <td>{source.stopped.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
