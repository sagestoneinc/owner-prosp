'use client';

import { useMemo, useState } from 'react';
import type { RedactedLead } from '@/lib/types';
import { filterLeads, type LeadFilters } from '@/lib/lead-filter';

function fmtDate(value: string | null) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function stateLabel(lead: RedactedLead) {
  if (lead.completed) return 'Completed';
  if (lead.stopped) return lead.outcome || 'Stopped';
  if (lead.dueNow) return 'Due now';
  return 'Active';
}

export default function LeadTable({ leads, onOpen }: { leads: RedactedLead[]; onOpen: (id: string) => void }) {
  const [filters, setFilters] = useState<LeadFilters>({ query:'', source:'all', step:'all', state:'all' });
  const filtered = useMemo(() => filterLeads(leads, filters), [leads, filters]);
  const visible = filtered.slice(0, 250);

  return (
    <section className="panel leads-panel">
      <div className="panel-header leads-header">
        <div><div className="section-kicker">REDACTED LEADS</div><h2>Prospect queue</h2></div>
        <div className="result-count">{filtered.length.toLocaleString()} result{filtered.length === 1 ? '' : 's'}</div>
      </div>
      <div className="filters">
        <input className="search-input" aria-label="Search leads" placeholder="Search name, property, city…" value={filters.query} onChange={e => setFilters(f => ({...f, query:e.target.value}))} />
        <select value={filters.source} onChange={e => setFilters(f => ({...f, source:e.target.value as LeadFilters['source']}))}>
          <option value="all">All sources</option><option value="expired">Expired</option><option value="withdrawn">Withdrawn</option><option value="active">Active</option>
        </select>
        <select value={filters.step} onChange={e => setFilters(f => ({...f, step:e.target.value}))}>
          <option value="all">All steps</option>{[0,1,2,3,4,5].map(s => <option value={String(s)} key={s}>{s === 0 ? 'Not contacted' : `Step ${s}`}</option>)}
        </select>
        <select value={filters.state} onChange={e => setFilters(f => ({...f, state:e.target.value as LeadFilters['state']}))}>
          <option value="all">All states</option><option value="active">Active</option><option value="due">Due now</option><option value="stopped">Stopped</option><option value="completed">Completed</option>
        </select>
      </div>
      <div className="desktop-leads table-wrap">
        <table>
          <thead><tr><th>Name</th><th>Property</th><th>Source</th><th>Status</th><th>Step</th><th>Last sent</th><th>Next send</th><th /></tr></thead>
          <tbody>{visible.map(lead => <tr key={lead.id}>
            <td><strong>{lead.firstName}</strong></td>
            <td><strong>{lead.address || '—'}</strong><small>{[lead.city, lead.state].filter(Boolean).join(', ')}</small></td>
            <td><span className={`source-chip source-${lead.sourceKey}`}>{lead.sourceKey}</span></td>
            <td><span className={`status-pill ${lead.dueNow ? 'status-due' : lead.stopped ? 'status-stopped' : lead.completed ? 'status-complete' : ''}`}>{stateLabel(lead)}</span></td>
            <td>{lead.dripStep}</td><td>{fmtDate(lead.lastSentAt)}</td><td>{fmtDate(lead.nextSendAt)}</td>
            <td><button className="text-button" onClick={() => onOpen(lead.id)}>Open</button></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="mobile-leads">
        {visible.map(lead => <button className="mobile-lead-card" key={lead.id} onClick={() => onOpen(lead.id)}>
          <div><strong>{lead.firstName}</strong><span>{lead.address || 'No address'}</span></div>
          <div className="mobile-card-meta"><span className={`source-chip source-${lead.sourceKey}`}>{lead.sourceKey}</span><span className="status-pill">{stateLabel(lead)}</span><span>Step {lead.dripStep}</span></div>
        </button>)}
      </div>
      {filtered.length > 250 ? <p className="panel-note">Showing the first 250 matches. Narrow the filters to see a specific lead.</p> : null}
    </section>
  );
}
