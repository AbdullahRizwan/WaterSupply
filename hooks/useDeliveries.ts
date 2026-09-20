import { useEffect, useMemo, useState } from 'react';
import { collection, collectionGroup, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Delivery } from '../types/models';

function toDate(value: any): Date | null {
	if (!value) return null;
	if (value instanceof Date) return value;
	if (typeof value?.toDate === 'function') return value.toDate();
	return null;
}

export function useDeliveries(accountId?: string) {
	const [deliveries, setDeliveries] = useState<Delivery[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const targetCollection = useMemo(() => {
		if (accountId) {
			return collection(db, `accounts/${accountId}/deliveries`);
		}
		return collectionGroup(db, 'deliveries');
	}, [accountId]);

	useEffect(() => {
		setLoading(true);
		const unsub = onSnapshot(
			targetCollection,
			(snap) => {
				const data: Delivery[] = snap.docs
					.map((doc) => {
						const raw = doc.data() as any;
						const pathParts = doc.ref.path.split('/');
						const parentAccountId = pathParts.length >= 2 ? pathParts[1] : '';

						return {
							id: doc.id,
							accountId: accountId ?? parentAccountId,
							quantity: Number(raw.quantity ?? 0),
							onCredit: Boolean(raw.onCredit ?? true),
							date: toDate(raw.date),
						};
					})
					.sort((a, b) => {
						const aTime = a.date ? a.date.getTime() : 0;
						const bTime = b.date ? b.date.getTime() : 0;
						return bTime - aTime;
					});

				setDeliveries(data);
				setLoading(false);
				setError(null);
			},
			(snapshotError) => {
				setError(snapshotError.message || 'Unable to load deliveries');
				setLoading(false);
			}
		);

		return unsub;
	}, [targetCollection, accountId]);

	return { deliveries, loading, error };
}
