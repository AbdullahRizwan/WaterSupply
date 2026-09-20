import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const envConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};

const firebaseConfig = {
  apiKey: envConfig.apiKey,
  authDomain: envConfig.authDomain,
  projectId: envConfig.projectId,
};

if (!envConfig.apiKey || !envConfig.authDomain || !envConfig.projectId) {
  throw new Error(
    'Missing Firebase env vars. Set EXPO_PUBLIC_FIREBASE_API_KEY, EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN, and EXPO_PUBLIC_FIREBASE_PROJECT_ID in .env and restart Expo.'
  );
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);