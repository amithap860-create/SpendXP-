'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Users, Clock, Bell, ChevronRight,
  CheckCircle2, Copy, Share2, RefreshCw,
  Mail, AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { safeUpdateDoc } from '@/lib/firestoreSafe';
import { db } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function ParentSetup() {
  const { user } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [timeLimit, setTimeLimit] = useState([60]);
  const [notifs, setNotificationPrefs] = useState({ report: true, badges: true });

  // ── Invite link state ────────────────────────────────────────────────────
  const [inviteState, setInviteState] = useState<'idle' | 'loading' | 'ready' | 'copied' | 'error'>('idle');
  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [inviteExpiry, setInviteExpiry] = useState('');
  const [inviteError, setInviteError] = useState('');

  // ── Email invite state ───────────────────────────────────────────────────
  const [childEmail, setChildEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const generateInvite = async () => {
    if (!user) return;
    setInviteState('loading');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/parent/generate-invite-for-child', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.inviteUrl) {
        setInviteUrl(data.inviteUrl);
        setInviteCode(data.inviteCode);
        setInviteExpiry(new Date(data.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' }));
        setInviteState('ready');
      } else {
        setInviteError(data.error || 'Could not generate invite.');
        setInviteState('error');
      }
    } catch {
      setInviteError('Network error. Please try again.');
      setInviteState('error');
    }
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setInviteState('copied');
      setTimeout(() => setInviteState('ready'), 2000);
    } catch {
      toast({ title: 'Please copy the link manually.' });
    }
  };

  const shareInvite = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join SpendXP',
          text: "I'd like to connect to your SpendXP account to support your learning!",
          url: inviteUrl,
        });
      } catch { /* cancelled */ }
    } else {
      copyInvite();
    }
  };

  const sendEmailInvite = async () => {
    if (!user || !childEmail.trim()) return;
    setEmailSending(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/parent/email-child-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ childEmail: childEmail.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (data.ok) {
        setEmailSent(true);
      } else {
        toast({ title: data.error || 'Could not send invite email.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Network error. Please try again.', variant: 'destructive' });
    } finally {
      setEmailSending(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    const parentRef = doc(db, 'users', user.uid);
    await safeUpdateDoc(parentRef, {
      notificationPrefs: notifs,
      dailyTimeLimitMinutes: timeLimit[0] === 120 ? null : timeLimit[0],
      setupComplete: true,
      isParent: true,
    });
    router.push('/parent');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-6">

        {/* Progress dots */}
        <div className="flex justify-between items-center px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center font-bold transition-colors text-sm",
                step >= i ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
              )}>
                {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
              </div>
              {i < 3 && <div className={cn("h-1 w-12 md:w-20 rounded-full", step > i ? "bg-primary" : "bg-slate-100")} />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Connect to child ─────────────────────────────────────── */}
        {step === 1 && (
          <Card className="border-none shadow-2xl">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black">Connect to Your Child</CardTitle>
              <CardDescription>Two ways to link — choose whichever is easiest.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">

              {/* Option A: generate a link to share with child */}
              <div className="p-5 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-primary" />
                  <h4 className="font-black text-slate-800">Share a link with your child</h4>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Generate a link and send it to your child. When they open it and accept, you'll be connected instantly.
                </p>

                {inviteState === 'idle' && (
                  <Button onClick={generateInvite} className="w-full h-11 font-black gap-2" suppressHydrationWarning>
                    Generate Invite Link
                  </Button>
                )}
                {inviteState === 'loading' && (
                  <Button disabled className="w-full h-11 font-black gap-2" suppressHydrationWarning>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Generating…
                  </Button>
                )}
                {(inviteState === 'ready' || inviteState === 'copied') && (
                  <div className="space-y-2">
                    <div className="bg-slate-900 rounded-xl p-3 flex items-center gap-2">
                      <p className="text-xs text-slate-300 font-mono flex-1 truncate">{inviteUrl}</p>
                      <span className="bg-primary/20 text-primary font-black text-xs px-2 py-0.5 rounded-lg shrink-0">{inviteCode}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={copyInvite} variant="outline" className="flex-1 h-10 font-bold gap-1.5 text-sm" suppressHydrationWarning>
                        {inviteState === 'copied' ? <><CheckCircle2 className="h-4 w-4 text-green-600" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy</>}
                      </Button>
                      <Button onClick={shareInvite} className="flex-1 h-10 font-bold gap-1.5 text-sm" suppressHydrationWarning>
                        <Share2 className="h-4 w-4" /> Share
                      </Button>
                    </div>
                    <p className="text-xs text-slate-400 text-center">Expires {inviteExpiry} · <button onClick={generateInvite} className="text-primary font-black hover:underline" suppressHydrationWarning>Refresh</button></p>
                  </div>
                )}
                {inviteState === 'error' && (
                  <div className="space-y-2">
                    <p className="text-xs text-destructive font-bold bg-destructive/10 p-3 rounded-lg">{inviteError}</p>
                    <Button onClick={() => setInviteState('idle')} variant="outline" className="w-full h-10 font-bold" suppressHydrationWarning>Try again</Button>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">or</span></div>
              </div>

              {/* Option B: send email to child */}
              <div className="p-5 rounded-2xl border-2 border-dashed border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-slate-500" />
                  <h4 className="font-black text-slate-700">Email your child directly</h4>
                </div>
                {!emailSent ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Enter your child's email — we'll send them a link to accept your connection request.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="child@email.com"
                        value={childEmail}
                        onChange={(e) => setChildEmail(e.target.value)}
                        className="h-11"
                        suppressHydrationWarning
                      />
                      <Button
                        onClick={sendEmailInvite}
                        disabled={emailSending || !childEmail.trim()}
                        className="h-11 font-bold px-5"
                        suppressHydrationWarning
                      >
                        {emailSending ? 'Sending…' : 'Send'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    <p className="text-sm font-bold text-green-800">Email sent to {childEmail}! Ask them to check their inbox.</p>
                  </div>
                )}
              </div>

              <Button onClick={() => setStep(2)} className="w-full h-12 font-black" variant="outline" suppressHydrationWarning>
                Skip for now — I'll do this later <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Step 2: Screen time ──────────────────────────────────────────── */}
        {step === 2 && (
          <Card className="border-none shadow-2xl">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
              <CardTitle className="text-3xl font-black">Screen Time Limits</CardTitle>
              <CardDescription>Healthy habits start with balanced play time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <Label className="text-lg font-bold">Daily Play Limit</Label>
                  <span className="text-2xl font-black text-primary">
                    {timeLimit[0] === 120 ? 'Unlimited' : `${timeLimit[0]} mins`}
                  </span>
                </div>
                <Slider
                  value={timeLimit}
                  max={120}
                  step={15}
                  onValueChange={setTimeLimit}
                  className="py-4"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  <span>15m</span><span>30m</span><span>45m</span><span>60m</span><span>Unlimited</span>
                </div>
              </div>
              <Button onClick={() => setStep(3)} className="w-full h-14 text-lg font-black" suppressHydrationWarning>
                Next <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Step 3: Notifications ────────────────────────────────────────── */}
        {step === 3 && (
          <Card className="border-none shadow-2xl">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl font-black">Notification Prefs</CardTitle>
              <CardDescription>Stay updated on their learning journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
                  <div>
                    <Label className="text-base font-bold">Weekly Progress Report</Label>
                    <p className="text-xs text-slate-500">A summary of XP, quests, and games.</p>
                  </div>
                  <Switch
                    checked={notifs.report}
                    onCheckedChange={(v) => setNotificationPrefs(p => ({ ...p, report: v }))}
                    suppressHydrationWarning
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
                  <div>
                    <Label className="text-base font-bold">New Badge Alerts</Label>
                    <p className="text-xs text-slate-500">Get notified when they master a new skill.</p>
                  </div>
                  <Switch
                    checked={notifs.badges}
                    onCheckedChange={(v) => setNotificationPrefs(p => ({ ...p, badges: v }))}
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <Button
                onClick={handleComplete}
                className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 shadow-lg"
                suppressHydrationWarning
              >
                Go to Parent Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
