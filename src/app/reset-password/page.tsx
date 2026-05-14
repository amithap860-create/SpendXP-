'use client';

/**
 * /reset-password
 *
 * Handles Firebase Auth action codes sent via email.
 * Firebase includes ?mode=resetPassword&oobCode=XXX in the link.
 *
 * To wire this page as the custom action URL:
 *   Firebase Console → Authentication → Templates → Password Reset
 *   → Customize action URL → set to: https://spendxp.vercel.app/reset-password
 *
 * Modes handled:
 *   - resetPassword  — new-password form + confirmPasswordReset()
 *   - verifyEmail    — applyActionCode() then redirect
 *   - recoverEmail   — applyActionCode() then inform user
 */

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmPasswordReset, applyActionCode, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import Link from 'next/link';

// ── Password strength check (same rules as signup) ─────────────────────────
function validatePassword(pw: string): string | null {
  if (pw.length < 8)          return 'At least 8 characters required';
  if (!/[A-Z]/.test(pw))      return 'Must include an uppercase letter';
  if (!/[a-z]/.test(pw))      return 'Must include a lowercase letter';
  if (!/\d/.test(pw))         return 'Must include a number';
  return null;
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const oobCode = searchParams.get('oobCode') ?? '';
  const mode    = searchParams.get('mode') ?? '';

  const [status, setStatus] = useState<
    'validating' | 'ready' | 'submitting' | 'success' | 'error'
  >('validating');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [message,  setMessage]  = useState('');

  // ── Validate the oobCode on mount ─────────────────────────────────────────
  useEffect(() => {
    if (!oobCode || !mode) {
      setError('This link is invalid or has already been used. Request a new one below.');
      setStatus('error');
      return;
    }

    if (mode === 'resetPassword') {
      verifyPasswordResetCode(auth, oobCode)
        .then((resolvedEmail) => {
          setEmail(resolvedEmail);
          setStatus('ready');
        })
        .catch(() => {
          setError('This password reset link has expired or already been used. Please request a new one.');
          setStatus('error');
        });
    } else if (mode === 'verifyEmail') {
      applyActionCode(auth, oobCode)
        .then(() => {
          setMessage('Your email has been verified! You can now sign in.');
          setStatus('success');
          setTimeout(() => router.push('/login'), 3000);
        })
        .catch(() => {
          setError('Email verification failed. The link may have expired. Please request a new verification email.');
          setStatus('error');
        });
    } else if (mode === 'recoverEmail') {
      applyActionCode(auth, oobCode)
        .then(() => {
          setMessage('Your email address has been restored. Check your inbox to reset your password if needed.');
          setStatus('success');
        })
        .catch(() => {
          setError('Email recovery failed. Please contact support.');
          setStatus('error');
        });
    } else {
      setError('Unknown action. Please request a new link.');
      setStatus('error');
    }
  }, [oobCode, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle password reset submission ──────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const pwError = validatePassword(password);
    if (pwError) { setError(pwError); return; }
    if (password !== confirm) { setError('Passwords do not not match.'); return; }

    setStatus('submitting');
    try {
      await confirmPasswordReset(auth, oobCode, password);
      setStatus('success');
      setMessage('Password updated! Signing you in…');
      setTimeout(() => router.push('/login'), 2500);
    } catch (err: any) {
      const msg = err.code === 'auth/expired-action-code'
        ? 'This link has expired. Please request a new password reset.'
        : err.code === 'auth/invalid-action-code'
        ? 'This link has already been used or is invalid.'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak. Please choose a stronger one.'
        : 'Something went wrong. Please try again.';
      setError(msg);
      setStatus('ready');
    }
  };

  // ── Shared wrapper ────────────────────────────────────────────────────────
  const Shell = ({ children }: { children: React.ReactNode }) => (
    <div className="min-h-screen bg-[#F2F7F4] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-[#1A1F2E] rounded-xl flex items-center justify-center shadow-md">
            <span className="text-[16px] leading-none select-none" style={{ color: '#4EA07A' }}>⚖</span>
          </div>
          <span className="font-black text-2xl tracking-tighter text-slate-900">Spend<span style={{ color: '#2E7D5A' }}>XP</span></span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          {children}
        </div>
      </div>
    </div>
  );

  // ── Validating ────────────────────────────────────────────────────────────
  if (status === 'validating') {
    return (
      <Shell>
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto animate-pulse">
            <Lock className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Verifying your link…</p>
        </div>
      </Shell>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <Shell>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#E8F5EE] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7 text-[#2E7D5A]" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Done!</h1>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
          <Link href="/login" className="block w-full text-center py-3 rounded-xl bg-[#1A1F2E] text-white text-sm font-black uppercase tracking-widest hover:bg-[#252B3B] transition-colors mt-2">
            Go to Login
          </Link>
        </div>
      </Shell>
    );
  }

  // ── Error / expired ───────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <Shell>
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-black text-slate-900">Link Invalid</h1>
          <p className="text-sm text-slate-500 leading-relaxed">{error}</p>
          <Link href="/forgot-password" className="block w-full text-center py-3 rounded-xl bg-[#1A1F2E] text-white text-sm font-black uppercase tracking-widest hover:bg-[#252B3B] transition-colors mt-2">
            Request New Link
          </Link>
        </div>
      </Shell>
    );
  }

  // ── Ready — show the new-password form ────────────────────────────────────
  return (
    <Shell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">New Password</h1>
          {email && (
            <p className="text-xs text-slate-400">for <span className="font-bold text-slate-600">{email}</span></p>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm rounded-xl p-3">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="pw" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              New Password
            </Label>
            <div className="relative">
              <Input
                id="pw"
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-11 pr-10"
                required
                autoComplete="new-password"
                suppressHydrationWarning
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-400">Min 8 chars · uppercase · lowercase · number</p>
          </div>

          <div className="space-y-1">
            <Label htmlFor="confirm" className="text-xs font-bold uppercase tracking-widest text-slate-500">
              Confirm Password
            </Label>
            <Input
              id="confirm"
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="h-11"
              required
              autoComplete="new-password"
              suppressHydrationWarning
            />
          </div>

          <Button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full h-12 font-black uppercase tracking-widest"
          >
            {status === 'submitting' ? 'Saving…' : 'Set New Password'}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Remembered it?{' '}
          <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
        </p>
      </div>
    </Shell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F2F7F4] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
