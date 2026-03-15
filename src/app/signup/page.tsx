'use client';

import { useState, useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SignupPage() {
  const { signUpWithEmail, signInWithGoogle, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isParent, setIsParent] = useState(false);
  const [loading, setLoading] = useState(false);

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
    await signUpWithEmail(email, password, isParent);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-none">
        <CardHeader className="text-center">
          <h1 className="text-4xl font-black text-primary mb-2">SpendXP</h1>
          <CardDescription className="text-lg">Create your account to start earning.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={signInWithGoogle} 
            variant="outline" 
            className="w-full h-12 gap-3 text-lg font-bold border-2"
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
                <div className={cn("flex-1 rounded-full transition-colors", passwordStrength >= 1 ? "bg-emerald-500" : "bg-slate-200")} />
                <div className={cn("flex-1 rounded-full transition-colors", passwordStrength >= 2 ? "bg-emerald-500" : "bg-slate-200")} />
                <div className={cn("flex-1 rounded-full transition-colors", passwordStrength >= 3 ? "bg-emerald-500" : "bg-slate-200")} />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isParent" 
                checked={isParent} 
                onCheckedChange={(val) => setIsParent(!!val)} 
                suppressHydrationWarning
              />
              <Label htmlFor="isParent" className="text-sm cursor-pointer">
                I am a parent creating an account for my child
              </Label>
            </div>

            {error && (
              <p className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-12 text-lg font-black" disabled={loading} suppressHydrationWarning>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </form>

          <div className="text-center text-sm">
            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Sign in</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}