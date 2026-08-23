import type { DashboardData } from '@/lib/types';

export default function SequenceFunnel({ sequence }: { sequence: DashboardData['sequence'] }) {
  const max = Math.max(...sequence.map(s => s.count), 1);
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="section-kicker">SEQUENCE</div>
          <h2>Current drip distribution</h2>
        </div>
      </div>
      <div className="funnel-list">
        {sequence.map(item => (
          <div className="funnel-row" key={item.step}>
            <div className="funnel-step">{item.step === 0 ? 'Queued' : `Step ${item.step}`}</div>
            <div className="funnel-copy">
              <div className="funnel-label">{item.label}</div>
              <div className="bar-track"><span style={{ width: `${Math.max(3, (item.count / max) * 100)}%` }} /></div>
            </div>
            <div className="funnel-count">{item.count.toLocaleString()}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
