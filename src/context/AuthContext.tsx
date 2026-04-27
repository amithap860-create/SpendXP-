'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// ─── Types ────────────────────────────────────────────────────────────────────

interface User {
  id: string;
  uid: string;
  email: string;
  age: number;
  displayName?: string;
  providerData: { providerId: string }[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, age: number, password: string) => Promise<boolean>;
  logout: () => void;
  signOut: () => void;
  signInWithGoogle: () => Promise<{ success: boolean }>;
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean }>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName: string,
    isParent: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  sendPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>;
  resendVerificationEmail: () => Promise<{ success: boolean; cooldown?: number }>;
  error: string | null;
  currentAgeGroup: 'junior' | 'teen' | 'senior';
  emailVerified: boolean;
  currencyCode?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Maps a Firebase Auth user to the local User shape.
 * The uid always comes from Firebase Auth — never a hardcoded stub.
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    uid: firebaseUser.uid,
    email: firebaseUser.email ?? '',
    age: 0, // Age is stored in Firestore, not in Firebase Auth. Loaded by AgeGroupProvider.
    displayName: firebaseUser.displayName ?? undefined,
    providerData: firebaseUser.providerData.map((p) => ({
      providerId: p.providerId,
    })),
  };
}

/**
 * Returns a human-readable message for common Firebase Auth error codes.
 */
function friendlyAuthError(code: string): string {
  switch (code) {
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please sign in.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

// Minimum seconds between verification email sends to prevent spam/duplicates
const VERIFY_EMAIL_COOLDOWN_SECONDS = 60;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [currencyCode, setCurrencyCode] = useState<string>('INR');
  // Tracks when the last verification email was sent; prevents duplicates within a session
  const lastVerifyEmailSentAt = React.useRef<number>(0);

  // ─── Firebase Auth state listener ──────────────────────────────────────────
  // This is the SINGLE source of truth for the user's identity.
  // The uid always comes from Firebase Auth — it is a real 28-character uid,
  // never the hardcoded stub '1' that the old localStorage approach used.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (firebaseUser) => {
        if (firebaseUser) {
          setUser(mapFirebaseUser(firebaseUser));
          setEmailVerified(firebaseUser.emailVerified);
          // Load currency preference from Firestore — non-fatal if it fails
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data?.currencyCode) setCurrencyCode(data.currencyCode);
            }
          } catch (err) {
            console.warn('[SpendXP] Could not load currencyCode from Firestore:', err);
          }
        } else {
          setUser(null);
          setEmailVerified(false);
          setCurrencyCode('INR');
        }
        setLoading(false);
      },
      (authError) => {
        console.error('[SpendXP] onAuthStateChanged error:', authError);
        setUser(null);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // ─── Auth functions ─────────────────────────────────────────────────────────

  /**
   * Sign in with email and password using Firebase Auth.
   * Returns true on success, false on failure (error is set in state).
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      console.error('[SpendXP] Login error:', err);
      setError(friendlyAuthError(err.code));
      return false;
    }
  };

  /**
   * Create a new account with email and password using Firebase Auth.
   * Returns true on success, false on failure.
   */
  const signup = async (
    email: string,
    _age: number,
    password: string
  ): Promise<boolean> => {
    try {
      setError(null);
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err: any) {
      console.error('[SpendXP] Signup error:', err);
      setError(friendlyAuthError(err.code));
      return false;
    }
  };

  /**
   * Sign out of Firebase Auth and clear local user state.
   */
  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setEmailVerified(false);
    } catch (err: any) {
      console.error('[SpendXP] Logout error:', err);
    }
  };

  /**
   * Sign in with Google using a popup.
   */
  const signInWithGoogle = async (): Promise<{ success: boolean }> => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (err: any) {
      console.error('[SpendXP] Google sign-in error:', err);
      setError(friendlyAuthError(err.code));
      return { success: false };
    }
  };

  /**
   * Sign in with email and password.
   * Wrapper around login() with the { success } return shape the login page expects.
   */
  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ success: boolean }> => {
    const success = await login(email, password);
    return { success };
  };

  /**
   * Create a new account with email, password, display name, and parent flag.
   * Sets the display name on the Firebase Auth profile after account creation.
   * Sends an email verification link.
   */
  const signUpWithEmail = async (
    email: string,
    password: string,
    displayName: string,
    _isParent: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setError(null);
      const credential = await createUserWithEmailAndPassword(auth, email, password);

      // Attach display name to the Firebase Auth profile
      if (displayName.trim()) {
        await updateProfile(credential.user, {
          displayName: displayName.trim(),
        });
        // Refresh local user state to include the display name
        setUser(mapFirebaseUser(credential.user));
      }

      // Send email verification — non-fatal if it fails
      try {
        await sendEmailVerification(credential.user);
        lastVerifyEmailSentAt.current = Date.now();
      } catch (verifyErr) {
        console.warn('[SpendXP] Could not send verification email:', verifyErr);
      }

      return { success: true };
    } catch (err: any) {
      console.error('[SpendXP] Sign-up error:', err);
      const message = friendlyAuthError(err.code);
      setError(message);
      return { success: false, error: message };
    }
  };

  /**
   * Send a password reset email via Firebase Auth.
   */
  const sendPasswordReset = async (
    email: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: 'Password reset email sent. Check your inbox.',
      };
    } catch (err: any) {
      console.error('[SpendXP] Password reset error:', err);
      const message = friendlyAuthError(err.code);
      setError(message);
      return { success: false, message };
    }
  };

  /**
   * Re-send the email verification link to the currently signed-in user.
   * Enforces a 60-second cooldown so duplicate emails are not sent in a session.
   */
  const resendVerificationEmail = async (): Promise<{ success: boolean; cooldown?: number }> => {
    try {
      if (!auth.currentUser) {
        console.warn('[SpendXP] resendVerificationEmail: no current user');
        return { success: false };
      }
      const secondsSinceLast = (Date.now() - lastVerifyEmailSentAt.current) / 1000;
      if (secondsSinceLast < VERIFY_EMAIL_COOLDOWN_SECONDS) {
        const remaining = Math.ceil(VERIFY_EMAIL_COOLDOWN_SECONDS - secondsSinceLast);
        console.warn(`[SpendXP] Verification email cooldown: ${remaining}s remaining`);
        return { success: false, cooldown: remaining };
      }
      await sendEmailVerification(auth.currentUser);
      lastVerifyEmailSentAt.current = Date.now();
      return { success: true };
    } catch (err: any) {
      console.error('[SpendXP] Resend verification error:', err);
      return { success: false };
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        signOut: logout,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        sendPasswordReset,
        resendVerificationEmail,
        error,
        // currentAgeGroup defaults to 'teen' here.
        // The real age group is computed from Firestore birthYear by AgeGroupProvider
        // and exposed via useAgeAdapt() — do not rely on this field for game logic.
        currentAgeGroup: 'teen',
        emailVerified,
        currencyCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useAuthContext() {
  return useAuth();
}
