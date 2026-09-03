import { getGoogleAccessToken } from './google-auth';
import { cleanAddress, displayFirstName, normalizeEmailCell, parseSheetDate } from './normalize';
import { mapEmailActivityRows } from './email-activity';
import type { EmailActivityRow, FullLead, ProspectRow, SourceKey } from './types';
import type { LeadUpdatePayload } from './lead-update';
import { buildLeadUpdateRanges } from './lead-update';
import type { LeadDisposition } from './lead-disposition';
import { buildDispositionRange } from './lead-disposition';
import { buildSheetSchema, REQUIRED_LEAD_HEADERS, type SheetSchema } from './sheet-schema';
import { toRedactedLead } from './metrics';

const DEFAULT_SPREADSHEET_ID = '1xTTb6Wl-4vSHE08VrtjMyNJUdOQqH0nxq03Y7qt4uBo';

export const SOURCE_TABS: Record<SourceKey, { title: string; label: string }> = {
  expired: { title: 'Expired Listings', label: 'Expired Listings' },
  withdrawn: { title: 'Withdrawn & Cancelled Listings', label: 'Withdrawn & Cancelled Listings' },
  active: { title: 'Active Listings', label: 'Active Listings' }
};

function cell(row: unknown[], index: number): string { const value=row[index]; return value==null?'':String(value); }
function parseDateWithQuality(value: unknown): { date: Date | null; malformed: number } { if(value==null||value==='')return{date:null,malformed:0}; const date=parseSheetDate(value); return{date,malformed:date?0:1}; }

export function mapSheetRows(sourceKey: SourceKey, values: unknown[][], startRow = 2, headers: unknown[] = [...REQUIRED_LEAD_HEADERS]): ProspectRow[] {
  const source=SOURCE_TABS[sourceKey];
  const schema=buildSheetSchema(source.title,headers);
  const at=(row:unknown[],header:Parameters<SheetSchema['indexOf']>[0])=>cell(row,schema.indexOf(header));
  return values.map((row,index)=>{
    const next=parseDateWithQuality(at(row,'Next Send At'));
    const last=parseDateWithQuality(at(row,'Last Sent At'));
    const ownerRaw=at(row,'Owners Name');
    return {
      sourceKey,sourceLabel:source.label,rowNumber:startRow+index,
      mls:at(row,'MLS #'),address:cleanAddress(at(row,'Address')),city:cleanAddress(at(row,'City')),state:cleanAddress(at(row,'State')),zipcode:at(row,'Zipcode').trim(),county:cleanAddress(at(row,'County')),currentPrice:at(row,'Current Price').trim(),listingStatus:cleanAddress(at(row,'Status')),
      ownerRaw,firstName:displayFirstName(ownerRaw),phone:at(row,'Phone Number').trim(),emails:normalizeEmailCell(at(row,'Email')),
      firstContact:at(row,'First Contact').trim(),status2:at(row,'Status 2').trim(),dripStep:Math.max(0,Math.min(5,Number.parseInt(at(row,'Drip Step'),10)||0)),
      nextSendAt:next.date,lastSentAt:last.date,stoppedRaw:at(row,'Stopped').trim(),variant:at(row,'Variant').trim().toUpperCase(),disposition:at(row,'Lead Disposition').trim(),malformedDateCount:next.malformed+last.malformed
    } satisfies ProspectRow;
  }).filter(row=>Boolean(row.mls||row.address||row.ownerRaw||row.phone||row.emails.length||row.listingStatus||row.dripStep||row.lastSentAt||row.nextSendAt||row.disposition));
}

export function parseLeadId(id:string):{sourceKey:SourceKey;rowNumber:number}|null { const match=/^(expired|withdrawn|active):(\d+)$/.exec(id); if(!match)return null; const rowNumber=Number(match[2]); if(!Number.isInteger(rowNumber)||rowNumber<2)return null; return{sourceKey:match[1] as SourceKey,rowNumber}; }
function spreadsheetId():string { return process.env.GOOGLE_SPREADSHEET_ID?.trim()||DEFAULT_SPREADSHEET_ID; }

async function googleJson(url:string, init:RequestInit = {}):Promise<any> {
  const token=await getGoogleAccessToken();
  const response=await fetch(url,{...init,headers:{authorization:`Bearer ${token}`,accept:'application/json','content-type':'application/json',...(init.headers||{})},cache:'no-store'});
  if(!response.ok){let detail='';try{const body=await response.json() as {error?:{status?:string;message?:string}};detail=[body.error?.status,body.error?.message].filter(Boolean).join(': ');}catch{detail='';}throw new Error(`Google Sheets request failed (${response.status})${detail?`: ${detail}`:''}.`);}
  return response.json();
}

