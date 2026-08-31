'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DashboardData, DayOfWeekPerformance, RedactedLead, SenderPerformance } from '@/lib/types';
import KpiCard from './kpi-card';
import SequenceFunnel from './sequence-funnel';
import SourceBreakdown from './source-breakdown';
import VariantPanel from './variant-panel';
import LeadTable from './lead-table';
import LeadDrawer from './lead-drawer';

function fmtDate(value: string | null, withTime = true) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en-US', { timeZone:'America/New_York', month:'short', day:'numeric', year:withTime?undefined:'numeric', hour:withTime?'numeric':undefined, minute:withTime?'2-digit':undefined }).format(new Date(value));
}
function pct(value:number) { return `${(value*100).toFixed(1)}%`; }
function ActivityList({ title, kicker, leads, timeField }: { title:string; kicker:string; leads:RedactedLead[]; timeField:'lastSentAt'|'nextSendAt' }) {
  return <section className="panel mini-panel"><div className="panel-header"><div><div className="section-kicker">{kicker}</div><h2>{title}</h2></div></div>
    <div className="activity-list">{leads.length ? leads.map(lead=><div className="activity-row" key={`${title}-${lead.id}`}><div><strong>{lead.firstName}</strong><span>{lead.address||'No address'} · {lead.sourceKey}</span></div><div className="activity-time">{fmtDate(lead[timeField])}</div></div>) : <div className="empty-state">Nothing to show yet.</div>}</div>
  </section>;
}
function PerformanceTable({ title, kicker, rows, kind }: { title:string; kicker:string; rows:Array<SenderPerformance|DayOfWeekPerformance>; kind:'sender'|'day' }) {
  const ordered = kind === 'day' ? [...rows].sort((a,b)=>(((a as DayOfWeekPerformance).dayIndex+6)%7)-(((b as DayOfWeekPerformance).dayIndex+6)%7)) : rows;
  return <section className="panel"><div className="panel-header"><div><div className="section-kicker">{kicker}</div><h2>{title}</h2></div></div>
    <div className="table-wrap"><table className="compact-table"><thead><tr><th>{kind==='sender'?'Sender':'Day'}</th><th>Sent</th><th>Opens</th><th>Open rate</th><th>Replies</th><th>Reply rate</th></tr></thead><tbody>
      {ordered.length ? ordered.map(row=>{
        const label = kind==='sender' ? (row as SenderPerformance).sender : (row as DayOfWeekPerformance).day;
        return <tr key={`${kind}-${label}`}><td><strong>{label}</strong><small>{row.contactedProspects.toLocaleString()} attributed leads</small></td><td>{row.emailsSent.toLocaleString()}</td><td>{row.trackedOpens.toLocaleString()}</td><td>{pct(row.trackedOpenRate)}</td><td>{row.knownReplies.toLocaleString()}</td><td>{pct(row.knownReplyRate)}</td></tr>;
      }) : <tr><td colSpan={6}><div className="empty-state">Performance data will appear after tracked campaign sends are logged.</div></td></tr>}
    </tbody></table></div>
    <p className="panel-note subtle">{kind==='sender'?'Replies are attributed to the most recent tracked sender for each prospect.':'Reply rate is lead-level and grouped by the weekday of the prospect’s most recent send; it is not the timestamp of the reply itself.'}</p>
  </section>;
}

