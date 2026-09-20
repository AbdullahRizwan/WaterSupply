import { Account, Delivery, OutstandingAccount, Payment, RecentActivityItem } from '../types/models';

export function buildOutstandingLedger(deliveries: Delivery[], payments: Payment[]): Map<string, number> {
	const ledger = new Map<string, number>();

	deliveries.forEach((d) => {
		if (!d.onCredit) return;
		ledger.set(d.accountId, (ledger.get(d.accountId) ?? 0) + d.quantity);
	});

	payments.forEach((p) => {
		ledger.set(p.accountId, (ledger.get(p.accountId) ?? 0) - p.quantity);
	});

	return ledger;
}

export function getComputedBalance(accountId: string, ledger: Map<string, number>, fallback = 0): number {
	return Math.max(0, ledger.get(accountId) ?? fallback);
}

export function computeOutstandingAccounts(accounts: Account[], ledger: Map<string, number>): OutstandingAccount[] {
	return accounts
		.map((account) => ({
			...account,
			computedBalanceBottles: getComputedBalance(account.id, ledger, Number(account.balanceBottles || 0)),
		}))
		.filter((account) => account.computedBalanceBottles > 0);
}

export function getDayStart(date = new Date()): Date {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function computeTodayMetrics(deliveries: Delivery[], payments: Payment[], now = new Date()) {
	const dayStart = getDayStart(now).getTime();

	const todayCreditDeliveries = deliveries
		.filter((d) => d.date && d.onCredit && d.date.getTime() >= dayStart)
		.reduce((sum, d) => sum + d.quantity, 0);

	const todayCashDeliveries = deliveries
		.filter((d) => d.date && !d.onCredit && d.date.getTime() >= dayStart)
		.reduce((sum, d) => sum + d.quantity, 0);

	const todayPayments = payments
		.filter((p) => p.date && p.date.getTime() >= dayStart)
		.reduce((sum, p) => sum + p.quantity, 0);

	return {
		todayCreditDeliveries,
		todayCashDeliveries,
		todayPayments,
		netToday: todayCreditDeliveries - todayPayments,
	};
}

export function buildRecentActivity(deliveries: Delivery[], payments: Payment[], limit = 6): RecentActivityItem[] {
	const activity: RecentActivityItem[] = [
		...deliveries.map((d) => ({
			id: `d-${d.id}`,
			label: d.onCredit ? 'Delivery (Credit)' : 'Delivery (Cash)',
			qty: d.quantity,
			date: d.date,
			kind: d.onCredit ? 'delivery-credit' : 'delivery-cash',
		} as const)),
		...payments.map((p) => ({
			id: `p-${p.id}`,
			label: 'Payment',
			qty: p.quantity,
			date: p.date,
			kind: 'payment' as const,
		})),
	];

	return activity.sort((a, b) => (b.date?.getTime() ?? 0) - (a.date?.getTime() ?? 0)).slice(0, limit);
}