async function fetchSourceSchema(sourceKey:SourceKey):Promise<SheetSchema>{
  const title=SOURCE_TABS[sourceKey].title.replace(/'/g,"''"); const sid=encodeURIComponent(spreadsheetId()); const range=encodeURIComponent(`'${title}'!A1:T1`);
  const json=await googleJson(`https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${range}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE`) as {values?:unknown[][]};
  return buildSheetSchema(SOURCE_TABS[sourceKey].title,json.values?.[0]??[]);
}

export async function fetchAllSourceRows():Promise<ProspectRow[]> {
  const id=encodeURIComponent(spreadsheetId()); const params=new URLSearchParams(); const keys=Object.keys(SOURCE_TABS) as SourceKey[];
  keys.forEach(key=>params.append('ranges',`'${SOURCE_TABS[key].title.replace(/'/g,"''")}'!A1:T`)); params.set('majorDimension','ROWS');params.set('valueRenderOption','FORMATTED_VALUE');params.set('dateTimeRenderOption','FORMATTED_STRING');
  const json=await googleJson(`https://sheets.googleapis.com/v4/spreadsheets/${id}/values:batchGet?${params.toString()}`) as {valueRanges?:Array<{values?:unknown[][]}>}; const ranges=json.valueRanges??[];
  return keys.flatMap((key,i)=>{const values=ranges[i]?.values??[];return mapSheetRows(key,values.slice(1),2,values[0]??[]);});
}
export async function fetchEmailActivityRows():Promise<EmailActivityRow[]> { const sid=encodeURIComponent(spreadsheetId()); const range=encodeURIComponent(`'Email Activity'!A2:S`); const json=await googleJson(`https://sheets.googleapis.com/v4/spreadsheets/${sid}/values/${range}?majorDimension=ROWS&valueRenderOption=FORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING`) as {values?:unknown[][]}; return mapEmailActivityRows(json.values??[],2); }

export async function fetchLeadById(id:string):Promise<FullLead|null> {
  const parsed=parseLeadId(id); if(!parsed)return null; const {sourceKey,rowNumber}=parsed; const title=SOURCE_TABS[sourceKey].title.replace(/'/g,"''"); const sid=encodeURIComponent(spreadsheetId()); const params=new URLSearchParams();
  params.append('ranges',`'${title}'!A1:T1`); params.append('ranges',`'${title}'!A${rowNumber}:T${rowNumber}`); params.set('majorDimension','ROWS');params.set('valueRenderOption','FORMATTED_VALUE');params.set('dateTimeRenderOption','FORMATTED_STRING');
  const json=await googleJson(`https://sheets.googleapis.com/v4/spreadsheets/${sid}/values:batchGet?${params.toString()}`) as {valueRanges?:Array<{values?:unknown[][]}>}; const ranges=json.valueRanges??[]; const headers=ranges[0]?.values?.[0]??[]; const values=ranges[1]?.values??[];
  const row=mapSheetRows(sourceKey,values,rowNumber,headers)[0]; if(!row)return null; return{...toRedactedLead(row),mls:row.mls,zipcode:row.zipcode,county:row.county,currentPrice:row.currentPrice,ownerRaw:row.ownerRaw,phone:row.phone,emails:row.emails,firstContact:row.firstContact};
}

export async function updateLeadDetails(id:string,payload:LeadUpdatePayload):Promise<FullLead|null> {
  const parsed=parseLeadId(id); if(!parsed)return null; const existing=await fetchLeadById(id); if(!existing)return null; const schema=await fetchSourceSchema(parsed.sourceKey);
  const data=buildLeadUpdateRanges(schema,SOURCE_TABS[parsed.sourceKey].title,parsed.rowNumber,payload); if(!data.length)return existing;
  const sid=encodeURIComponent(spreadsheetId()); await googleJson(`https://sheets.googleapis.com/v4/spreadsheets/${sid}/values:batchUpdate`,{method:'POST',body:JSON.stringify({valueInputOption:'RAW',data})}); return fetchLeadById(id);
}

export async function updateLeadDisposition(id:string,disposition:LeadDisposition):Promise<FullLead|null> {
  const parsed=parseLeadId(id); if(!parsed)return null; const existing=await fetchLeadById(id); if(!existing)return null; const schema=await fetchSourceSchema(parsed.sourceKey);
  const data=[buildDispositionRange(schema,SOURCE_TABS[parsed.sourceKey].title,parsed.rowNumber,disposition)]; const sid=encodeURIComponent(spreadsheetId());
  await googleJson(`https://sheets.googleapis.com/v4/spreadsheets/${sid}/values:batchUpdate`,{method:'POST',body:JSON.stringify({valueInputOption:'RAW',data})}); return fetchLeadById(id);
}
