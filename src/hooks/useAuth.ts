
'use client';

import { useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User,
  getRedirectResult,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  ActionCodeSettings
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, safeSetDoc, validateEmail, validateDisplayName, recordFailedAttempt, checkLockout, clearAttempts, rateLimiter } from '@/firebase';
import { useRouter } from 'next/navigation';

/**
 * @fileOverview Enhanced hook for Firebase Authentication including Email/Password flows.
 */

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await ensureUserProfile(firebaseUser);
      }
      setLoading(false);
    });

    getRedirectResult(auth).catch((err) => {
      setError(err.message);
    });

    return () => unsubscribe();
  }, []);

  const ensureUserProfile = async (firebaseUser: User) => {
    const profileRef = doc(db, 'users', firebaseUser.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      await safeSetDoc(profileRef, {
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Strategist',
        email: firebaseUser.email?.toLowerCase(),
        emailVerified: firebaseUser.emailVerified,
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        provider: firebaseUser.providerData[0]?.providerId || 'unknown',
        birthYear: null,
        ageGroup: null,
        parentLinked: false,
        consentGiven: false,
        onboardingComplete: false,
        balance: 10000,
        currency: 'INR',
        xp: 0,
        level: 1,
        interests: [],
        isParent: false,
        isAdmin: false
      }, { merge: true });
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const isMobile = window.innerWidth < 768;
      let res;
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        res = await signInWithPopup(auth, googleProvider);
        if (res.user) {
          const userRef = doc(db, 'users', res.user.uid);
          await safeSetDoc(userRef, { provider: 'google.com' }, { merge: true });
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName: string, isParent: boolean = false) => {
    setError(null);
    const emailVal = validateEmail(email);
    if (!emailVal.valid) return { success: false, error: emailVal.error };
    const nameVal = validateDisplayName(displayName);
    if (!nameVal.valid) return { success: false, error: nameVal.error };
    if (pass.length < 8 || !/\d/.test(pass) || !/[a-zA-Z]/.test(pass)) {
      return { success: false, error: 'Password must be at least 8 characters and contain a number and a letter.' };
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(res.user, { displayName });
      
      const userRef = doc(db, 'users', res.user.uid);
      await safeSetDoc(userRef, { provider: 'password' }, { merge: true });

      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(res.user, actionCodeSettings);
      return { success: true, userId: res.user.uid };
    } catch (err: any) {
      let msg = 'Something went wrong. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    const status = await checkLockout(db, email);
    if (status.locked) return { success: false, error: `Account locked. Try again in ${status.minutesLeft} minutes.` };

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      await clearAttempts(db, email);
      return { success: true };
    } catch (err: any) {
      await recordFailedAttempt(db, email);
      let msg = 'Incorrect email or password.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const sendPasswordReset = async (email: string) => {
    const emailVal = validateEmail(email);
    if (!emailVal.valid) return { success: false, error: emailVal.error };
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'If an account exists for this email, a reset link has been sent.' };
    } catch (err) {
      return { success: true, message: 'If an account exists for this email, a reset link has been sent.' };
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) return { success: false, error: 'No user signed in.' };
    const allowed = rateLimiter.check({ key: 'email:verification:resend', maxCalls: 1, windowMs: 60000 });
    if (!allowed) return { success: false, error: 'Please wait a minute before resending.' };
    try {
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    router.push('/login');
  };

  const linkedProviders: string[] =
    auth.currentUser?.providerData.map(p => p.providerId) ?? [];

  return { 
    user, 
    loading, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    sendPasswordReset,
    resendVerificationEmail,
    signOut, 
    error,
    linkedProviders
  };
}
