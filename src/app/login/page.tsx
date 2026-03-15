'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Mail, Lock, ShieldAlert, Sparkles, RefreshCw, ArrowRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { checkLockout } from '@/firebase';
import { db } from '@/firebase';
import { cn } from '@/lib/utils';

type Tab = 'signin' | 'signup';

export default function LoginPage() {
  const { 
    signInWithGoogle, 
    signInWithEmail, 
    signUpWithEmail, 
    sendPasswordReset, 
    resendVerificationEmail,
    error: authError 
  } = useAuthContext();
  
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<Tab>('signin');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isParent, setIsParent] = useState(false);
  
  const [lockout, setLockout] = useState<{ locked: boolean; mins?: number }>({ locked: false });
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (lockout.locked && lockout.mins && lockout.mins > 0) {
      timer = setInterval(() => {
        setLockout(prev => ({
          ...prev,
          mins: prev.mins ? Math.max(0, prev.mins - 1) : 0
        }));
      }, 60000);
    }
    return () => clearInterval(timer);
  }, [lockout.locked, lockout.mins]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const status = await checkLockout(db, email);
    if (status.locked) {
      setLockout({ locked: true, mins: status.minutesLeft });
      setLoading(false);
      return;
    }
    const res = await signInWithEmail(email, password);
    if (!res.success) {
      const newStatus = await checkLockout(db, email);
      if (newStatus.locked) setLockout({ locked: true, mins: newStatus.minutesLeft });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setConfirmError("Passwords don't match");
      return;
    }
    setLoading(true);
    const res = await signUpWithEmail(email, password, displayName, isParent);
    if (res.success) {
      setSignupSuccess(true);
    }
    setLoading(false);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await sendPasswordReset(email);
    setResetMessage(res.message || 'Success');
    setLoading(false);
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    const res = await resendVerificationEmail();
    if (res.success) setResendCooldown(60);
  };

  const passwordStrength = {
    length: password.length >= 8,
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
  };
  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-[420px] w-full shadow-2xl border-none overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-black text-primary tracking-tighter">SpendXP</h1>
          </div>
          <CardDescription className="text-slate-600 font-medium">
            Learn money. Earn XP. Level up your future.
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          {!signupSuccess && !showReset && (
            <div className="flex border-b border-slate-100">
              <button 
                onClick={() => setActiveTab('signin')}
                suppressHydrationWarning
                className={cn(
                  "flex-1 py-3 text-sm font-bold transition-all border-b-2",
                  activeTab === 'signin' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                Sign in
              </button>
              <button 
                onClick={() => setActiveTab('signup')}
                suppressHydrationWarning
                className={cn(
                  "flex-1 py-3 text-sm font-bold transition-all border-b-2",
                  activeTab === 'signup' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
              >
                Create account
              </button>
            </div>
          )}

          <div className="relative overflow-hidden">
            {activeTab === 'signin' && !showReset && !signupSuccess && (
              <form onSubmit={handleSignIn} className="space-y-4 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="Email address" 
                      className="pl-10 h-12 bg-slate-50/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                      <Input 
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Password" 
                        className="pl-10 pr-10 h-12 bg-slate-50/50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        suppressHydrationWarning
                      />
                      <button 
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                        suppressHydrationWarning
                      >
                        {isPasswordVisible ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <div className="text-right">
                      <button 
                        type="button" 
                        onClick={() => setShowReset(true)}
                        suppressHydrationWarning
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                </div>

                {lockout.locked && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-600 mt-0.5" />
                    <p className="text-xs text-rose-700 font-bold leading-tight">
                      Too many failed attempts. Wait {lockout.mins}m.
                    </p>
                  </div>
                )}

                {authError && !lockout.locked && (
                  <p className="text-xs text-destructive font-bold text-center bg-destructive/5 py-2 rounded-lg">
                    {authError}
                  </p>
                )}

                <Button type="submit" disabled={loading || lockout.locked} className="w-full h-14 text-lg font-black rounded-2xl" suppressHydrationWarning>
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Sign In'}
                </Button>

                <Button 
                  onClick={signInWithGoogle} 
                  variant="outline" 
                  type="button" 
                  className="w-full h-12 gap-3 font-bold border-2"
                  suppressHydrationWarning
                >
                  Continue with Google
                </Button>
              </form>
            )}

            {activeTab === 'signup' && !signupSuccess && (
              <form onSubmit={handleSignUp} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <Input 
                    placeholder="Display name" 
                    className="h-12 bg-slate-50/50" 
                    value={displayName} 
                    onChange={(e) => setDisplayName(e.target.value)} 
                    required 
                    suppressHydrationWarning 
                  />
                  <Input 
                    type="email" 
                    placeholder="Email address" 
                    className="h-12 bg-slate-50/50" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    suppressHydrationWarning 
                  />
                  <Input 
                    type="password" 
                    placeholder="Password" 
                    className="h-12 bg-slate-50/50" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                    suppressHydrationWarning 
                  />
                  <Input 
                    type="password" 
                    placeholder="Confirm Password" 
                    className="h-12 bg-slate-50/50" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                    suppressHydrationWarning 
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-black rounded-2xl" suppressHydrationWarning>
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            )}

            {signupSuccess && (
              <div className="py-8 space-y-8 text-center">
                <h2 className="text-2xl font-black">Check your inbox!</h2>
                <Button onClick={() => router.push('/onboarding')} className="w-full h-16 text-xl font-black rounded-2xl" suppressHydrationWarning>
                  Continue to setup <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
