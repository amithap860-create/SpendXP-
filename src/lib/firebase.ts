import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase singleton instances with safety guards
// Singleton guard prevents double-initialization on mobile (Fix 1a)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  // Module-level throws white-screen on mobile; log instead (Fix 1c)
  console.error('[SpendXP] Core Firebase initialization error:', error);
}

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const emailProvider = new EmailAuthProvider();

/**
 * Checks if the core Firebase services are initialized and ready for use (Fix 1d).
 */
export function isFirebaseReady(): boolean {
  return !!(app && auth && db);
}

export { app, auth, db, googleProvider, emailProvider };
