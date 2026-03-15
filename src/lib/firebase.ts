import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase singleton instances
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const emailProvider = new EmailAuthProvider();

export { app, auth, db, googleProvider, emailProvider };
