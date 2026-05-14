'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { User, Mail, Lock, ShieldCheck, AlertCircle, Calendar, ChevronDown, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, serverTimestamp, writeBatch, arrayUnion } from 'firebase/firestore';
import { db } from '@/firebase';
import { auth } from '@/lib/firebase';

// ── Age helpers ──────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = CURRENT_YEAR - 100;
const MAX_YEAR = CURRENT_YEAR - 4; // must be at least 4 years old

function calcAge(birthYear: number): number {
  return CURRENT_YEAR - birthYear;
}

// ── Step types ───────────────────────────────────────────────────────────────
type Step = 'age-gate' | 'signup-form' | 'parent-consent' | 'consent-sent';

// ── Process a pendingParentInvites code after account creation ────────────────
async function processInviteCode(
  inviteCode: string,
  newUserUid: string,
  newUserEmail: string
): Promise<boolean> {
  try {
    const q = query(
      collection(db, 'pendingParentInvites'),
      where('inviteCode', '==', inviteCode)
    );
    const snap = await getDocs(q);
    const inviteDoc = snap.docs[0];

    if (!inviteDoc) return false;

    const inviteData = inviteDoc.data();

    // Support both ISO string and Firestore Timestamp expiresAt
    const expiresAt =
      typeof inviteData.expiresAt === 'string'
        ? new Date(inviteData.expiresAt)
        : inviteData.expiresAt?.toDate?.() ?? new Date(0);

    if (expiresAt < new Date()) return false;

    const batch = writeBatch(db);

    const linkRef = doc(db, 'linkRequests', `${inviteData.childUid}_${newUserUid}`);
    batch.set(linkRef, {
      parentUid: newUserUid,
      childUid: inviteData.childUid,
      parentEmail: newUserEmail.toLowerCase(),
      childEmail: inviteData.childEmail || '',
      status: 'accepted',
      createdAt: serverTimestamp(),
    });

    batch.update(doc(db, 'users', inviteData.childUid), {
      parentLinked: true,
      parentUid: newUserUid,
      parentEmail: newUserEmail.toLowerCase(),
      pendingParentEmail: null,
      parentLinkedAt: new Date().toISOString(),
    });

    batch.update(doc(db, 'users', newUserUid), {
      linkedChildren: arrayUnion(inviteData.childUid),
      isParent: true,
      setupComplete: true,
    });

    batch.update(inviteDoc.ref, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedByUid: newUserUid,
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.error('[processInviteCode] Error:', err);
    return false;
  }
}

// ── Main component ───────────────────────────────────────────────────────────
function SignupContent() {
  const { signUpWithEmail, signInWithGoogle, error: authError } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Step state
  const [step, setStep] = useState<Step>('age-gate');

  // Age gate
  const [birthYear, setBirthYear] = useState('');
  const [ageError, setAgeError] = useState<string | null>(null);

  // Signup form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isParent, setIsParent] = useState(false);

  // Under-13 parent consent
  const [parentEmail, setParentEmail] = useState('');
  const [consentError, setConsentError] = useState<string | null>(null);

  // Shared
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [redirectAfter, setRedirectAfter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('inviteCode');
    const redirect = searchParams.get('redirect');
    if (code) {
      setInviteCode(code.toUpperCase());
      setIsParent(true); // invite codes are parent-linking flows
    }
    if (redirect) {
      setRedirectAfter(redirect);
    }
  }, [searchParams]);

  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  }, [password]);

  // ── Age gate submit ────────────────────────────────────────────────────────
  const handleAgeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAgeError(null);
    const year = parseInt(birthYear, 10);
    if (!birthYear || isNaN(year) || year < MIN_YEAR || year > MAX_YEAR) {
      setAgeError('Please enter a valid birth year.');
      return;
    }
    setStep('signup-form');
  };

  // ── Google signup ──────────────────────────────────────────────────────────
  const handleGoogleSignUp = async () => {
    setLoading(true);
    const res = await signInWithGoogle();
    if (res.success) {
      // If there's a pending child invite code, link the accounts now
      if (inviteCode) {
        try {
          const currentUser = auth.currentUser;
          if (currentUser) {
            const newUid = currentUser.uid;
            const newEmail = currentUser.email || '';
            await processInviteCode(inviteCode, newUid, newEmail);
          }
        } catch (err) {
          console.error('[Google signup] invite processing error:', err);
        }
        router.replace('/parent');
      } else if (redirectAfter) {
        router.replace(redirectAfter);
      } else {
        router.replace('/onboarding');
      }
    }
    setLoading(false);
  };

  // ── Normal signup (13+) ────────────────────────────────────────────────────
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const age = calcAge(parseInt(birthYear, 10));

    // Under-13: don't create account yet — go to parent consent step
    if (age < 13) {
      if (!displayName.trim() || !email.trim() || !password) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }
      setStep('parent-consent');
      setLoading(false);
      return;
    }

    // 13+ — normal flow
    const res = await signUpWithEmail(email, password, displayName, isParent);

    if (res.success) {
      const newUid = (res as any).userId as string | undefined;
      const newEmail = email.trim().toLowerCase();

      // If there's an invite code, process account linking before redirecting
      if (inviteCode && newUid) {
        try {
          await processInviteCode(inviteCode, newUid, newEmail);
        } catch (err) {
          console.error('[Signup] invite processing error:', err);
        }
        router.push('/parent');
        return;
      }

      // If there's a redirect param (e.g. from join?parentCode=xxx), go there
      if (redirectAfter) {
        router.push(redirectAfter);
        return;
      }

      // Normal redirect
      router.push(isParent ? '/parent/setup' : `/onboarding?birthYear=${parseInt(birthYear, 10)}`);
      return;
    }

    setError(res.error || authError || 'Something went wrong.');
    setLoading(false);
  };

  // ── Send parental consent request (under-13) ───────────────────────────────
  const handleSendConsentRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setConsentError(null);

    if (!parentEmail.trim()) {
      setConsentError("Please enter your parent's email address.");
      return;
    }
    if (parentEmail.toLowerCase() === email.toLowerCase()) {
      setConsentError("Parent email must be different from your own email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/consent-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName.trim(),
          email: email.trim().toLowerCase(),
          password,
          birthYear: parseInt(birthYear, 10),
          parentEmail: parentEmail.trim().toLowerCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setConsentError(data.error || 'Something went wrong. Please try again.');
      } else {
        setStep('consent-sent');
      }
    } catch {
      setConsentError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const age = birthYear ? calcAge(parseInt(birthYear, 10)) : null;
  const isUnder13 = age !== null && age < 13;

  // ── Renders ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-none">

        {/* ── Step 1: Age gate ─────────────────────────────────────────────── */}
        {step === 'age-gate' && (
          <>
            <CardHeader className="text-center pb-2">
              <h1 className="text-4xl font-black mb-2">
                <span className="text-slate-900">Spend</span>
                <span style={{ color: '#2E7D5A' }}>XP</span>
              </h1>
              <CardDescription className="text-base">First, tell us what year you were born.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <form onSubmit={handleAgeSubmit} className="space-y-4">
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder={`e.g. ${CURRENT_YEAR - 14}`}
                    className="pl-10 h-12 text-lg"
                    value={birthYear}
                    min={MIN_YEAR}
                    max={MAX_YEAR}
                    onChange={(e) => { setBirthYear(e.target.value); setAgeError(null); }}
                    required
                    suppressHydrationWarning
                  />
                </div>
                {ageError && (
                  <p className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {ageError}
                  </p>
                )}
                <Button type="submit" className="w-full h-12 text-lg font-black">
                  Continue
                </Button>
              </form>
              <div className="text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
              </div>
            </CardContent>
          </>
        )}

        {/* ── Step 2: Signup form ──────────────────────────────────────────── */}
        {step === 'signup-form' && (
          <>
            <CardHeader className="text-center pb-2">
              {inviteCode && (
                <div className="mb-4 p-4 bg-primary/10 rounded-xl border-2 border-primary/20 flex items-start gap-3 text-left">
                  <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-primary leading-tight">
                    You've been invited to connect with a SpendXP user! Create your account to see their progress.
                  </p>
                </div>
              )}
              {isUnder13 && (
                <div className="mb-4 p-4 bg-amber-50 rounded-xl border-2 border-amber-200 flex items-start gap-3 text-left">
                  <ShieldCheck className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold text-amber-700 leading-tight">
                    Because you're under 13, we'll need a parent or guardian to approve your account before you can play.
                  </p>
                </div>
              )}
              <h1 className="text-4xl font-black mb-1">
                <span className="text-slate-900">Spend</span>
                <span style={{ color: '#2E7D5A' }}>XP</span>
              </h1>
              <CardDescription className="text-base">Create your account to start earning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-4">
              {!isUnder13 && (
                <>
                  <Button
                    onClick={handleGoogleSignUp}
                    variant="outline"
                    className="w-full h-12 gap-3 text-base font-bold border-2"
                    disabled={loading}
                    suppressHydrationWarning
                  >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Continue with Google
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">or</span></div>
                  </div>
                </>
              )}

              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="What should we call you?"
                    className="pl-10 h-12"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                    suppressHydrationWarning
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder={isUnder13 ? "Your email address" : "Email address"}
                    className="pl-10 h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    suppressHydrationWarning
                  />
                </div>
                <div className="space-y-1">
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Create a strong password"
                      className="pl-10 h-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="flex gap-1 h-1.5 px-1">
                    <div className={cn("flex-1 rounded-full transition-colors", passwordStrength >= 1 ? "bg-primary" : "bg-slate-200")} />
                    <div className={cn("flex-1 rounded-full transition-colors", passwordStrength >= 2 ? "bg-primary" : "bg-slate-200")} />
                    <div className={cn("flex-1 rounded-full transition-colors", passwordStrength >= 3 ? "bg-primary" : "bg-slate-200")} />
                  </div>
                </div>

                {!isUnder13 && (
                  <div className="flex items-center space-x-2 pt-1">
                    <Checkbox
                      id="isParent"
                      checked={isParent}
                      disabled={!!inviteCode}
                      onCheckedChange={(val) => setIsParent(!!val)}
                      suppressHydrationWarning
                    />
                    <Label htmlFor="isParent" className="text-sm cursor-pointer">
                      I am a parent creating an account for my child
                    </Label>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {error}
                  </p>
                )}

                <Button type="submit" className="w-full h-12 text-lg font-black" disabled={loading} suppressHydrationWarning>
                  {loading ? 'Please wait...' : isUnder13 ? 'Next — Get Parent Approval' : 'Sign up'}
                </Button>
              </form>

              <div className="flex items-center justify-between">
                <button onClick={() => setStep('age-gate')} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
                  ← Back
                </button>
                {!isUnder13 && (
                  <span className="text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
                  </span>
                )}
              </div>

              <p className="text-center text-xs text-slate-400 leading-relaxed">
                By signing up you agree to our{' '}
                <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>
                {' '}and{' '}
                <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
              </p>
            </CardContent>
          </>
        )}

        {/* ── Step 3: Parent email (under-13) ─────────────────────────────── */}
        {step === 'parent-consent' && (
          <>
            <div className="bg-amber-500 p-8 text-white text-center rounded-t-xl">
              <ShieldCheck className="h-12 w-12 mx-auto mb-3" />
              <h2 className="text-2xl font-black">Parent Approval Needed</h2>
              <p className="text-amber-100 text-sm mt-1">
                Because you're under 13, a parent or guardian must approve your account.
              </p>
            </div>
            <CardContent className="p-8 space-y-6">
              <p className="text-sm text-slate-600 text-center">
                We'll send an email to your parent or guardian. Once they approve, you'll be able to sign in and start playing!
              </p>
              <form onSubmit={handleSendConsentRequest} className="space-y-4">
                <div>
                  <Label className="text-sm font-black text-slate-700 mb-2 block">Parent or Guardian's Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="parent@example.com"
                      className="pl-10 h-12"
                      value={parentEmail}
                      onChange={(e) => setParentEmail(e.target.value)}
                      required
                      suppressHydrationWarning
                    />
                  </div>
                </div>

                {consentError && (
                  <p className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> {consentError}
                  </p>
                )}

                <Button type="submit" className="w-full h-12 text-lg font-black bg-amber-500 hover:bg-amber-600" disabled={loading} suppressHydrationWarning>
                  {loading ? 'Sending...' : 'Send Approval Request'}
                </Button>
              </form>
              <button onClick={() => setStep('signup-form')} className="w-full text-xs text-slate-400 hover:text-slate-600 font-bold">
                ← Back
              </button>
            </CardContent>
          </>
        )}

        {/* ── Step 4: Consent email sent ───────────────────────────────────── */}
        {step === 'consent-sent' && (
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900">Email Sent!</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                We've sent an approval request to{' '}
                <span className="font-black text-slate-800">{parentEmail}</span>.
                <br /><br />
                Ask your parent or guardian to check their email and click the approval link. Once they approve, you can sign in and start playing!
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left space-y-1">
              <p className="font-black">What happens next?</p>
              <p>1. Your parent gets an email from SpendXP</p>
              <p>2. They click "Approve Account"</p>
              <p>3. Your account is created instantly</p>
              <p>4. Sign in at spendxp.vercel.app to play!</p>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full h-12 font-bold">Go to Sign In</Button>
            </Link>
          </CardContent>
        )}

      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" /></div>}>
      <SignupContent />
    </Suspense>
  );
}
