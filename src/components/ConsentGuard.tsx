'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuthContext } from '@/context/AuthContext';

/**
 * Keeps an under-13 account out of the app until a parent approves it
 * (2026-10-12). Onboarding flags such accounts with `consentRequired: true`;
 * the server-side approval API (/api/consent-verify) sets `consentGiven: true`.
 *
 * - Accounts with no `consentRequired` flag (every existing user, every
 *   13+ user, and anyone approved through the email+parent flow) are never
 *   affected, and the "not required" answer is cached so this costs one
 *   Firestore read per sign-in, not one per page.
 * - Fails OPEN on read errors, so a network blip can't lock out adults.
 *   (Onboarding itself fails closed for children.)
 */
const EXEMPT_PREFIXES = [
  '/consent', '/login', '/signup', '/privacy', '/terms', '/support',
  '/forgot-password', '/reset-password', '/verify-email', '/onboarding',
];

export function ConsentGuard() {
  const { user } = useAuthContext();
  const pathname = usePathname();
  const router = useRouter();
  const clearedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    if (clearedFor.current === user.uid) return;
    if (pathname === '/' || EXEMPT_PREFIXES.some((p) => pathname?.startsWith(p))) return;

    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const d = snap.data();
        if (cancelled) return;
        if (d?.consentRequired && !d?.consentGiven) {
          router.replace('/consent');
        } else {
          clearedFor.current = user.uid;
        }
      } catch {
        // fail open
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid, pathname, router]);

  return null;
}
