import 'server-only';
import * as admin from 'firebase-admin';
import { initializeApp, cert, getApp, getApps, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

/**
 * Singleton Firebase Admin SDK initialiser for server-side operations.
 */
if (typeof window !== 'undefined') {
  throw new Error(
    '[SpendXP] firebaseAdmin imported in browser. Move this code to an API route.'
  );
}

let adminApp: App;
let adminAuthInstance: any = null;
let adminDbInstance: any = null;

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');

if (!getApps().length) {
  if (serviceAccount.project_id) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    }, 'admin');
    adminAuthInstance = getAuth(adminApp);
    adminDbInstance = getFirestore(adminApp);
  } else {
    console.error('[SpendXP] Invalid FIREBASE_ADMIN_SDK_KEY. Admin SDK not initialised.');
  }
} else {
  adminApp = getApp('admin');
  adminAuthInstance = getAuth(adminApp);
  adminDbInstance = getFirestore(adminApp);
}

export const adminAuth = adminAuthInstance;
export const adminDb = adminDbInstance;