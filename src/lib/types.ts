export type SourceKey = 'expired' | 'withdrawn' | 'active';
export type MissingField = 'owner' | 'email' | 'phone' | 'address';
/** Outreach tracks from the Marketing & Sales action plan (T7 agent referral lives in AgentReferralSummary). */
export type Track = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6';
export interface TrackSummary { track:Track; label:string; ownerEmailAllowed:boolean; gate:string|null; total:number; withEmail:number; contacted:number; knownReplies:number; positiveReplies:number; }
export interface AgentReferralSummary { listingRows:number; uniqueAgents:number; withEmail:number; contacted:number; interested:number; agreementsSigned:number; referredOwners:number; unsubscribed:number; multiListingAgents:number; topCounties:Array<{county:string;count:number}>; }

export interface ProspectRow {
  sourceKey: SourceKey; sourceLabel: string; rowNumber: number; mls: string; address: string; city: string; state: string; zipcode: string; county: string; currentPrice: string; listingStatus: string; ownerRaw: string; firstName: string; phone: string; emails: string[]; firstContact: string; status2: string; dripStep: number; nextSendAt: Date | null; lastSentAt: Date | null; stoppedRaw: string; variant: string; disposition: string; malformedDateCount: number;
}
export interface EmailActivityRow { rowNumber:number; trackingId:string; source:string; sourceRow:number; mls:string; propertyAddress:string; recipientEmail:string; variant:string; dripStep:number; subject:string; zohoMessageId:string; sentAt:Date|null; validationState:string; opened:boolean; firstOpenedAt:Date|null; lastOpenedAt:Date|null; openCount:number; trackingType:string; notes:string; senderEmail:string; }
export interface EmailTrackingMetrics { emailsSent:number; trackedOpens:number; notOpened:number; trackedOpenRate:number; byVariant:Record<'A'|'B',{emailsSent:number;trackedOpens:number;trackedOpenRate:number}>; }
export interface PerformanceBreakdown { emailsSent:number; trackedOpens:number; trackedOpenRate:number; contactedProspects:number; knownReplies:number; knownReplyRate:number; }
export interface SenderPerformance extends PerformanceBreakdown { sender:string; }
export interface DayOfWeekPerformance extends PerformanceBreakdown { day:string; dayIndex:number; }
export interface RedactedLead {
  id:string; firstName:string; address:string; city:string; state:string; county:string; listingStatus:string; sourceKey:SourceKey; sourceLabel:string; dripStep:number; lastSentAt:string|null; nextSendAt:string|null; stopped:boolean; outcome:string; variant:string; disposition:string; badLead:boolean; dueNow:boolean; completed:boolean; missingDetails:boolean; missingFields:MissingField[]; hasEmail?:boolean; track:Track; ownerEmailAllowed:boolean;
}
export interface FullLead extends RedactedLead { mls:string; zipcode:string; currentPrice:string; ownerRaw:string; phone:string; emails:string[]; firstContact:string; }
export interface DashboardData {
  fetchedAt:string; timezone:string;
  headline:{ positiveReplies:number; callsBooked:number; agreementsSigned:number; positiveReplyRate:number; totalProspects:number; withEmail:number; activeSequences:number; dueNow:number; sentToday:number; sentThisWeek:number; contacted:number; completed:number; stopped:number; badLeads:number; knownReplies:number; emailsSent:number; trackedOpens:number; trackedOpenRate:number; notOpened:number; knownReplyRate:number; };
  sequence:Array<{step:number;label:string;count:number}>;
  sources:Array<{sourceKey:SourceKey;label:string;total:number;withEmail:number;active:number;due:number;contacted:number;stopped:number}>;
  variants:Array<{variant:string;prospects:number;contacted:number;knownReplies:number;knownReplyRate:number;emailsSent:number;trackedOpens:number;trackedOpenRate:number}>;
  senderPerformance:SenderPerformance[]; dayOfWeekPerformance:DayOfWeekPerformance[]; abReadout:string; upcoming:RedactedLead[]; recent:RedactedLead[]; leads:RedactedLead[];
  dataQuality:{noEmail:number;malformedDates:number;companyOnlyOwners:number};
  tracks:TrackSummary[]; replyReasons:Array<{reason:string;count:number}>;
  compliance:{gatedContacted:number;gatedDueNow:number};
  agents:AgentReferralSummary|null; warnings:string[];
}
