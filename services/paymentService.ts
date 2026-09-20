import { db } from './firebase';
import { doc, updateDoc, collection, addDoc, increment } from 'firebase/firestore';
import { withTimeout } from '../utils/async';

export async function addPayment(accountId: string, quantity: number, date?: Date) {
  await withTimeout(
    addDoc(collection(db, `accounts/${accountId}/payments`), {
      quantity,
      date: date ?? new Date(),
    }),
    12000,
    'Payment save timed out'
  );

  const ref = doc(db, 'accounts', accountId);
  await withTimeout(
    updateDoc(ref, {
      balanceBottles: increment(-quantity),
    }),
    12000,
    'Balance update timed out'
  );
}