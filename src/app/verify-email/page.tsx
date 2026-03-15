'use client';

import { useState, useEffect } from 'react';
import { useAuth as useFirebaseAuth, db } from '@/firebase';
import { applyActionCode } from 'firebase/auth';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import { doc } from 'firebase/firestore';
import { safeUpdateDoc } from '@/firebase';
import { useAuthContext } from '@/context/AuthContext';

export default function VerifyEmailPage() {
  const auth = useFirebaseAuth();
  const { user } = useAuthContext();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'already' | 'error'>('loading');
  const oobCode = searchParams.get('oobCode');

  useEffect(() => {
    if (!oobCode) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await applyActionCode(auth, oobCode);
        
        if (user) {
          const userRef = doc(db, 'users', user.uid);
          await safeUpdateDoc(userRef, { emailVerified: true });
        }
        
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
      }
    };

    verify();
  }, [auth, oobCode, user]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-none shadow-2xl text-center p-8 overflow-hidden">
        <div className="bg-primary h-2 w-full absolute top-0 left-0" />
        
        {status === 'loading' && (
          <CardContent className="pt-8 space-y-6">
            <LoaderCircle className="h-16 w-16 animate-spin text-primary mx-auto" />
            <div className="space-y-2">
              <CardTitle className="text-2xl font-black">Verifying your email...</CardTitle>
              <p className="text-slate-50 font-medium">Just a moment while we secure your account.</p>
            </div>
          </CardContent>
        )}

        {status === 'success' && (
          <CardContent className="pt-8 space-y-8 animate-in zoom-in duration-500">
            <div className="h-20 w-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-black text-slate-900">Verified!</CardTitle>
              <p className="text-slate-500 font-medium">Your account is now fully active. Happy learning!</p>
            </div>
            <Button 
              onClick={() => router.push('/games')} 
              className="w-full h-16 text-xl font-black rounded-2xl shadow-xl shadow-emerald-100"
              suppressHydrationWarning
            >
              Go to SpendXP Arcade →
            </Button>
          </CardContent>
        )}

        {status === 'error' && (
          <CardContent className="pt-8 space-y-8">
            <div className="h-20 w-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-black">Link Expired</CardTitle>
              <p className="text-slate-500 font-medium">This verification link is invalid or has already been used.</p>
            </div>
            <div className="space-y-3 pt-4">
              <Button 
                onClick={() => router.push('/login')} 
                variant="outline" 
                className="w-full h-12 font-bold border-2"
                suppressHydrationWarning
              >
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
