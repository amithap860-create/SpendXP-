
import { getAuth } from 'firebase/auth';

/**
 * Force-refreshes the current user's ID token.
 */
export async function getRefreshedToken(): Promise<string | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;
  
  try {
    return await user.getIdToken(true);
  } catch (error) {
    console.error('[SpendXP] Token rotation failed:', error);
    return null;
  }
}
