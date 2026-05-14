'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

/**
 * /consent — shown to a signed-in under-13 user whose account exists
 * but doesn't yet have parental consent recorded.
 *
 * This page ONLY sends a consent request email to the parent.
 * Self-approval has been removed (COPPA violation).
 */
export default function ConsentPage() {
  const { user } = useAuthContext();
  const [parentEmail, setParentEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendRequest = async () => {
    if (!user || !parentEmail.trim()) return;

    if (!parentEmail.includes('@')) {
      setError("Please enter a valid parent email address.");
      return;
    }
    if (parentEmail.toLowerCase() === user.email?.toLowerCase()) {
      setError("Parent email must be different from the account email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Store the consent request in Firestore (legacy path)
      // The actual email is sent via the consent-request API
      await addDoc(collection(db, 'consentRequests'), {
        childUid: user.uid,
        childEmail: user.email,
        parentEmail: parentEmail.toLowerCase(),
        requestedAt: serverTimestamp(),
        status: 'pending'
      });

      // Send parental consent email via server-side API
      const res = await fetch('/api/consent-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          parentEmail: parentEmail.toLowerCase(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Failed to send email. Please try again.');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full border-none shadow-2xl overflow-hidden">
        <div className="bg-primary p-8 text-white text-center">
          <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
          <h1 className="text-3xl font-black">Safety First!</h1>
          <p className="text-primary-foreground/80 text-lg">SpendXP keeps young learners safe.</p>
        </div>
        <CardContent className="p-8 space-y-8">
          {/* What we store */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="font-black text-slate-900">What we store:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  Your name and birth year
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  Your game scores and XP
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  Learning progress and quests
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-black text-slate-900">We never:</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-black">✓</span>
                  Show ads on child accounts
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-black">✓</span>
                  Sell personal data to anyone
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-black">✓</span>
                  Collect location information
                </li>
              </ul>
            </div>
          </div>

          {/* Consent form or confirmation */}
          {!submitted ? (
            <div className="space-y-5 border-t pt-8">
              <div className="text-center space-y-1">
                <h3 className="font-black text-xl">Parental Approval Required</h3>
                <p className="text-sm text-slate-500">
                  Because you're under 13, a parent or guardian must approve your account before you can play.
                </p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-black text-slate-700">Parent or Guardian's Email</Label>
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="parent@example.com"
                    className="h-12"
                    value={parentEmail}
                    onChange={(e) => { setParentEmail(e.target.value); setError(null); }}
                    suppressHydrationWarning
                  />
                  <Button
                    onClick={handleSendRequest}
                    disabled={loading || !parentEmail.trim()}
                    className="h-12 font-bold px-6"
                    suppressHydrationWarning
                  >
                    {loading ? 'Sending…' : 'Send Request'}
                  </Button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive font-bold bg-destructive/10 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" /> {error}
                </p>
              )}

              <p className="text-xs text-slate-400 text-center">
                Your parent will receive an email from SpendXP with an approval link.
                Your account will be ready once they approve.
              </p>
            </div>
          ) : (
            <div className="text-center py-10 space-y-5 animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Request Sent!</h3>
                <p className="text-slate-500 text-sm">
                  We've emailed <strong>{parentEmail}</strong>. Ask them to check their inbox and click the approval link.
                </p>
              </div>
              <Button variant="outline" onClick={() => { setSubmitted(false); setParentEmail(''); }} suppressHydrationWarning>
                Use a different email
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
