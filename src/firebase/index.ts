'use client';

// SPENDXP FIREBASE BARREL — single import source
// for all Firebase and utility exports.
// Import path for components and hooks: '@/firebase'

export { 
  app, 
  auth, 
  db, 
  googleProvider, 
  emailProvider,
  isFirebaseReady
} from '@/lib/firebase';

export {
  applyActionCode,
  sendPasswordResetEmail,
  confirmPasswordReset
} from 'firebase/auth';

import { app, auth, db } from '@/lib/firebase';
import { 
  applyActionCode, 
  sendPasswordResetEmail,
  confirmPasswordReset 
} from 'firebase/auth';

/**
 * Initializes secondary Firebase services like App Check.
 * This is called by the FirebaseClientProvider.
 * Made fault-tolerant for mobile browsers/ad-blockers.
 * 
 * Returns core services synchronously to avoid Promise-related 
 * hydration issues in Next.js 15.
 */
export function initializeFirebase() {
  // App Check is initialized only in production from @/lib/firebase (see firebase.ts).
  // Development / localhost must not enable App Check or debug tokens — they cause 403s outside Firebase Studio.

  // Return instances directly from lib/firebase which are initialized in module scope
  return {
    firebaseApp: app,
    auth: auth,
    firestore: db,
    db: db
  };
}

// Re-export Provider and Hooks from source of truth
export {
  FirebaseProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useUser,
  FirebaseContext,
  useMemoFirebase
} from './provider';

export { FirebaseClientProvider } from './client-provider';

export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// Project Utility Re-exports
export * from '@/lib/firestoreSafe';
export { safeOnSnapshot, safeOnSnapshotDoc } from '@/lib/firestoreSafe';
export * from '@/lib/authHelpers';
export * from '@/lib/rateLimiter';
export * from '@/lib/validation';
export * from '@/lib/accountLockout';
export * from '@/lib/privacyGuard';
export * from '@/lib/sessionGuard';
export * from '@/lib/antiTamper';
