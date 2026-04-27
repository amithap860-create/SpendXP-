import { doc, getDoc, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Privacy controls for minor users (DPDP/COPPA compliance).
 */

/**
 * Checks if a user is under the age of majority (18 in India).
 */
export function requiresParentalConsent(birthYear: number): boolean {
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  return age < 18;
}

/**
 * Checks if a minor user has verifiable parental consent.
 */
export async function hasParentalConsent(db: Firestore, uid: string | null | undefined): Promise<boolean> {
  if (!uid || typeof uid !== 'string' || uid.trim() === '') {
    return false;
  }
  try {
    const profileRef = doc(db, 'users', uid);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) return false;
    return !!snap.data().consentGiven;
  } catch (error) {
    console.error('[SpendXP Privacy] Consent check failed:', error);
    return false;
  }
}
