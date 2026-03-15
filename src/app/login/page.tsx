'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, Mail, Lock } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { signInWithGoogle, signInWithEmail, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signInWithEmail(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-2xl border-none">
        <CardHeader className="text-center">
          <h1 className="text-4xl font-black text-primary mb-2">SpendXP</h1>
          <CardDescription className="text-lg">
            Learn money. Earn XP. Level up your future.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={signInWithGoogle} 
            variant="outline" 
            className="w-full h-12 gap-3 text-lg font-bold border-2 hover:bg-slate-50"
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
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-lg">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full h-12 text-lg font-black" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="text-center text-sm">
            New to SpendXP? <Link href="/signup" className="text-primary font-bold hover:underline">Sign up</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
