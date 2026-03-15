import * as admin from 'firebase-admin';

/**
 * Singleton Firebase Admin SDK initialiser for server-side operations.
 */
if (typeof window !== 'undefined') {
  throw new Error('firebaseAdmin must only be imported in server-side code');
}

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');

if (!admin.apps.length && process.env.FIREBASE_ADMIN_SDK_KEY) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
