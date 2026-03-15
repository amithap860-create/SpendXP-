'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { checkLockout, recordFailedAttempt, clearAttempts } from '@/lib/accountLockout';
import { useFirestore } from '@/firebase';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, error: authError } = useAuthContext();
  const db = useFirestore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [lockout, setLockout] = useState<{ locked: boolean; mins?: number }>({ locked: false });

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const status = await checkLockout(db, email);
    if (status.locked) {
      setLockout({ locked: true, mins: status.minutesLeft });
      setLoading(false);
      return;
    }

    try {
      await signInWithEmail(email, password);
      // Logic for clearAttempts is inside useEffect observing auth state
    } catch (err) {
      await recordFailedAttempt(db, email);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-none">
        <CardHeader className="text-center">
          <h1 className="text-4xl font-black text-primary mb-2">SpendXP</h1>
          <CardDescription className="text-lg text-slate-600 font-medium">
            Learn money. Earn XP. Level up your future.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {lockout.locked && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 animate-in shake duration-500">
              <ShieldAlert className="h-5 w-5 text-rose-600 mt-0.5" />
              <div className="text-sm text-rose-700 font-bold">
                Too many failed attempts. Please wait {lockout.mins} minutes before trying again.
              </div>
            </div>
          )}

          <Button 
            onClick={signInWithGoogle} 
            variant="outline" 
            className="w-full h-12 gap-3 text-lg font-bold border-2 hover:bg-slate-50"
            disabled={lockout.locked}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">or</span></div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                  disabled={lockout.locked}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  className="pl-10 h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={lockout.locked}
                />
              </div>
            </div>

            {(authError) && (
              <p className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-lg text-center">
                Invalid email or password.
              </p>
            )}

            <Button type="submit" className="w-full h-14 text-xl font-black rounded-2xl shadow-xl" disabled={loading || lockout.locked}>
              {loading ? 'Entering Arcade...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm text-slate-500">
            New to SpendXP? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
