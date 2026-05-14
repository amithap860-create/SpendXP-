import 'server-only';
import { initializeApp, cert, getApp, getApps, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

/**
 * Singleton Firebase Admin SDK initialiser for server-side operations.
 *
 * Usage:
 *   const { auth, db } = await getFirebaseAdmin();
 *
 * Legacy named exports (adminAuth / adminDb) are kept for backward compatibility
 * with routes that import them directly, but prefer getFirebaseAdmin() in new code.
 */

if (typeof window !== 'undefined') {
  throw new Error(
    '[SpendXP] firebaseAdmin imported in browser. Move this code to an API route.'
  );
}

export interface FirebaseAdminServices {
  app: App;
  auth: Auth;
  db: Firestore;
}

function createAdminApp(): App {
  const existing = getApps().find((a) => a.name === 'admin');
  if (existing) return existing;

  const raw = process.env.FIREBASE_ADMIN_SDK_KEY;
  if (!raw) {
    throw new Error('[SpendXP] FIREBASE_ADMIN_SDK_KEY env var is not set');
  }

  let serviceAccount: Record<string, unknown>;
  try {
    serviceAccount = JSON.parse(raw);
  } catch {
    throw new Error('[SpendXP] FIREBASE_ADMIN_SDK_KEY is not valid JSON');
  }

  if (!serviceAccount.project_id) {
    throw new Error('[SpendXP] FIREBASE_ADMIN_SDK_KEY is missing project_id');
  }

  return initializeApp({ credential: cert(serviceAccount as any) }, 'admin');
}

/**
 * Returns initialised Firebase Admin services.
 * Throws a descriptive error if the env var is missing or malformed —
 * so callers get a 503 rather than a cryptic crash.
 */
export function getFirebaseAdmin(): FirebaseAdminServices {
  const app = createAdminApp();
  return {
    app,
    auth: getAuth(app),
    db: getFirestore(app),
  };
}

// ── Legacy named exports (kept for routes that import them directly) ──────────
// These are initialised lazily so missing env vars don't crash at module load time.
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;

function lazyInit() {
  if (_adminAuth && _adminDb) return;
  try {
    const { auth, db } = getFirebaseAdmin();
    _adminAuth = auth;
    _adminDb = db;
  } catch (e) {
    console.error('[SpendXP] Firebase Admin SDK not initialised:', e);
  }
}

export const adminAuth: Auth = new Proxy({} as Auth, {
  get(_t, prop) {
    lazyInit();
    return (_adminAuth as any)?.[prop];
  },
});

export const adminDb: Firestore = new Proxy({} as Firestore, {
  get(_t, prop) {
    lazyInit();
    return (_adminDb as any)?.[prop];
  },
});
