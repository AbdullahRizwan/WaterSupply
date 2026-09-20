import { useEffect, useMemo, useState } from 'react';
import { collection, collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Payment } from '../types/models';

function toDate(value: any): Date | null {
	if (!value) return null;
	if (value instanceof Date) return value;
	if (typeof value?.toDate === 'function') return value.toDate();
	return null;
}

export function usePayments(accountId?: string) {
	const [payments, setPayments] = useState<Payment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const targetCollection = useMemo(() => {
		if (accountId) {
			return collection(db, `accounts/${accountId}/payments`);
		}
		return collectionGroup(db, 'payments');
	}, [accountId]);

	useEffect(() => {
		setLoading(true);
		const unsub = onSnapshot(
			targetCollection,
			(snap) => {
				const data: Payment[] = snap.docs
					.map((doc) => {
						const raw = doc.data() as any;
						const pathParts = doc.ref.path.split('/');
						const parentAccountId = pathParts.length >= 2 ? pathParts[1] : '';

						return {
							id: doc.id,
							accountId: accountId ?? parentAccountId,
							quantity: Number(raw.quantity ?? 0),
							date: toDate(raw.date),
						};
					})
					.sort((a, b) => {
						const aTime = a.date ? a.date.getTime() : 0;
						const bTime = b.date ? b.date.getTime() : 0;
						return bTime - aTime;
					});

				setPayments(data);
				setLoading(false);
				setError(null);
			},
			(snapshotError) => {
				setError(snapshotError.message || 'Unable to load payments');
				setLoading(false);
			}
		);

		return unsub;
	}, [targetCollection, accountId]);

	return { payments, loading, error };
}
