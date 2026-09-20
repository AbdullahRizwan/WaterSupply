import { db } from './firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { increment } from 'firebase/firestore';
import { withTimeout } from '../utils/async';

export async function addDelivery(accountId: string, quantity: number, onCredit = true, date?: Date) {
  await withTimeout(
    addDoc(collection(db, `accounts/${accountId}/deliveries`), {
      quantity,
      onCredit,
      date: date ?? new Date(),
    }),
    12000,
    'Delivery save timed out'
  );

  if (onCredit) {
    const ref = doc(db, 'accounts', accountId);
    await withTimeout(
      updateDoc(ref, {
        balanceBottles: increment(quantity),
      }),
      12000,
      'Balance update timed out'
    );
  }
}