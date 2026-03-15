'use client';

import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

/**
 * Returns a promise that resolves with the current user once auth is initialized.
 */
export function waitForAuth(): Promise<User | null> {
  return new Promise((resolve) => {
    // Check if auth state is already determined
    if (auth.currentUser !== undefined) {
      resolve(auth.currentUser);
      return;
    }
    
    // Otherwise wait for the first auth state change event
    const unsub = onAuthStateChanged(auth, (user) => {
      unsub();
      resolve(user);
    });
  });
}