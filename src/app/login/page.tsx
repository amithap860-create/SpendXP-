'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ShieldAlert, Sparkles, User, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { checkLockout } from '@/lib/accountLockout';
import { useFirestore } from '@/firebase';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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
  
  const db = useFirestore();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<Tab>('signin');
  const [showReset, setShowReset] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isParent, setIsParent] = useState(false);
  
  // Feedback States
  const [lockout, setLockout] = useState<{ locked: boolean; mins?: number }>({ locked: false });
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Lockout Countdown
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

  // Resend Cooldown
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
                className={cn(
                  "flex-1 py-3 text-sm font-bold transition-all border-b-2",
                  activeTab === 'signin' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
                suppressHydrationWarning
              >
                Sign in
              </button>
              <button 
                onClick={() => setActiveTab('signup')}
                className={cn(
                  "flex-1 py-3 text-sm font-bold transition-all border-b-2",
                  activeTab === 'signup' ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-600"
                )}
                suppressHydrationWarning
              >
                Create account
              </button>
            </div>
          )}

          <div className="relative overflow-hidden">
            {/* SIGN IN TAB */}
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
                      autoComplete="email"
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
                        autoComplete="current-password"
                        suppressHydrationWarning
                      />
                      <button 
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                        suppressHydrationWarning
                      >
                        <div className={cn(
                          "w-5 h-5 flex items-center justify-center border-2 border-current rounded-full relative",
                          isPasswordVisible ? "opacity-100" : "opacity-50"
                        )}>
                          <div className="w-1.5 h-1.5 bg-current rounded-full" />
                          {!isPasswordVisible && <div className="absolute w-full h-[2px] bg-current rotate-45" />}
                        </div>
                      </button>
                    </div>
                    <div className="text-right">
                      <button 
                        type="button"
                        onClick={() => setShowReset(true)}
                        className="text-xs font-bold text-primary hover:underline"
                        suppressHydrationWarning
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                </div>

                {lockout.locked && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-2 animate-in shake duration-500">
                    <ShieldAlert className="h-4 w-4 text-rose-600 mt-0.5" />
                    <p className="text-xs text-rose-700 font-bold leading-tight">
                      Too many failed attempts. Please wait {lockout.mins} minutes before trying again.
                    </p>
                  </div>
                )}

                {authError && !lockout.locked && (
                  <p className="text-xs text-destructive font-bold text-center bg-destructive/5 py-2 rounded-lg">
                    {authError}
                  </p>
                )}

                <Button type="submit" disabled={loading || lockout.locked} className="w-full h-14 text-lg font-black rounded-2xl shadow-xl shadow-primary/10" suppressHydrationWarning>
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Sign In'}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100" /></div>
                  <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-white px-3 text-slate-400">or</span></div>
                </div>

                <Button 
                  onClick={signInWithGoogle} 
                  variant="outline" 
                  type="button"
                  className="w-full h-12 gap-3 font-bold border-2 hover:bg-slate-50 transition-all"
                  suppressHydrationWarning
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                  Continue with Google
                </Button>
              </form>
            )}

            {/* CREATE ACCOUNT TAB */}
            {activeTab === 'signup' && !signupSuccess && (
              <form onSubmit={handleSignUp} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      placeholder="Display name" 
                      className="pl-10 h-12 bg-slate-50/50"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                      autoComplete="name"
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="Email address" 
                      className="pl-10 h-12 bg-slate-50/50"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      suppressHydrationWarning
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                      <Input 
                        type={isPasswordVisible ? "text" : "password"}
                        placeholder="Create a strong password" 
                        className="pl-10 pr-10 h-12 bg-slate-50/50"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="new-password"
                        suppressHydrationWarning
                      />
                      <button 
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                        suppressHydrationWarning
                      >
                        <div className={cn(
                          "w-5 h-5 flex items-center justify-center border-2 border-current rounded-full relative",
                          isPasswordVisible ? "opacity-100" : "opacity-50"
                        )}>
                          <div className="w-1.5 h-1.5 bg-current rounded-full" />
                          {!isPasswordVisible && <div className="absolute w-full h-[2px] bg-current rotate-45" />}
                        </div>
                      </button>
                    </div>
                    
                    <div className="flex gap-1 h-1.5 px-1">
                      <div className={cn("flex-1 rounded-full transition-all duration-500", strengthScore >= 1 ? "bg-amber-500" : "bg-slate-100")} />
                      <div className={cn("flex-1 rounded-full transition-all duration-500", strengthScore >= 2 ? "bg-amber-500" : "bg-slate-100")} />
                      <div className={cn("flex-1 rounded-full transition-all duration-500", strengthScore >= 3 ? "bg-emerald-500" : "bg-slate-100")} />
                    </div>
                    <div className="flex justify-between items-center px-1">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider",
                        strengthScore === 0 ? "text-slate-300" : strengthScore <= 2 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {strengthScore === 0 ? "Start typing..." : strengthScore === 1 ? "Weak" : strengthScore === 2 ? "Fair" : "Strong!"}
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                    <Input 
                      type="password"
                      placeholder="Confirm password" 
                      className={cn("pl-10 h-12 bg-slate-50/50", confirmError && "border-destructive")}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmError(null);
                      }}
                      onBlur={() => {
                        if (password !== confirmPassword) setConfirmError("Passwords don't match");
                      }}
                      required
                      suppressHydrationWarning
                    />
                    {confirmError && <p className="text-[10px] font-bold text-destructive mt-1 ml-1">{confirmError}</p>}
                  </div>
                </div>

                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="isParent" 
                    checked={isParent} 
                    onCheckedChange={(val) => setIsParent(!!val)} 
                    className="mt-1"
                    suppressHydrationWarning
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="isParent" className="text-sm font-bold cursor-pointer">
                      I am creating this account as a parent
                    </Label>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">
                      This will give you a monitoring dashboard for your child's progress.
                    </p>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 font-bold text-center italic">
                  SpendXP is for ages 8–20. You'll set your age after setup.
                </p>

                {authError && (
                  <p className="text-xs text-destructive font-bold text-center bg-destructive/5 py-2 rounded-lg">
                    {authError}
                  </p>
                )}

                <Button type="submit" disabled={loading} className="w-full h-14 text-lg font-black rounded-2xl" suppressHydrationWarning>
                  {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Create Account'}
                </Button>
              </form>
            )}

            {/* FORGOT PASSWORD FORM */}
            {showReset && !signupSuccess && (
              <form onSubmit={handleReset} className="space-y-6 animate-in slide-in-from-bottom-4 duration-300 py-4">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black text-slate-900">Reset your password</h3>
                  <p className="text-xs text-slate-500 font-medium">Enter your email and we'll send you a recovery link.</p>
                </div>

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

                {resetMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 font-bold text-center">
                    {resetMessage}
                  </div>
                )}

                <div className="space-y-3">
                  <Button type="submit" disabled={loading} className="w-full h-14 font-black rounded-2xl" suppressHydrationWarning>
                    {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Send reset link'}
                  </Button>
                  <button 
                    type="button" 
                    onClick={() => { setShowReset(false); setResetMessage(null); }}
                    className="w-full text-sm font-bold text-slate-400 hover:text-primary transition-colors"
                    suppressHydrationWarning
                  >
                    ← Back to sign in
                  </button>
                </div>
              </form>
            )}

            {/* SIGNUP SUCCESS / VERIFICATION NOTICE */}
            {signupSuccess && (
              <div className="py-8 space-y-8 animate-in zoom-in-95 duration-500">
                <div className="text-center space-y-4">
                  <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <Mail className="h-10 w-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 leading-tight">Check your inbox!</h2>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    We've sent a verification link to <span className="font-bold text-primary">{email}</span>. 
                    Verify your email to unlock all simulation features.
                  </p>
                </div>

                <div className="space-y-4">
                  <Button 
                    onClick={() => router.push('/onboarding')} 
                    className="w-full h-16 text-xl font-black rounded-2xl gap-2 group shadow-xl shadow-primary/10"
                    suppressHydrationWarning
                  >
                    Continue to setup <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                  
                  <div className="text-center">
                    <button 
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                      className={cn(
                        "text-xs font-bold transition-colors",
                        resendCooldown > 0 ? "text-slate-300" : "text-primary hover:underline"
                      )}
                      suppressHydrationWarning
                    >
                      {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : "Didn't get the link? Resend email"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}