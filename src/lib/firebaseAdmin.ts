import * as admin from 'firebase-admin';
import { initializeApp, cert, getApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Singleton Firebase Admin SDK initialiser for server-side operations.
 */
if (typeof window !== 'undefined') {
  throw new Error('firebaseAdmin must only be imported in server-side code');
}

let adminApp: App;

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');

if (!getApps().length) {
  if (serviceAccount.project_id) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    }, 'admin');
  } else {
    console.error('[SpendXP] Invalid FIREBASE_ADMIN_SDK_KEY. Admin SDK not initialised.');
  }
} else {
  adminApp = getApp('admin');
}

export const adminAuth = getAuth(adminApp!);
export const adminDb = getFirestore(adminApp!);