export default function DashboardClient() {
  const [data,setData]=useState<DashboardData|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState(''); const [openLead,setOpenLead]=useState<string|null>(null);
  const load=useCallback(async()=>{ setLoading(true);setError('');try{const response=await fetch('/api/dashboard',{cache:'no-store'});if(response.status===401){window.location.href='/login';return;}const payload=await response.json();if(!response.ok)throw new Error(payload.error||'Unable to load dashboard.');setData(payload as DashboardData);}catch(err){setError(err instanceof Error?err.message:'Unable to load dashboard.');}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]);
  async function logout(){await fetch('/api/auth/logout',{method:'POST'});window.location.href='/login';}

  return <main className="dashboard-shell"><div className="dashboard-wrap">
    <header className="topbar"><div><div className="eyebrow">SEETO REALTY · OWNER PROSPECTING</div><h1>Drip performance</h1><p>Live operations and recipient engagement across the owner prospecting pipeline.</p></div><div className="topbar-actions"><div className="refresh-meta">{data?<>Updated {fmtDate(data.fetchedAt)}<small>{data.timezone}</small></>:'Waiting for live data'}</div><button className="secondary-button" onClick={()=>void load()} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button><button className="ghost-button" onClick={logout}>Log out</button></div></header>
    {error?<section className="setup-alert"><strong>Dashboard data unavailable</strong><span>{error}</span><button className="secondary-button" onClick={()=>void load()}>Try again</button></section>:null}
    {!data&&loading?<div className="loading-grid">{Array.from({length:8}).map((_,i)=><div className="skeleton" key={i}/>)}</div>:null}
    {data?<>
      <section className="kpi-grid tracking-kpis">
        <KpiCard label="Emails sent" value={data.headline.emailsSent.toLocaleString()} hint="recipient-level successful sends" />
        <KpiCard label="Tracked opens" value={data.headline.trackedOpens.toLocaleString()} hint={`${pct(data.headline.trackedOpenRate)} tracked open rate`} tone={data.headline.trackedOpens?'good':'default'} />
        <KpiCard label="Not opened" value={data.headline.notOpened.toLocaleString()} hint="no tracked pixel load yet" />
        <KpiCard label="Known replies" value={data.headline.knownReplies.toLocaleString()} hint={`${pct(data.headline.knownReplyRate)} lead-level reply rate`} tone={data.headline.knownReplies?'good':'default'} />
        <KpiCard label="Active sequences" value={data.headline.activeSequences.toLocaleString()} hint="eligible and not stopped" />
        <KpiCard label="Due now" value={data.headline.dueNow.toLocaleString()} hint="next send at or before now" tone={data.headline.dueNow?'warn':'default'} />
        <KpiCard label="Total prospects" value={data.headline.totalProspects.toLocaleString()} hint={`${data.headline.withEmail.toLocaleString()} with email`} />
        <KpiCard label="Contacted leads" value={data.headline.contacted.toLocaleString()} hint={`${data.headline.completed.toLocaleString()} completed all 5`} />
        <KpiCard label="Sent today" value={data.headline.sentToday.toLocaleString()} hint={`${data.headline.sentThisWeek.toLocaleString()} leads sent this week`} />
        <KpiCard label="Stopped" value={data.headline.stopped.toLocaleString()} hint="excludes completed sequences" />
        <KpiCard label="Data quality" value={(data.dataQuality.noEmail+data.dataQuality.malformedDates).toLocaleString()} hint={`${data.dataQuality.noEmail} no email · ${data.dataQuality.malformedDates} bad dates`} tone={data.dataQuality.malformedDates?'warn':'default'} />
      </section>
      <p className="tracking-disclaimer">Tracked opens are directional: Apple Mail Privacy Protection, image proxies, scanners, and image blocking can affect open counts. Replies are the stronger engagement signal.</p>
      <div className="two-col"><PerformanceTable title="Sender performance" kicker="MAILBOX HEALTH" rows={data.senderPerformance} kind="sender"/><PerformanceTable title="Day-of-week performance" kicker="SEND TIMING" rows={data.dayOfWeekPerformance} kind="day"/></div>
      <div className="two-col"><SequenceFunnel sequence={data.sequence}/><SourceBreakdown sources={data.sources}/></div>
      <div className="two-col"><VariantPanel variants={data.variants} readout={data.abReadout}/><div className="stacked-panels"><ActivityList title="Upcoming sends" kicker="NEXT IN QUEUE" leads={data.upcoming} timeField="nextSendAt"/><ActivityList title="Recent activity" kicker="LATEST SEND STATE" leads={data.recent} timeField="lastSentAt"/></div></div>
      <LeadTable leads={data.leads} onOpen={setOpenLead}/>
      <footer className="dashboard-footer"><span>Read-only dashboard · Google Sheet data is fetched server-side.</span><span>Company-only owners: {data.dataQuality.companyOnlyOwners.toLocaleString()}</span></footer>
    </>:null}
  </div><LeadDrawer id={openLead} onClose={()=>setOpenLead(null)}/></main>;
}
