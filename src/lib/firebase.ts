import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, EmailAuthProvider, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// Initialize Firebase singleton instances with safety guards
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  
  // Use persistentLocalCache for offline support in Firebase 12+
  // This is critical for mobile connectivity resilience in India
  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalAutoDetectLongPolling: true,
    });
  } catch (cacheError) {
    // Fallback to default in-memory cache if IndexedDB is blocked (e.g., incognito mode)
    console.warn('[SpendXP] Firestore persistent cache failed to initialize, using memory cache:', cacheError);
    db = getFirestore(app);
  }
} catch (error) {
  console.error('[SpendXP] Core Firebase initialization error:', error);
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  void import('firebase/app-check')
    .then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
      try {
        const firebaseApp = getApps().length ? getApp() : undefined;
        if (!firebaseApp) {
          return;
        }
        initializeAppCheck(firebaseApp, {
          provider: new ReCaptchaV3Provider(
            process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? ''
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

// Auth Providers
const googleProvider = new GoogleAuthProvider();
const emailProvider = new EmailAuthProvider();

/**
 * Checks if the core Firebase services are initialized and ready for use.
 */
export function isFirebaseReady(): boolean {
  return !!(app && auth && db);
}

export { app, auth, db, googleProvider, emailProvider };
