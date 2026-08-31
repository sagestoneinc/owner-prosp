import assert from 'node:assert/strict';
import { buildCountySummaries, filterCountyLeads } from './county-leads';
import type { RedactedLead } from './types';

const lead = (overrides: Partial<RedactedLead>): RedactedLead => ({
  id:'expired:2', firstName:'Kelly', address:'100 Main St', city:'Plano', state:'Texas', county:'Collin', listingStatus:'Expired', sourceKey:'expired', sourceLabel:'Expired Listings', dripStep:1, lastSentAt:null, nextSendAt:null, stopped:false, outcome:'', variant:'A', disposition:'', badLead:false, dueNow:false, completed:false, missingDetails:false, missingFields:[],
  ...overrides
});

const leads = [
  lead({ id:'expired:2', county:'Collin', dueNow:true }),
  lead({ id:'active:3', sourceKey:'active', sourceLabel:'Active Listings', county:'Collin', missingDetails:true, missingFields:['phone'] }),
  lead({ id:'withdrawn:4', sourceKey:'withdrawn', sourceLabel:'Withdrawn & Cancelled Listings', county:'Dallas', badLead:true, disposition:'Bad Lead' }),
  lead({ id:'expired:5', county:'Dallas' }),
  lead({ id:'expired:6', county:'' })
];

const summaries = buildCountySummaries(leads);
assert.deepEqual(summaries.map(x => [x.county,x.total]), [['Collin',2],['Dallas',2],['Unknown',1]]);
assert.equal(summaries.find(x=>x.county==='Collin')?.incomplete, 1);
assert.equal(summaries.find(x=>x.county==='Collin')?.dueNow, 1);
assert.equal(summaries.find(x=>x.county==='Dallas')?.badLeads, 1);

assert.deepEqual(filterCountyLeads(leads,{county:'Collin',state:'all',query:'',sort:'owner'}).map(x=>x.id), ['active:3','expired:2']);
assert.deepEqual(filterCountyLeads(leads,{county:'Dallas',state:'bad',query:'',sort:'property'}).map(x=>x.id), ['withdrawn:4']);
assert.deepEqual(filterCountyLeads(leads,{county:'Unknown',state:'all',query:'',sort:'owner'}).map(x=>x.id), ['expired:6']);

console.log('county leads tests passed');
