'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    setErrorMsg('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setStatus('sent');
    } catch (err: any) {
      setStatus('error');
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('No account found with that email address.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    }
  };

  return (
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

          {status === 'sent' ? (
            /* ── Success state ── */
            <div className="text-center">
              <div className="w-14 h-14 bg-[#E8F5EE] rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-7 h-7 text-[#2E7D5A]" />
              </div>
              <h1 className="text-xl font-black text-slate-900 mb-2">Check your inbox</h1>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                We sent a reset link to <span className="font-bold text-slate-700">{email}</span>. Click the link to set a new password. Check your spam folder if it doesn't arrive.
              </p>
              <Link
                href="/login"
                className="block w-full text-center py-3 rounded-xl bg-[#1A1F2E] text-white text-sm font-black uppercase tracking-widest hover:bg-[#252B3B] transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div className="mb-7">
                <h1 className="text-xl font-black text-slate-900 mb-1">Forgot your password?</h1>
                <p className="text-sm text-slate-500">Enter your email and we'll send you a reset link.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E7D5A] focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-100">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <p className="text-xs font-medium text-red-700">{errorMsg}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !email.trim()}
                  className="w-full h-12 rounded-xl bg-[#2E7D5A] text-white text-sm font-black uppercase tracking-widest hover:bg-[#3A9068] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === 'loading' ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
