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
 * @fileOverview Wraps standard Firestore operations with error handling to prevent
 * internal assertion crashes when auth state is in transition.
 */

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
    handlePermissionsError(error, 'safeAddDoc');
    return null;
  }
}