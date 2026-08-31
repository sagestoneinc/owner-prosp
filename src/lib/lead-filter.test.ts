import assert from 'node:assert/strict';
import { filterLeads } from './lead-filter';
import type { RedactedLead } from './types';

const leads: RedactedLead[] = [
  { id:'expired:2', firstName:'Chong', address:'117 Brittons Lane', city:'Runaway Bay', state:'Texas', county:'Wise', listingStatus:'Expired', sourceKey:'expired', sourceLabel:'Expired Listings', dripStep:1, lastSentAt:null, nextSendAt:null, stopped:false, outcome:'', variant:'B', disposition:'', badLead:false, dueNow:true, completed:false, missingDetails:true, missingFields:['phone'] },
  { id:'active:4', firstName:'Kelly', address:'1712 Sandalwood Way', city:'Plano', state:'Texas', county:'Collin', listingStatus:'Active', sourceKey:'active', sourceLabel:'Active Listings', dripStep:5, lastSentAt:'2026-08-20T14:00:00.000Z', nextSendAt:null, stopped:false, outcome:'', variant:'A', disposition:'', badLead:false, dueNow:false, completed:true, missingDetails:false, missingFields:[] },
  { id:'withdrawn:5', firstName:'Jeffrey', address:'1610 Palladio Loop', city:'Dallas', state:'Texas', county:'Dallas', listingStatus:'Withdrawn', sourceKey:'withdrawn', sourceLabel:'Withdrawn & Cancelled', dripStep:2, lastSentAt:'2026-08-22T14:00:00.000Z', nextSendAt:'2026-08-28T14:00:00.000Z', stopped:true, outcome:'Replied', variant:'B', disposition:'', badLead:false, dueNow:false, completed:false, missingDetails:true, missingFields:['email'] },
  { id:'expired:9', firstName:'Owner', address:'', city:'Plano', state:'Texas', county:'Collin', listingStatus:'Expired', sourceKey:'expired', sourceLabel:'Expired Listings', dripStep:0, lastSentAt:null, nextSendAt:null, stopped:false, outcome:'', variant:'', disposition:'Bad Lead', badLead:true, dueNow:false, completed:false, missingDetails:true, missingFields:['owner','email','phone','address'] }
];

const all = { query:'', source:'all' as const, step:'all' as const, state:'all' as const, details:'all' as const, disposition:'active' as const };
assert.deepEqual(filterLeads(leads, { ...all, query:'palladio' }).map(x=>x.id), ['withdrawn:5']);
assert.deepEqual(filterLeads(leads, { ...all, source:'active' }).map(x=>x.id), ['active:4']);
assert.deepEqual(filterLeads(leads, { ...all, state:'due' }).map(x=>x.id), ['expired:2']);
assert.deepEqual(filterLeads(leads, { ...all, step:'5', state:'completed' }).map(x=>x.id), ['active:4']);
assert.deepEqual(filterLeads(leads, { ...all, details:'missing' }).map(x=>x.id), ['expired:2','withdrawn:5']);
assert.deepEqual(filterLeads(leads, { ...all, details:'complete' }).map(x=>x.id), ['active:4']);
assert.deepEqual(filterLeads(leads, { ...all, disposition:'bad' }).map(x=>x.id), ['expired:9']);
console.log('lead filter tests passed');
