import { addDoc, collection, deleteDoc, doc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import { withTimeout } from '../utils/async';

export async function addAccount(name: string, openingBalance = 0, createdAt?: Date) {
	const trimmedName = name.trim();

	if (!trimmedName) {
		throw new Error('Account name is required');
	}

	if (openingBalance < 0) {
		throw new Error('Opening balance cannot be negative');
	}

	const docRef = await withTimeout(
			addDoc(collection(db, 'accounts'), {
				name: trimmedName,
				balanceBottles: openingBalance,
				createdAt: createdAt ?? new Date(),
			}),
		12000,
		'Account save timed out'
	);

	return docRef.id;
}

async function deleteSubcollectionDocs(accountId: string, subcollection: 'deliveries' | 'payments') {
	const snapshot = await withTimeout(
		getDocs(collection(db, `accounts/${accountId}/${subcollection}`)),
		12000,
		`Loading ${subcollection} for delete timed out`
	);

	if (snapshot.empty) {
		return;
	}

	const chunkSize = 450;
	for (let i = 0; i < snapshot.docs.length; i += chunkSize) {
		const batch = writeBatch(db);
		const chunk = snapshot.docs.slice(i, i + chunkSize);

		chunk.forEach((docSnap) => batch.delete(docSnap.ref));

		await withTimeout(
			batch.commit(),
			12000,
			`Deleting ${subcollection} timed out`
		);
	}
}

export async function deleteAccount(accountId: string) {
	const trimmedId = accountId.trim();

	if (!trimmedId) {
		throw new Error('Account id is required');
	}

	await deleteSubcollectionDocs(trimmedId, 'deliveries');
	await deleteSubcollectionDocs(trimmedId, 'payments');

	await withTimeout(
		deleteDoc(doc(db, 'accounts', trimmedId)),
		12000,
		'Account delete timed out'
	);
}
