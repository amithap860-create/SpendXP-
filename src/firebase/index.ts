'use client';

// SPENDXP FIREBASE BARREL EXPORT
// Import all Firebase utilities and helpers from '@/firebase'
// Do not import from @/lib/firestoreSafe, @/lib/authHelpers,
// @/lib/rateLimiter, or @/lib/validation directly in components.
// All those modules re-export from here so there is one
// consistent import path across the entire app.

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

export function initializeFirebase() {
  if (!getApps().length) {
    let firebaseApp;
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Firebase initialization failed', e);
      firebaseApp = initializeApp(firebaseConfig);
    }

    // Initialize App Check
    if (typeof window !== 'undefined') {
      if (process.env.NODE_ENV !== 'production') {
        (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
      }
      
      try {
        initializeAppCheck(firebaseApp, {
          provider: new ReCaptchaV3Provider(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'
          ),
          isTokenAutoRefreshEnabled: true
        });
      } catch (err) {
        console.warn('[SpendXP] App Check initialization failed - might be already running or missing keys.');
      }
    }

    return getSdks(firebaseApp);
  }

  return getSdks(getApp());
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();

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
