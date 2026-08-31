import assert from 'node:assert/strict';
import { buildEmailTrackingMetrics, mapEmailActivityRows } from './email-activity';

const rows = mapEmailActivityRows([
  ['trk-1','Expired','22','1001','100 Main St','one@example.com','A','1','Subject 1','z1','2026-08-31T10:00:00-04:00','deliverable','Yes','2026-08-31T10:05:00-04:00','2026-08-31T10:08:00-04:00','2','pixel',''],
  ['trk-2','Expired','22','1001','100 Main St','two@example.com','A','1','Subject 1','z2','2026-08-31T10:00:01-04:00','deliverable','','','','0','pixel',''],
  ['trk-3','Withdrawn','31','2001','200 Main St','three@example.com','B','2','Subject 2','z3','2026-08-31T11:00:00-04:00','deliverable','Yes','2026-08-31T11:02:00-04:00','2026-08-31T11:02:00-04:00','1','pixel','']
]);

assert.equal(rows.length, 3);
assert.equal(rows[0].trackingId, 'trk-1');
assert.equal(rows[0].opened, true);
assert.equal(rows[0].openCount, 2);
assert.equal(rows[1].opened, false);

const metrics = buildEmailTrackingMetrics(rows);
assert.equal(metrics.emailsSent, 3);
assert.equal(metrics.trackedOpens, 2);
assert.equal(metrics.notOpened, 1);
assert.equal(metrics.trackedOpenRate, 2 / 3);
assert.equal(metrics.byVariant.A.emailsSent, 2);
assert.equal(metrics.byVariant.A.trackedOpens, 1);
assert.equal(metrics.byVariant.B.trackedOpenRate, 1);
console.log('email activity tests passed');
