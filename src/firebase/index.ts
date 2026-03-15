'use client';

// SPENDXP FIREBASE BARREL — single import source
// for all Firebase and utility exports.
// Import path for components and hooks: '@/firebase'
// Exports: app, auth, db, safeSetDoc, safeUpdateDoc,
// safeGetDoc, safeOnSnapshot, getRefreshedToken,
// rateLimiter, validateEmail, validateDisplayName,
// validateBirthYear, validateScore, validateXP,
// sanitiseString, checkLockout, recordFailedAttempt,
// clearAttempts, requiresParentalConsent, hasParentalConsent,
// captureFingerprint, validateFingerprint, hashGameState,
// setupDevToolsDetector
// DO NOT import from @/lib/* directly in components.

// IMPORT RULE:
// Components, hooks, pages → import from '@/firebase'
// Service files in src/lib/ → import from '@/lib/firebase'
// Never mix these two patterns.

export { 
  app, 
  auth, 
  db, 
  googleProvider, 
  emailProvider 
} from '@/lib/firebase';

import { app } from '@/lib/firebase';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

/**
 * Initializes secondary Firebase services like App Check.
 * This is called by the FirebaseClientProvider.
 */
export function initializeFirebase() {
  if (typeof window !== 'undefined') {
    if (process.env.NODE_ENV !== 'production') {
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }
    
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(
          process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
        ),
        isTokenAutoRefreshEnabled: true
      });
    } catch (err) {
      console.warn('[SpendXP] App Check initialization skipped or already running.');
    }
  }

  return {
    firebaseApp: app,
    auth: require('@/lib/firebase').auth,
    firestore: require('@/lib/firebase').db,
    db: require('@/lib/firebase').db
  };
}

// Re-export Provider and Hooks
export * from './provider';
export * from './client-provider';
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
