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
  getRedirectResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import { googleProvider } from '@/firebase';
import { useRouter } from 'next/navigation';

/**
 * @fileOverview Custom hook for Firebase Authentication and Profile management.
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

    // Check for redirect result on mobile
    getRedirectResult(auth).catch((err) => {
      setError(err.message);
    });

    return () => unsubscribe();
  }, [auth]);

  const ensureUserProfile = async (firebaseUser: User) => {
    const profileRef = doc(db, 'users', firebaseUser.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      await setDoc(profileRef, {
        id: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        email: firebaseUser.email,
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        birthYear: null,
        ageGroup: null,
        parentLinked: false,
        consentGiven: false,
        onboardingComplete: false,
        balance: 10000, // Starting INR 10,000
        currency: 'INR',
        xp: 0,
        level: 1,
        interests: []
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

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, isParent: boolean = false) => {
    setError(null);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const profileRef = doc(db, 'users', res.user.uid);
      await setDoc(profileRef, {
        id: res.user.uid,
        email,
        isParent,
        createdAt: serverTimestamp(),
        onboardingComplete: false,
        balance: 10000,
        currency: 'INR',
        xp: 0,
        level: 1
      }, { merge: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    router.push('/');
  };

  return { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, error };
}
