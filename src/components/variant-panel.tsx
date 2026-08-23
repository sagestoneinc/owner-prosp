import type { DashboardData } from '@/lib/types';

export default function VariantPanel({ variants, readout }: { variants: DashboardData['variants']; readout: string }) {
  const maxRate = Math.max(...variants.map(v => v.knownReplyRate), 0.01);
  return (
    <section className="panel">
      <div className="panel-header">
        <div>
          <div className="section-kicker">A/B VARIANTS</div>
          <h2>Known reply performance</h2>
        </div>
      </div>
      <div className="variant-grid">
        {variants.map(v => (
          <div className="variant-card" key={v.variant}>
            <div className="variant-head"><strong>Variant {v.variant}</strong><span>{(v.knownReplyRate * 100).toFixed(1)}%</span></div>
            <div className="bar-track variant-bar"><span style={{ width: `${Math.max(2, (v.knownReplyRate / maxRate) * 100)}%` }} /></div>
            <div className="variant-meta"><span>{v.contacted.toLocaleString()} contacted</span><span>{v.knownReplies.toLocaleString()} known replies</span></div>
          </div>
        ))}
      </div>
      <p className="panel-note">{readout}</p>
      <p className="panel-note subtle">Reply counts are limited to outcomes persisted in the Sheet's Status 2 field.</p>
    </section>
  );
}
