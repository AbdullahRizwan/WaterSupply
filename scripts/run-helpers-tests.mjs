import { execSync } from 'node:child_process';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const projectRoot = process.cwd();
const outDir = path.join(projectRoot, '.tmp-test-build');

execSync(
  `npx tsc --ignoreConfig --pretty false --module commonjs --target es2020 --outDir ${outDir} ${path.join(projectRoot, 'utils/helpers.ts')} ${path.join(projectRoot, 'types/models.ts')}`,
  { stdio: 'pipe' }
);

const helpersPath = pathToFileURL(path.join(outDir, 'utils/helpers.js')).href;
const helpers = await import(helpersPath);

const {
  buildOutstandingLedger,
  getComputedBalance,
  computeOutstandingAccounts,
  computeTodayMetrics,
} = helpers;

const deliveries = [
  { id: 'd1', accountId: 'a1', quantity: 10, onCredit: true, date: new Date('2026-04-12T10:00:00Z') },
  { id: 'd2', accountId: 'a1', quantity: 5, onCredit: false, date: new Date('2026-04-12T11:00:00Z') },
  { id: 'd3', accountId: 'a2', quantity: 7, onCredit: true, date: new Date('2026-04-12T12:00:00Z') },
];

const payments = [
  { id: 'p1', accountId: 'a1', quantity: 3, date: new Date('2026-04-12T13:00:00Z') },
  { id: 'p2', accountId: 'a2', quantity: 2, date: new Date('2026-04-12T14:00:00Z') },
];

const ledger = buildOutstandingLedger(deliveries, payments);
assert.equal(getComputedBalance('a1', ledger, 0), 7);
assert.equal(getComputedBalance('a2', ledger, 0), 5);

const accounts = [
  { id: 'a1', name: 'One', balanceBottles: 0 },
  { id: 'a2', name: 'Two', balanceBottles: 0 },
];

const outstandingAccounts = computeOutstandingAccounts(accounts, ledger);
assert.equal(outstandingAccounts.length, 2);

const metrics = computeTodayMetrics(deliveries, payments, new Date('2026-04-12T18:00:00Z'));
assert.equal(metrics.todayCreditDeliveries, 17);
assert.equal(metrics.todayCashDeliveries, 5);
assert.equal(metrics.todayPayments, 5);
assert.equal(metrics.netToday, 12);

console.log('All helper tests passed.');
