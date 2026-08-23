'use client';

import { useEffect, useState } from 'react';
import type { FullLead } from '@/lib/types';

function fmtDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export default function LeadDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const [lead, setLead] = useState<FullLead | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) { setLead(null); setError(''); return; }
    const controller = new AbortController();
    setLoading(true); setError(''); setLead(null);
    fetch(`/api/leads/${encodeURIComponent(id)}`, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Unable to load lead.');
        return data as FullLead;
      })
      .then(setLead)
      .catch(err => { if (err.name !== 'AbortError') setError(err.message || 'Unable to load lead.'); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [id]);

  if (!id) return null;
  return (
    <div className="drawer-backdrop" onMouseDown={e => { if (e.currentTarget === e.target) onClose(); }}>
      <aside className="lead-drawer" role="dialog" aria-modal="true" aria-label="Lead details">
        <div className="drawer-header">
          <div><div className="section-kicker">FULL RECORD</div><h2>{lead?.firstName || 'Lead details'}</h2></div>
          <button className="icon-button" onClick={onClose} aria-label="Close">×</button>
        </div>
        {loading ? <div className="drawer-state">Loading full record…</div> : null}
        {error ? <div className="drawer-state error-state">{error}</div> : null}
        {lead ? <div className="detail-grid">
          <div className="detail-block wide"><span>Owner</span><strong>{lead.ownerRaw || '—'}</strong></div>
          <div className="detail-block wide"><span>Property</span><strong>{lead.address || '—'}</strong><small>{[lead.city, lead.state, lead.zipcode].filter(Boolean).join(', ')}</small></div>
          <div className="detail-block"><span>Email</span><strong>{lead.emails.length ? lead.emails.join('\n') : '—'}</strong></div>
          <div className="detail-block"><span>Phone</span><strong>{lead.phone || '—'}</strong></div>
          <div className="detail-block"><span>Source</span><strong>{lead.sourceLabel}</strong></div>
          <div className="detail-block"><span>Listing status</span><strong>{lead.listingStatus || '—'}</strong></div>
          <div className="detail-block"><span>MLS</span><strong>{lead.mls || '—'}</strong></div>
          <div className="detail-block"><span>Current price</span><strong>{lead.currentPrice || '—'}</strong></div>
          <div className="detail-block"><span>County</span><strong>{lead.county || '—'}</strong></div>
          <div className="detail-block"><span>Variant</span><strong>{lead.variant || '—'}</strong></div>
          <div className="detail-block"><span>Drip step</span><strong>{lead.dripStep}</strong></div>
          <div className="detail-block"><span>Outcome</span><strong>{lead.outcome || (lead.stopped ? 'Stopped' : '—')}</strong></div>
          <div className="detail-block"><span>Last sent</span><strong>{fmtDate(lead.lastSentAt)}</strong></div>
          <div className="detail-block"><span>Next send</span><strong>{fmtDate(lead.nextSendAt)}</strong></div>
          <div className="detail-block"><span>First contact</span><strong>{lead.firstContact || '—'}</strong></div>
        </div> : null}
      </aside>
    </div>
  );
}
