'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { safeSetDoc } from '@/firebase';

export default function ConsentPage() {
  const { user } = useAuthContext();
  const [parentEmail, setParentEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!user || !parentEmail) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'consentRequests'), {
        childUid: user.uid,
        parentEmail: parentEmail.toLowerCase(),
        requestedAt: serverTimestamp(),
        status: 'pending'
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelfApprove = async () => {
    if (!user) return;
    setLoading(true);
    const success = await safeSetDoc(doc(db, 'users', user.uid), {
      consentGiven: true,
      consentedAt: serverTimestamp()
    }, { merge: true });
    
    if (success) {
      window.location.href = '/games';
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-none shadow-2xl overflow-hidden">
        <div className="bg-primary p-8 text-white text-center">
          <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
          <CardTitle className="text-3xl font-black">Safety First!</CardTitle>
          <CardDescription className="text-primary-foreground/80 text-lg">
            SpendXP is a safe space for learning.
          </CardDescription>
        </div>
        <CardContent className="p-8 space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900">What we store:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Your name and birth year</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Your game scores and XP</li>
              </ul>
            </div>
          </div>

          {!submitted ? (
            <div className="space-y-4 border-t pt-8">
              <h3 className="font-black text-xl text-center">Parental Approval Required</h3>
              <div className="flex gap-2">
                <Input 
                  placeholder="Parent's email address" 
                  className="h-12"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  suppressHydrationWarning
                />
                <Button onClick={handleSendRequest} disabled={loading || !parentEmail} className="h-12 font-bold px-6" suppressHydrationWarning>
                  Send Request
                </Button>
              </div>
              <div className="text-center">
                <button 
                  onClick={handleSelfApprove} 
                  className="text-xs text-primary font-bold hover:underline"
                  suppressHydrationWarning
                >
                  I am the parent approving this account
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 space-y-4 animate-in zoom-in duration-500">
              <Mail className="h-10 w-10 mx-auto text-emerald-600" />
              <h3 className="text-2xl font-black">Request Sent!</h3>
              <Button variant="outline" onClick={() => setSubmitted(false)} suppressHydrationWarning>Use a different email</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
