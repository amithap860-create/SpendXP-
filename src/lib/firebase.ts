import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, Auth } from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  initializeFirestore,
  memoryLocalCache,
  terminate
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// ─── Core Firebase app and auth ────────────────────────────────────────────────
let app: FirebaseApp;
let auth: Auth;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
} catch (error) {
  console.error('[SpendXP] Core Firebase initialization error:', error);
}

// ─── Firestore with recoverable instance management ───────────────────────────
//
// memoryLocalCache is used instead of persistentLocalCache because the
// persistent cache triggers INTERNAL ASSERTION FAILED (ca9/b815) when an
// onSnapshot listener is denied by Firestore security rules. The memory cache
// is stable and does not enter an unrecoverable internal state on rule errors.
//
// Persistent cache can be re-enabled once the Firestore rules are fully
// stable and all onSnapshot listeners are confirmed to have read permission.

let _db: Firestore | null = null;

export function getDb(): Firestore {
  if (!_db) {
    try {
      _db = initializeFirestore(app, {
        localCache: memoryLocalCache(),
        experimentalAutoDetectLongPolling: true,
      });
    } catch (e) {
      console.warn(
        '[SpendXP] Firestore memoryLocalCache init failed, using default:',
        e
      );
      _db = getFirestore(app);
    }
  }
  return _db;
}

/**
 * Terminates the current Firestore instance and creates a fresh one.
 * Called by FirestoreErrorBoundary when an INTERNAL ASSERTION error is caught.
 * After calling this, any components holding stale Firestore references will
 * be recycled via the error boundary's window.location.reload() fallback.
 */
export async function resetFirestore(): Promise<Firestore> {
  if (_db) {
    try {
      await terminate(_db);
    } catch (e) {
      console.warn('[SpendXP] Firestore terminate:', e);
    }
    _db = null;
  }
  return getDb();
}

// Initialise immediately. Exported as a constant for backward compatibility —
// all existing `import { db } from '@/firebase'` statements continue to work
// without any changes across the codebase.
const db: Firestore = getDb();

// ─── App Check (production only) ──────────────────────────────────────────────
// Disabled in development to prevent 403 errors on localhost.
// App Check — only initialize if a reCAPTCHA site key is provided.
// Without a key, skip App Check entirely to avoid blocking Firebase auth.
if (
  typeof window !== 'undefined' &&
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
) {
  void import('firebase/app-check')
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      try {
        const firebaseApp = getApps().length ? getApp() : undefined;
        if (!firebaseApp) {
          return;
        }
        initializeAppCheck(firebaseApp, {
          provider: new ReCaptchaV3Provider(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!
          ),
        });
      } catch (e) {
        console.warn('[SpendXP] App Check skipped:', e);
      }
    })
    .catch((e) => {
      console.warn('[SpendXP] App Check skipped:', e);
    });
}

// ─── Auth providers ───────────────────────────────────────────────────────────
const googleProvider = new GoogleAuthProvider();
const emailProvider = new EmailAuthProvider();

/**
 * Returns true when core Firebase services are initialised and ready.
 */
export function isFirebaseReady(): boolean {
  return !!(app && auth && _db);
}

export { app, auth, db, googleProvider, emailProvider };
