'use client';

import { 
  onSnapshot, 
  getDoc, 
  setDoc, 
  updateDoc, 
  DocumentReference, 
  Query, 
  FirestoreError, 
  Unsubscribe, 
  SetOptions, 
  UpdateData 
} from 'firebase/firestore';

/**
 * @fileOverview Wraps standard Firestore operations with error handling to prevent
 * internal assertion crashes when auth state is in transition.
 */

export function safeOnSnapshot(
  query: DocumentReference | Query,
  onNext: (snapshot: any) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  // Swallows permission-denied errors to prevent cascading crashes.
  return onSnapshot(query, onNext, (error) => {
    if (error.code === 'permission-denied') {
      console.warn(
        '[SpendXP] Firestore permission denied on snapshot — listener detached.',
        error.message
      );
      return;
    }
    if (onError) onError(error);
  });
}

export async function safeGetDoc<T>(
  ref: DocumentReference<T>
): Promise<T | null> {
  try {
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data() as T) : null;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.warn('[SpendXP] safeGetDoc permission denied:', ref.path);
      return null;
    }
    throw error;
  }
}

export async function safeSetDoc<T extends object>(
  ref: DocumentReference,
  data: T,
  options?: SetOptions
): Promise<boolean> {
  try {
    await setDoc(ref, data, options ?? {});
    return true;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.error('[SpendXP] safeSetDoc permission denied:', ref.path);
      return false;
    }
    throw error;
  }
}

export async function safeUpdateDoc(
  ref: DocumentReference,
  data: UpdateData<any>
): Promise<boolean> {
  try {
    await updateDoc(ref, data);
    return true;
  } catch (error: any) {
    if (error?.code === 'permission-denied') {
      console.error('[SpendXP] safeUpdateDoc permission denied:', ref.path);
      return false;
    }
    throw error;
  }
}
