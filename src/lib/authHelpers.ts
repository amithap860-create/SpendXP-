/**
 * Auth helpers — real implementations using Firebase Auth.
 * getRefreshedToken() gets a live Firebase ID token for server-side API calls.
 */
import { auth } from '@/lib/firebase';

/** Returns a fresh Firebase ID token for the current user. Throws if not signed in. */
export const getRefreshedToken = async (): Promise<string> => {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');
  return currentUser.getIdToken(/* forceRefresh */ true);
};

/** Record a failed auth attempt (stub — extend if you add rate-limiting to Firestore). */
export const recordFailedAttempt = async (_email?: string): Promise<void> => {};

/** Clear failed auth attempts (stub). */
export const clearAttempts = async (_email?: string): Promise<void> => {};
