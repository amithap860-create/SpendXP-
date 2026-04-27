'use client';

import {
  onSnapshot,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  DocumentReference,
  CollectionReference,
  Query,
  FirestoreError,
  Unsubscribe,
  SetOptions,
  UpdateData
} from 'firebase/firestore';
import { handlePermissionsError } from './rulesValidator';

/**
 * @fileOverview Wraps standard Firestore operations with error handling to
 * prevent crashes when auth state is in transition or security rules deny
 * access. Also handles INTERNAL ASSERTION FAILED (ca9/b815) errors that
 * occur when onSnapshot listeners are denied by Firestore security rules
 * while using persistentLocalCache — suppressed gracefully here so the
 * error boundary can manage recovery at the component tree level.
 */

/**
 * Returns true when the error is a Firestore internal assertion crash.
 * These errors (ca9, b815) are caused by the persistent cache entering an
 * unrecoverable state after a security rule denial on an active listener.
 */
function isAssertionError(error: { message?: string } | null | undefined): boolean {
  if (!error?.message) return false;
  return (
    error.message.includes('INTERNAL ASSERTION') ||
    error.message.includes('ca9') ||
    error.message.includes('b815')
  );
}

export function safeOnSnapshot(
  query: Query,
  onNext: (snapshot: any) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  return onSnapshot(query, onNext, (error: FirestoreError) => {
    if (error.code === 'permission-denied') {
      handlePermissionsError(error, 'safeOnSnapshot');
      return;
    }

    if (isAssertionError(error)) {
      console.warn(
        '[SpendXP] Firestore assertion error in safeOnSnapshot.',
        'Listener detached. Will not retry.',
        error.message
      );
      return;
    }

    if (onError) onError(error);
  });
}

export function safeOnSnapshotDoc(
  ref: DocumentReference,
  onNext: (snapshot: any) => void,
  onError?: (error: FirestoreError) => void
): Unsubscribe {
  return onSnapshot(ref, onNext, (error: FirestoreError) => {
    if (error.code === 'permission-denied') {
      handlePermissionsError(error, 'safeOnSnapshotDoc');
      return;
    }

    if (isAssertionError(error)) {
      console.warn(
        '[SpendXP] Firestore assertion error in safeOnSnapshotDoc.',
        'Listener detached. Will not retry.',
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
    if (isAssertionError(error)) {
      console.warn(
        '[SpendXP] Firestore assertion error in safeGetDoc. Returning null.',
        error.message
      );
      return null;
    }
    handlePermissionsError(error, 'safeGetDoc');
    return null;
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
    if (isAssertionError(error)) {
      console.warn(
        '[SpendXP] Firestore assertion error in safeSetDoc. Returning false.',
        error.message
      );
      return false;
    }
    handlePermissionsError(error, 'safeSetDoc');
    return false;
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
    if (isAssertionError(error)) {
      console.warn(
        '[SpendXP] Firestore assertion error in safeUpdateDoc. Returning false.',
        error.message
      );
      return false;
    }
    handlePermissionsError(error, 'safeUpdateDoc');
    return false;
  }
}

export async function safeAddDoc<T extends object>(
  ref: CollectionReference,
  data: T
): Promise<DocumentReference | null> {
  try {
    return await addDoc(ref, data);
  } catch (error: any) {
    if (isAssertionError(error)) {
      console.warn(
        '[SpendXP] Firestore assertion error in safeAddDoc. Returning null.',
        error.message
      );
      return null;
    }
    handlePermissionsError(error, 'safeAddDoc');
    return null;
  }
}
