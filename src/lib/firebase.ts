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
