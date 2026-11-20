import assert from 'node:assert/strict';
import { buildAgentReferralSummary, mapAgentRows } from './agent-referral';

const headers = ['MLS #','Address','County','Current Price','Status','Listing Agent','Phone Number','Listing Office','Email','First Contact','Status 2'];
const rows = mapAgentRows(headers, [
  ['1','1 A St','Collin','$300,000','Closed','Pat Lee','555','Office One','PAT@example.com\nalt@example.com','2026-11-01','Partner – interested'],
  ['2','2 B St','Collin','$310,000','Closed','Pat Lee','555','Office One','pat@example.com','','Referred owner'],
  ['3','3 C St','Dallas','$200,000','Closed','Sam Roe','556','Office Two','','',''],
  ['4','4 D St','Dallas','$250,000','Closed','Ana Diaz','557','Office Three','ana@example.com','2026-11-02','Referral agreement signed'],
  ['5','5 E St','Harris','$150,000','Closed','Lee Wu','558','Office Four','lee@example.com','2026-11-02','Not interested'],
  ['','','','','','','','','','','']
]);
assert.equal(rows.length, 5);
const summary = buildAgentReferralSummary(rows);
assert.equal(summary.listingRows, 5);
assert.equal(summary.uniqueAgents, 4);
assert.equal(summary.withEmail, 3);
assert.equal(summary.contacted, 3);
assert.equal(summary.interested, 1);
assert.equal(summary.agreementsSigned, 1);
assert.equal(summary.referredOwners, 1);
assert.equal(summary.multiListingAgents, 1);
assert.deepEqual(summary.topCounties[0], { county: 'Dallas', count: 2 });
assert.ok(!JSON.stringify(summary).includes('example.com'));
assert.ok(!JSON.stringify(summary).includes('Pat Lee'));

// Missing optional columns must not throw.
const sparse = mapAgentRows(['Listing Agent'], [['Only Name']]);
assert.equal(buildAgentReferralSummary(sparse).uniqueAgents, 1);
// Drip columns written by the Make agent scenario.
const dripHeaders = [...headers, 'Drip Step', 'Next Send At', 'Last Sent At', 'Stopped', 'Skip Reason', 'Send To', 'Eligible'];
const dripRows = mapAgentRows(dripHeaders, [
  ['1','1 A St','Collin','','Closed','Pat Lee','','O1','pat@example.com','','','2','2026-12-01','2026-11-20','','In sequence','pat@example.com','Yes'],
  ['2','2 B St','Collin','','Closed','Ann Ray','','O2','ann@example.com','','Replied','1','','2026-11-20','Yes','Reply received 2026-11-24, drip stopped','ann@example.com','Yes'],
  ['3','3 C St','Dallas','','Closed','Bo Li','','O3','bo@example.com','','','4','','2026-12-10','Yes','Completed','bo@example.com','Yes'],
  ['4','4 D St','Dallas','','Closed','Cy Do','','O4','cy@bad.com','','','','','','Yes','Email failed check: cy@bad.com (Reoon: invalid)','cy@bad.com','Yes'],
  ['5','5 E St','Dallas','','Closed','Pat Lee','','O1','pat@example.com','','','','','','','','pat@example.com','Duplicate']
]);
const drip = buildAgentReferralSummary(dripRows).drip;
assert.deepEqual(drip, { eligible:4, emailed:3, inSequence:1, completed:1, replied:1, badEmail:1, emailsSent:7 });
assert.equal(buildAgentReferralSummary(dripRows).contacted, 3);
console.log('agent referral tests passed');
