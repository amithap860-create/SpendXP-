'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { auth, safeUpdateDoc, db } from '@/firebase';
import { doc } from 'firebase/firestore';
import { AlertCircle, X, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmailVerificationBanner() {
  const { user, emailVerified, resendVerificationEmail } = useAuthContext();
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [isVerified, setIsVerified] = useState(emailVerified);

  useEffect(() => {
    setIsVerified(emailVerified);
  }, [emailVerified]);

  useEffect(() => {
    if (isVerified || dismissed || !user || user.providerData[0]?.providerId === 'google.com') return;

    // Poll for emailVerified status every 10 seconds
    const interval = setInterval(async () => {
      if (!auth.currentUser) return;
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setIsVerified(true);
        clearInterval(interval);
        // Update Firestore to stay in sync
        await safeUpdateDoc(
          doc(db, 'users', auth.currentUser.uid),
          { emailVerified: true }
        );
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [isVerified, dismissed, user]);

  if (!user || isVerified || dismissed || user.providerData[0]?.providerId === 'google.com') {
    return null;
  }

  const handleResend = async () => {
    setLoading(true);
    const res = await resendVerificationEmail();
    if (res.success) setSent(true);
    setLoading(false);
  };

  return (
    <div className="sticky top-0 z-[70] bg-primary text-white px-4 py-3 shadow-lg flex items-center justify-between border-b border-white/10 animate-in slide-in-from-top duration-500">
      <div className="flex items-center gap-3 max-w-4xl mx-auto flex-1">
        <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
          {sent ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Mail className="h-4 w-4" />}
        </div>
        <p className="text-sm font-bold leading-tight">
          {sent ? (
            "Verification link resent! Check your inbox."
          ) : (
            <>
              Please verify your email to unlock all features. 
              <button 
                onClick={handleResend}
                disabled={loading}
                className="ml-2 underline hover:text-accent-foreground transition-colors inline-flex items-center gap-1"
              >
                {loading && <RefreshCw className="h-3 w-3 animate-spin" />}
                Resend link
              </button>
            </>
          )}
        </p>
      </div>
      <button 
        onClick={() => setDismissed(true)}
        className="p-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}