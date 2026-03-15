import { doc, getDoc, setDoc, updateDoc, serverTimestamp, Timestamp, Firestore } from 'firebase/firestore';

/**
 * @fileOverview Brute force protection logic.
 */

export async function checkLockout(db: Firestore, email: string): Promise<{ locked: boolean; minutesLeft?: number }> {
  const ref = doc(db, 'authAttempts', email.toLowerCase());
  const snap = await getDoc(ref);

  if (!snap.exists()) return { locked: false };

  const data = snap.data();
  if (data.lockedUntil && (data.lockedUntil as Timestamp).toMillis() > Date.now()) {
    const diff = (data.lockedUntil as Timestamp).toMillis() - Date.now();
    return { locked: true, minutesLeft: Math.ceil(diff / 60000) };
  }

  return { locked: false };
}

export async function recordFailedAttempt(db: Firestore, email: string) {
  const ref = doc(db, 'authAttempts', email.toLowerCase());
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      attempts: 1,
      lastAttemptAt: serverTimestamp(),
      lockedUntil: null
    });
    return;
  }

  const data = snap.data();
  const newAttempts = (data.attempts || 0) + 1;

  if (newAttempts >= 5) {
    const lockoutTime = new Date(Date.now() + 30 * 60000); // 30 minutes
    await updateDoc(ref, {
      attempts: newAttempts,
      lastAttemptAt: serverTimestamp(),
      lockedUntil: Timestamp.fromDate(lockoutTime)
    });
  } else {
    await updateDoc(ref, {
      attempts: newAttempts,
      lastAttemptAt: serverTimestamp()
    });
  }
}

export async function clearAttempts(db: Firestore, email: string) {
  const ref = doc(db, 'authAttempts', email.toLowerCase());
  await setDoc(ref, { attempts: 0, lockedUntil: null, lastAttemptAt: serverTimestamp() }, { merge: true });
}
