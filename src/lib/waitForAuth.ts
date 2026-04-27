import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Waits for Firebase Auth to determine the current user's state and returns
 * the authenticated user object, or null if no user is signed in.
 *
 * Uses auth.currentUser as a fast path when the SDK has already resolved
 * the state (e.g. mid-session). Falls back to a one-shot onAuthStateChanged
 * listener for the initial page load case.
 *
 * Replaces the old stub that always returned uid: '1'.
 */
export const waitForAuth = (): Promise<{
  id: string;
  uid: string;
  email: string;
  displayName: string;
} | null> => {
  return new Promise((resolve) => {
    // Fast path: Firebase Auth has already determined the user state.
    // This is the common case after the initial auth check has settled.
    if (auth.currentUser !== undefined) {
      const u = auth.currentUser;
      if (u) {
        resolve({
          id: u.uid,
          uid: u.uid,
          email: u.email ?? '',
          displayName: u.displayName ?? 'Strategist',
        });
      } else {
        resolve(null);
      }
      return;
    }

    // Slow path: Auth state has not resolved yet (first paint).
    // Subscribe once and immediately unsubscribe after the first event.
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      unsub();
      if (firebaseUser) {
        resolve({
          id: firebaseUser.uid,
          uid: firebaseUser.uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName ?? 'Strategist',
        });
      } else {
        resolve(null);
      }
    });
  });
};
