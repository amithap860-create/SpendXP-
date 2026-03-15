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

import { app, auth, db } from '@/lib/firebase';

/**
 * Initializes secondary Firebase services like App Check.
 * This is called by the FirebaseClientProvider.
 * Made fault-tolerant for mobile browsers/ad-blockers.
 * 
 * Returns core services synchronously to avoid Promise-related 
 * hydration issues in Next.js 15.
 */
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV !== 'production') {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    // Initialize App Check asynchronously without blocking the return of core services
    import('firebase/app-check').then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
          ),
          isTokenAutoRefreshEnabled: true
        });
      } catch (err) {
        console.warn('[SpendXP] App Check initialization skipped or blocked by browser:', err);
      }
    }).catch(err => {
      console.warn('[SpendXP] App Check module load failed:', err);
    });
  }

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
  FirebaseClientProvider,
  useFirebase,
  useFirebaseApp,
  useFirestore,
  useAuth,
  useUser,
  FirebaseContext,
  useMemoFirebase
} from './provider';

export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';

// Project Utility Re-exports
export * from '@/lib/firestoreSafe';
export * from '@/lib/authHelpers';
export * from '@/lib/rateLimiter';
export * from '@/lib/validation';
export * from '@/lib/accountLockout';
export * from '@/lib/privacyGuard';
export * from '@/lib/sessionGuard';
export * from '@/lib/antiTamper';
