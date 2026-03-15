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
import { useAuth as useFirebaseAuth, useFirestore, useFirebaseApp } from '@/firebase';
import { googleProvider } from '@/firebase';
import { useRouter } from 'next/navigation';
import { validateEmail, validateDisplayName } from '@/lib/validation';
import { safeSetDoc } from '@/lib/firestoreSafe';
import { checkLockout, recordFailedAttempt, clearAttempts } from '@/lib/accountLockout';
import { rateLimiter } from '@/lib/rateLimiter';

/**
 * @fileOverview Enhanced hook for Firebase Authentication including Email/Password flows.
 */

export function useAuth() {
  const auth = useFirebaseAuth();
  const db = useFirestore();
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
  }, [auth]);

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
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
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
      
      const actionCodeSettings: ActionCodeSettings = {
        url: `${window.location.origin}/verify-email`,
        handleCodeInApp: true,
      };
      await sendEmailVerification(res.user, actionCodeSettings);

      const profileRef = doc(db, 'users', res.user.uid);
      await safeSetDoc(profileRef, {
        id: res.user.uid,
        displayName,
        email: email.toLowerCase(),
        emailVerified: false,
        createdAt: serverTimestamp(),
        provider: 'email',
        birthYear: null,
        ageGroup: null,
        parentLinked: false,
        onboardingComplete: false,
        consentGiven: false,
        isParent,
        isAdmin: false,
        balance: 10000,
        currency: 'INR',
        xp: 0,
        level: 1,
        interests: []
      }, { merge: true });

      return { success: true };
    } catch (err: any) {
      let msg = 'Something went wrong. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'An account with this email already exists.';
      if (err.code === 'auth/weak-password') msg = 'Password must be at least 8 characters.';
      if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email address.';
      setError(msg);
      return { success: false, error: msg };
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    
    const status = await checkLockout(db, email);
    if (status.locked) {
      return { success: false, error: `Account locked. Try again in ${status.minutesLeft} minutes.` };
    }

    try {
      await signInWithEmailAndPassword(auth, email, pass);
      await clearAttempts(db, email);
      return { success: true };
    } catch (err: any) {
      await recordFailedAttempt(db, email);
      let msg = 'Incorrect email or password.';
      if (err.code === 'auth/too-many-requests') msg = 'Too many attempts. Please wait before trying again.';
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
      // Stealth success for security
      return { success: true, message: 'If an account exists for this email, a reset link has been sent.' };
    }
  };

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) return { success: false, error: 'No user signed in.' };
    
    const allowed = rateLimiter.check({
      key: 'email:verification:resend',
      maxCalls: 1,
      windowMs: 60000
    });

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
    router.push('/');
  };

  return { 
    user, 
    loading, 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    sendPasswordReset,
    resendVerificationEmail,
    signOut, 
    error 
  };
}
