'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DashboardData } from '@/lib/types';
import { buildCountySummaries, filterCountyLeads, type CountyLeadSort, type CountyLeadState } from '@/lib/county-leads';
import AppNav from './app-nav';
import LeadDrawer from './lead-drawer';

export default function CountyLeadsClient(){
  const [data,setData]=useState<DashboardData|null>(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [countyQuery,setCountyQuery]=useState('');
  const [selectedCounty,setSelectedCounty]=useState<string>('');
  const [leadQuery,setLeadQuery]=useState('');
  const [state,setState]=useState<CountyLeadState>('all');
  const [sort,setSort]=useState<CountyLeadSort>('owner');
  const [countySort,setCountySort]=useState<'count'|'alpha'>('count');
  const [openLead,setOpenLead]=useState<string|null>(null);

  const load=useCallback(async()=>{setLoading(true);setError('');try{const response=await fetch('/api/dashboard',{cache:'no-store'});if(response.status===401){window.location.href='/login';return;}const payload=await response.json();if(!response.ok)throw new Error(payload.error||'Unable to load county leads.');setData(payload as DashboardData);}catch(err){setError(err instanceof Error?err.message:'Unable to load county leads.');}finally{setLoading(false);}},[]);
  useEffect(()=>{void load();},[load]);

  const counties=useMemo(()=>{const q=countyQuery.trim().toLowerCase();let rows=buildCountySummaries(data?.leads||[]).filter(item=>!q||item.county.toLowerCase().includes(q));if(countySort==='alpha')rows=[...rows].sort((a,b)=>a.county.localeCompare(b.county));return rows;},[data,countyQuery,countySort]);
  useEffect(()=>{if(!selectedCounty&&counties.length)setSelectedCounty(counties[0].county);else if(selectedCounty&&!counties.some(x=>x.county===selectedCounty)&&counties.length)setSelectedCounty(counties[0].county);},[counties,selectedCounty]);
  const selectedSummary=useMemo(()=>counties.find(x=>x.county===selectedCounty)||buildCountySummaries(data?.leads||[]).find(x=>x.county===selectedCounty),[counties,data,selectedCounty]);
  const leads=useMemo(()=>filterCountyLeads(data?.leads||[],{county:selectedCounty,state,query:leadQuery,sort}),[data,selectedCounty,state,leadQuery,sort]);

  async function logout(){await fetch('/api/auth/logout',{method:'POST'});window.location.href='/login';}
  return <main className="dashboard-shell"><div className="dashboard-wrap"><AppNav current="county"/><header className="topbar"><div><div className="eyebrow">SEETO REALTY · OWNER PROSPECTING</div><h1>Leads by county</h1><p>Navigate the prospect database by county, then filter and sort the leads inside each market.</p></div><div className="topbar-actions"><button className="secondary-button" disabled={loading} onClick={()=>void load()}>{loading?'Refreshing…':'Refresh'}</button><button className="ghost-button" onClick={logout}>Log out</button></div></header>
  {error?<section className="setup-alert"><strong>County data unavailable</strong><span>{error}</span><button className="secondary-button" onClick={()=>void load()}>Try again</button></section>:null}
  <div className="county-layout"><aside className="panel county-sidebar"><div className="panel-header"><div><div className="section-kicker">COUNTIES</div><h2>{counties.length.toLocaleString()} markets</h2></div></div><div className="county-controls"><input placeholder="Search county…" value={countyQuery} onChange={e=>setCountyQuery(e.target.value)}/><select value={countySort} onChange={e=>setCountySort(e.target.value as 'count'|'alpha')}><option value="count">Largest first</option><option value="alpha">A–Z</option></select></div><div className="county-list">{counties.map(item=><button key={item.county} className={`county-item ${selectedCounty===item.county?'active':''}`} onClick={()=>{setSelectedCounty(item.county);setLeadQuery('');}}><span><strong>{item.county}</strong><small>{item.incomplete} incomplete · {item.dueNow} due</small></span><b>{item.total.toLocaleString()}</b></button>)}</div></aside>
  <section className="panel county-results"><div className="panel-header"><div><div className="section-kicker">SELECTED COUNTY</div><h2>{selectedCounty||'Choose a county'}</h2>{selectedSummary?<p className="county-summary">{selectedSummary.total.toLocaleString()} total · {selectedSummary.actionable.toLocaleString()} actionable · {selectedSummary.incomplete.toLocaleString()} incomplete · {selectedSummary.dueNow.toLocaleString()} due now · {selectedSummary.badLeads.toLocaleString()} bad</p>:null}</div><div className="result-count">{leads.length.toLocaleString()} result{leads.length===1?'':'s'}</div></div>
  <div className="county-result-filters"><input placeholder="Search owner, property, city…" value={leadQuery} onChange={e=>setLeadQuery(e.target.value)}/><select value={state} onChange={e=>setState(e.target.value as CountyLeadState)}><option value="all">All leads</option><option value="actionable">Actionable</option><option value="incomplete">Incomplete</option><option value="due">Due now</option><option value="bad">Bad leads</option></select><select value={sort} onChange={e=>setSort(e.target.value as CountyLeadSort)}><option value="owner">Sort by owner</option><option value="property">Sort by property</option><option value="status">Sort by status</option><option value="source">Sort by source</option></select></div>
  <div className="table-wrap desktop-leads"><table><thead><tr><th>Owner</th><th>Property</th><th>Status</th><th>Source</th><th>Flags</th><th/></tr></thead><tbody>{leads.slice(0,500).map(lead=><tr key={lead.id}><td><strong>{lead.firstName}</strong></td><td><strong>{lead.address||'No address'}</strong><small>{[lead.city,lead.state].filter(Boolean).join(', ')}</small></td><td>{lead.listingStatus||'—'}</td><td><span className={`source-chip source-${lead.sourceKey}`}>{lead.sourceKey}</span></td><td><div className="missing-chips">{lead.badLead?<span className="bad-lead-badge">Bad Lead</span>:null}{lead.missingDetails&&!lead.badLead?<span className="needs-details">Needs details</span>:null}{lead.dueNow&&!lead.badLead?<span className="status-pill status-due">Due now</span>:null}</div></td><td><button className="text-button" onClick={()=>setOpenLead(lead.id)}>Open</button></td></tr>)}</tbody></table></div>
  <div className="mobile-leads">{leads.slice(0,500).map(lead=><button className="mobile-lead-card" key={lead.id} onClick={()=>setOpenLead(lead.id)}><div><strong>{lead.firstName}</strong><span>{lead.address||'No address'} · {lead.listingStatus||'No status'}</span></div><div className="mobile-card-meta"><span className={`source-chip source-${lead.sourceKey}`}>{lead.sourceKey}</span>{lead.badLead?<span className="bad-lead-badge">Bad Lead</span>:null}{lead.missingDetails&&!lead.badLead?<span className="needs-details">Needs details</span>:null}</div></button>)}</div>{leads.length>500?<p className="panel-note">Showing the first 500 matches. Narrow the county filters to find a specific lead.</p>:null}</section></div>
  </div><LeadDrawer id={openLead} onClose={()=>setOpenLead(null)} onSaved={()=>void load()}/></main>;
}
