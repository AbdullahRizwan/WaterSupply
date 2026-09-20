import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Account } from '../types/models';

function toDate(value: any): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  return null;
}

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'accounts'),
      (snap) => {
        const data: Account[] = snap.docs
          .map((doc) => {
            const raw = doc.data() as any;

            return {
              id: doc.id,
              name: String(raw.name ?? ''),
              balanceBottles: Number(raw.balanceBottles ?? 0),
              createdAt: toDate(raw.createdAt ?? raw.date),
            };
          })
          .sort((a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0));

        setAccounts(data);
        setLoading(false);
        setError(null);
      },
      (snapshotError) => {
        setError(snapshotError.message || 'Unable to load accounts');
        setLoading(false);
      }
    );

    return unsub;
  }, []);

  const getAccountById = (id: string) =>
    accounts.find(a => a.id === id);

  return { accounts, getAccountById, loading, error };
}