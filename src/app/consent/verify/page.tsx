'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertCircle, CheckCircle2, Loader2, Clock } from 'lucide-react';
import Link from 'next/link';

interface PendingConsent {
  childName: string;
  childEmail: string;
  birthYear: number;
  parentEmail: string;
  expiresAt: string;
}

type PageState = 'loading' | 'ready' | 'approving' | 'approved' | 'already-approved' | 'expired' | 'invalid' | 'error';

function ConsentVerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [pageState, setPageState] = useState<PageState>('loading');
  const [pending, setPending] = useState<PendingConsent | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Fetch pending consent details ────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setPageState('invalid');
      return;
    }

    fetch(`/api/consent-verify?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          if (data.error.includes('already been approved')) {
            setPageState('already-approved');
          } else if (data.error.includes('expired')) {
            setPageState('expired');
          } else {
            setErrorMsg(data.error);
            setPageState('invalid');
          }
        } else {
          setPending(data);
          setPageState('ready');
        }
      })
      .catch(() => {
        setErrorMsg('Network error. Please check your connection and try again.');
        setPageState('error');
      });
  }, [token]);

  // ── Approve account ──────────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!token) return;
    setPageState('approving');

    try {
      const res = await fetch('/api/consent-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (data.ok || data.error?.includes('already')) {
        setPageState('approved');
      } else {
        setErrorMsg(data.error || 'Something went wrong. Please try again.');
        setPageState('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setPageState('error');
    }
  };

  // ── Age from birth year ──────────────────────────────────────────────────
  const age = pending ? new Date().getFullYear() - pending.birthYear : null;

  // ── Expiry format ────────────────────────────────────────────────────────
  const expiresFormatted = pending
    ? new Date(pending.expiresAt).toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-50 via-slate-50 to-white flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-4">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-black">
            <span className="text-slate-900">Spend</span>
            <span style={{ color: '#2E7D5A' }}>XP</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Financial literacy for young learners</p>
        </div>

        <Card className="border-none shadow-2xl overflow-hidden">

          {/* ── Loading ─────────────────────────────────────────────────── */}
          {pageState === 'loading' && (
            <CardContent className="p-12 text-center space-y-4">
              <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
              <p className="text-slate-500 font-bold">Loading approval request…</p>
            </CardContent>
          )}

          {/* ── Ready to approve ─────────────────────────────────────────── */}
          {(pageState === 'ready' || pageState === 'approving') && pending && (
            <>
              <div className="bg-primary p-8 text-white text-center">
                <ShieldCheck className="h-12 w-12 mx-auto mb-3" />
                <h2 className="text-2xl font-black">Parental Consent Request</h2>
                <p className="text-primary-foreground/80 text-sm mt-1">
                  Your child wants to join SpendXP
                </p>
              </div>
              <CardContent className="p-8 space-y-6">
                {/* Child info */}
                <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                  <h3 className="font-black text-slate-700 text-sm uppercase tracking-wider">Account request for</h3>
                  <div className="space-y-1">
                    <p className="text-xl font-black text-slate-900">{pending.childName}</p>
                    <p className="text-slate-500 text-sm">{pending.childEmail}</p>
                    {age && <p className="text-slate-500 text-sm">Age: {age} years old (born {pending.birthYear})</p>}
                  </div>
                </div>

                {/* What SpendXP collects */}
                <div className="space-y-3">
                  <h3 className="font-black text-slate-700 text-sm">What SpendXP stores about your child:</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {[
                      'Name and birth year (for age-appropriate content)',
                      'Game scores and earned XP',
                      'Learning progress and completed quests',
                      'Email address (for account access only)',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <ul className="space-y-2 text-sm text-slate-500 mt-3">
                    {[
                      'No ads are shown to child accounts',
                      'No personal data is sold to third parties',
                      'No location data is collected',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="text-green-600 font-black shrink-0">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Expiry note */}
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-4 py-3">
                  <Clock className="h-4 w-4 shrink-0" />
                  This link expires on {expiresFormatted}
                </div>

                {/* Legal notice */}
                <p className="text-xs text-slate-400 leading-relaxed">
                  By clicking "Approve Account," you confirm that you are the parent or legal guardian of{' '}
                  <strong>{pending.childName}</strong> and consent to SpendXP collecting and using the data
                  described above in accordance with our{' '}
                  <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>{' '}
                  and{' '}
                  <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>.
                </p>

                {/* CTA */}
                <Button
                  onClick={handleApprove}
                  className="w-full h-14 text-lg font-black"
                  disabled={pageState === 'approving'}
                  suppressHydrationWarning
                >
                  {pageState === 'approving' ? (
                    <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Creating account…</>
                  ) : (
                    '✓ Approve Account'
                  )}
                </Button>

                <p className="text-center text-xs text-slate-400">
                  Not your child's request?{' '}
                  <span className="font-bold">Simply ignore this email</span> — no account will be created.
                </p>
              </CardContent>
            </>
          )}

          {/* ── Approved ─────────────────────────────────────────────────── */}
          {pageState === 'approved' && (
            <CardContent className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Account Approved!</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {pending?.childName}'s account has been created. We've sent them an email letting them know
                  they can now sign in and start learning!
                </p>
              </div>
              <div className="bg-primary/10 rounded-xl p-4 text-sm text-primary font-bold">
                Your child can sign in at{' '}
                <Link href="/login" className="underline">spendxp.vercel.app/login</Link>
              </div>
            </CardContent>
          )}

          {/* ── Already approved ─────────────────────────────────────────── */}
          {pageState === 'already-approved' && (
            <CardContent className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Already Approved</h2>
                <p className="text-slate-600 text-sm">
                  This account has already been approved. Your child can sign in now.
                </p>
              </div>
              <Link href="/login">
                <Button variant="outline" className="w-full h-12 font-bold">Go to Sign In</Button>
              </Link>
            </CardContent>
          )}

          {/* ── Expired ──────────────────────────────────────────────────── */}
          {pageState === 'expired' && (
            <CardContent className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-10 w-10 text-amber-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Link Expired</h2>
                <p className="text-slate-600 text-sm leading-relaxed">
                  This approval link has expired (links are valid for 48 hours). Please ask your child
                  to sign up again at SpendXP to receive a new link.
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" className="w-full h-12 font-bold">Go to SpendXP</Button>
              </Link>
            </CardContent>
          )}

          {/* ── Invalid / Error ───────────────────────────────────────────── */}
          {(pageState === 'invalid' || pageState === 'error') && (
            <CardContent className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">
                  {pageState === 'invalid' ? 'Invalid Link' : 'Something Went Wrong'}
                </h2>
                <p className="text-slate-600 text-sm">
                  {errorMsg || 'This link is invalid. Please check the email for the correct link.'}
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" className="w-full h-12 font-bold">Go to SpendXP</Button>
              </Link>
            </CardContent>
          )}

        </Card>
      </div>
    </div>
  );
}

export default function ConsentVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <ConsentVerifyContent />
    </Suspense>
  );
}
