'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Lock, ShieldCheck, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { collection, query, where, getDocs, doc, serverTimestamp, writeBatch, FieldValue, arrayUnion } from 'firebase/firestore';
import { db, safeSetDoc, safeUpdateDoc } from '@/firebase';

function SignupContent() {
  const { signUpWithEmail, signInWithGoogle, error: authError } = useAuthContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isParent, setIsParent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignUp = async () => {
    setLoading(true);
    const res = await signInWithGoogle();
    if (res.success) {
      router.replace('/onboarding');
    }
    setLoading(false);
  };

  useEffect(() => {
    const code = searchParams.get('inviteCode');
    if (code) {
      setInviteCode(code);
      setIsParent(true);
    }
  }, [searchParams]);

  const passwordStrength = useMemo(() => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;
    return strength;
  }, [password]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signUpWithEmail(email, password, displayName, isParent);
    
    if (res.success && inviteCode) {
      try {
        // Logic 7: Check invite code expiry
        const q = query(collection(db, 'pendingParentInvites'), where('inviteCode', '==', inviteCode));
        const snap = await getDocs(q);
        const inviteDoc = snap.docs[0];
        
        if (!inviteDoc || inviteDoc.data().expiresAt.toDate() < new Date()) {
          setError("This invite link has expired. Ask your child to send a new one.");
          setLoading(false);
          return;
        }

        const inviteData = inviteDoc.data();
        const batch = writeBatch(db);
        const newParentUid = (res as any).userId;

        // Create Accepted Link
        const linkRef = doc(db, 'linkRequests', `${inviteData.childUid}_${newParentUid}`);
        batch.set(linkRef, {
          parentUid: newParentUid,
          childUid: inviteData.childUid,
          status: 'accepted',
          createdAt: serverTimestamp()
        });

        // Update Child
        batch.update(doc(db, 'users', inviteData.childUid), {
          parentLinked: true,
          parentUid: newParentUid,
          parentEmail: email.toLowerCase(),
          pendingParentEmail: null
        });

        // Update Parent
        batch.update(doc(db, 'users', newParentUid), {
          linkedChildren: arrayUnion(inviteData.childUid),
          isParent: true,
          setupComplete: true
        });

        // Clean up
        batch.delete(inviteDoc.ref);
        await batch.commit();
        
        router.push('/parent');
        return;
      } catch (err) {
        console.error("Invite processing error:", err);
      }
    }

    if (res.success) {
      router.push(isParent ? '/parent/setup' : '/onboarding');
    } else {
      setError(res.error || authError);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-none">
        <CardHeader className="text-center">
          {inviteCode && (
            <div className="mb-6 p-4 bg-primary/10 rounded-xl border-2 border-primary/20 flex items-start gap-3 text-left">
              <ShieldCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <p className="text-xs font-bold text-primary leading-tight">
                You've been invited to connect with a SpendXP user! Create your account to see their progress.
              </p>
            </div>
          )}
          <h1 className="text-4xl font-black mb-2"><span className="text-slate-900">Spend</span><span style={{ color: "#2E7D5A" }}>XP</span></h1>
          <CardDescription className="text-lg">Create your account to start earning.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button
            onClick={handleGoogleSignUp}
            variant="outline"
            className="w-full h-12 gap-3 text-lg font-bold border-2"
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

          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
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
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Email address" 
                  className="pl-10 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div className="space-y-2">
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
              <div className="flex gap-1 h-1.5 mt-2 px-1">
                <div className={cn("flex-1 rounded-full transition-colors", passwordStrength >= 1 ? "bg-primary" : "bg-slate-200")} />
                <div className={cn("flex-1 rounded-full transition-colors", passwordStrength >= 2 ? "bg-primary" : "bg-slate-200")} />
                <div className={cn("flex-1 rounded-full transition-colors", passwordStrength >= 3 ? "bg-primary" : "bg-slate-200")} />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
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

            {error && (
              <p className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> {error}
              </p>
            )}

            <Button type="submit" className="w-full h-12 text-lg font-black" disabled={loading} suppressHydrationWarning>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </div>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            By signing up you agree to our{' '}
            <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}
