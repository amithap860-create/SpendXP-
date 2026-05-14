'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, CheckCircle2, AlertCircle, Loader2, Users, LogIn, UserCheck } from 'lucide-react';
import Link from 'next/link';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface InviteDetails {
  childName?: string;
  childEmail?: string;
  parentName?: string;
  parentEmail?: string;
  expiresAt: string;
  inviteCode: string;
}

type PageState = 'loading' | 'ready' | 'linking' | 'linked' | 'already-used' | 'expired' | 'invalid' | 'error';

// ─────────────────────────────────────────────────────────────────────────────
// Parent accepts child-initiated invite  (?code=XXX)
// ─────────────────────────────────────────────────────────────────────────────

function ParentAcceptsInvite({ code }: { code: string }) {
  const router = useRouter();
  const { user } = useAuthContext();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [linkedChildName, setLinkedChildName] = useState('');

  useEffect(() => {
    fetch(`/api/parent/accept-invite?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          if (data.error.toLowerCase().includes('already')) setPageState('already-used');
          else if (data.error.toLowerCase().includes('expired')) setPageState('expired');
          else { setErrorMsg(data.error); setPageState('invalid'); }
        } else {
          setInvite(data);
          setPageState('ready');
        }
      })
      .catch(() => { setErrorMsg('Network error. Please try again.'); setPageState('error'); });
  }, [code]);

  const handleAccept = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/join?code=${code}`)}`);
      return;
    }

    setPageState('linking');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/parent/accept-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();

      if (data.ok) {
        setLinkedChildName(data.childName);
        setPageState('linked');
      } else if (data.error?.toLowerCase().includes('already')) {
        setPageState('already-used');
      } else {
        setErrorMsg(data.error || 'Something went wrong.');
        setPageState('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setPageState('error');
    }
  };

  const expiresFormatted = invite
    ? new Date(invite.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : '';

  return (
    <Card className="border-none shadow-2xl overflow-hidden">
      {pageState === 'loading' && (
        <CardContent className="p-12 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
          <p className="text-slate-500 font-bold">Loading invite…</p>
        </CardContent>
      )}

      {pageState === 'ready' && invite && (
        <>
          <div className="bg-primary p-8 text-white text-center">
            <Users className="h-12 w-12 mx-auto mb-3" />
            <h2 className="text-2xl font-black">Parent Invite</h2>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Connect your SpendXP account as a parent
            </p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="bg-slate-50 rounded-xl p-5 space-y-1">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Connecting with</p>
              <p className="text-2xl font-black text-slate-900">{invite.childName}</p>
              <p className="text-slate-500 text-sm">{invite.childEmail}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-slate-700">As a linked parent you can:</p>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  "View your child's learning progress and XP",
                  "See which games and quests they've completed",
                  'Get weekly progress reports by email',
                  'Manage screen time and notification settings',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-400 text-center">Link expires {expiresFormatted}</p>

            {user ? (
              <div className="space-y-3">
                <Button onClick={handleAccept} className="w-full h-14 text-lg font-black">
                  Connect as Parent
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Connecting as <strong>{user.displayName || user.email}</strong>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 text-center font-bold">
                  Sign in or create an account to connect:
                </p>
                <Link href={`/login?redirect=${encodeURIComponent(`/join?code=${code}`)}`}>
                  <Button className="w-full h-12 font-black gap-2">
                    <LogIn className="h-4 w-4" /> Sign in to connect
                  </Button>
                </Link>
                <Link href={`/signup?inviteCode=${code}`}>
                  <Button variant="outline" className="w-full h-12 font-bold">
                    Create a parent account
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </>
      )}

      {pageState === 'linking' && (
        <CardContent className="p-12 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
          <p className="text-slate-500 font-bold">Connecting accounts…</p>
        </CardContent>
      )}

      {pageState === 'linked' && (
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">You&apos;re Connected!</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              You&apos;re now linked to <strong>{linkedChildName || invite?.childName}</strong>&apos;s SpendXP account.
              Head to your Parent Dashboard to see their progress.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/parent"><Button className="w-full h-12 font-black">Go to Parent Dashboard</Button></Link>
            <Link href="/dashboard"><Button variant="outline" className="w-full h-12 font-bold">My Dashboard</Button></Link>
          </div>
        </CardContent>
      )}

      {pageState === 'already-used' && (
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Already Connected</h2>
            <p className="text-slate-600 text-sm">This invite has already been used to link accounts.</p>
          </div>
          <Link href="/parent"><Button className="w-full h-12 font-bold">Go to Parent Dashboard</Button></Link>
        </CardContent>
      )}

      {pageState === 'expired' && (
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Link Expired</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              This invite link has expired (links last 7 days). Ask your child to generate a new one from their Profile page.
            </p>
          </div>
          <Link href="/"><Button variant="outline" className="w-full h-12 font-bold">Go to SpendXP</Button></Link>
        </CardContent>
      )}

      {(pageState === 'invalid' || pageState === 'error') && (
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              {pageState === 'invalid' ? 'Invalid Link' : 'Something Went Wrong'}
            </h2>
            <p className="text-slate-600 text-sm">{errorMsg || 'Please check the link and try again.'}</p>
          </div>
          <Link href="/"><Button variant="outline" className="w-full h-12 font-bold">Go to SpendXP</Button></Link>
        </CardContent>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Child accepts parent-initiated invite  (?parentCode=XXX)
// ─────────────────────────────────────────────────────────────────────────────

function ChildAcceptsInvite({ code }: { code: string }) {
  const router = useRouter();
  const { user } = useAuthContext();

  const [pageState, setPageState] = useState<PageState>('loading');
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [linkedParentName, setLinkedParentName] = useState('');

  useEffect(() => {
    fetch(`/api/parent/accept-child-invite?code=${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          if (data.error.toLowerCase().includes('already')) setPageState('already-used');
          else if (data.error.toLowerCase().includes('expired')) setPageState('expired');
          else { setErrorMsg(data.error); setPageState('invalid'); }
        } else {
          setInvite(data);
          setPageState('ready');
        }
      })
      .catch(() => { setErrorMsg('Network error. Please try again.'); setPageState('error'); });
  }, [code]);

  const handleAccept = async () => {
    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(`/join?parentCode=${code}`)}`);
      return;
    }

    setPageState('linking');
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/parent/accept-child-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inviteCode: code }),
      });
      const data = await res.json();

      if (data.ok) {
        setLinkedParentName(data.parentName);
        setPageState('linked');
      } else if (data.error?.toLowerCase().includes('already')) {
        setPageState('already-used');
      } else {
        setErrorMsg(data.error || 'Something went wrong.');
        setPageState('error');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
      setPageState('error');
    }
  };

  const expiresFormatted = invite
    ? new Date(invite.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })
    : '';

  return (
    <Card className="border-none shadow-2xl overflow-hidden">
      {pageState === 'loading' && (
        <CardContent className="p-12 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
          <p className="text-slate-500 font-bold">Loading invite…</p>
        </CardContent>
      )}

      {pageState === 'ready' && invite && (
        <>
          <div className="bg-amber-500 p-8 text-white text-center">
            <UserCheck className="h-12 w-12 mx-auto mb-3" />
            <h2 className="text-2xl font-black">Your Parent Wants to Connect</h2>
            <p className="text-white/80 text-sm mt-1">
              Accept to let them cheer you on!
            </p>
          </div>
          <CardContent className="p-8 space-y-6">
            <div className="bg-slate-50 rounded-xl p-5 space-y-1">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Parent requesting</p>
              <p className="text-2xl font-black text-slate-900">{invite.parentName}</p>
              <p className="text-slate-500 text-sm">{invite.parentEmail}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-black text-slate-700">When connected, they can:</p>
              <ul className="space-y-2 text-sm text-slate-600">
                {[
                  'See your XP, badges, and learning progress',
                  'Watch which quests and games you complete',
                  'Get a weekly summary of your achievements',
                  'Help set healthy screen-time habits',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-slate-400 text-center">Link expires {expiresFormatted}</p>

            {user ? (
              <div className="space-y-3">
                <Button onClick={handleAccept} className="w-full h-14 text-lg font-black bg-amber-500 hover:bg-amber-600">
                  Accept & Connect
                </Button>
                <p className="text-xs text-slate-400 text-center">
                  Connecting as <strong>{user.displayName || user.email}</strong>
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-slate-600 text-center font-bold">
                  Sign in to your SpendXP account to accept:
                </p>
                <Link href={`/login?redirect=${encodeURIComponent(`/join?parentCode=${code}`)}`}>
                  <Button className="w-full h-12 font-black gap-2 bg-amber-500 hover:bg-amber-600">
                    <LogIn className="h-4 w-4" /> Sign in to accept
                  </Button>
                </Link>
                <Link href={`/signup?redirect=${encodeURIComponent(`/join?parentCode=${code}`)}&inviteRedirect=1`}>
                  <Button variant="outline" className="w-full h-12 font-bold">
                    Create a SpendXP account
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </>
      )}

      {pageState === 'linking' && (
        <CardContent className="p-12 text-center space-y-4">
          <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
          <p className="text-slate-500 font-bold">Connecting accounts…</p>
        </CardContent>
      )}

      {pageState === 'linked' && (
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">You&apos;re Connected! 🎉</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              <strong>{linkedParentName || invite?.parentName}</strong> can now see your SpendXP progress.
              Keep earning XP and levelling up!
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard"><Button className="w-full h-12 font-black">Go to My Dashboard</Button></Link>
            <Link href="/profile"><Button variant="outline" className="w-full h-12 font-bold">My Profile</Button></Link>
          </div>
        </CardContent>
      )}

      {pageState === 'already-used' && (
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-10 w-10 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Already Connected</h2>
            <p className="text-slate-600 text-sm">Your account is already linked to a parent.</p>
          </div>
          <Link href="/dashboard"><Button className="w-full h-12 font-bold">My Dashboard</Button></Link>
        </CardContent>
      )}

      {pageState === 'expired' && (
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-amber-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">Link Expired</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              This invite link has expired (links last 7 days). Ask your parent to generate a new one.
            </p>
          </div>
          <Link href="/"><Button variant="outline" className="w-full h-12 font-bold">Go to SpendXP</Button></Link>
        </CardContent>
      )}

      {(pageState === 'invalid' || pageState === 'error') && (
        <CardContent className="p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-900">
              {pageState === 'invalid' ? 'Invalid Link' : 'Something Went Wrong'}
            </h2>
            <p className="text-slate-600 text-sm">{errorMsg || 'Please check the link and try again.'}</p>
          </div>
          <Link href="/"><Button variant="outline" className="w-full h-12 font-bold">Go to SpendXP</Button></Link>
        </CardContent>
      )}
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page — detects which flow based on query params
// ─────────────────────────────────────────────────────────────────────────────

function JoinContent() {
  const searchParams = useSearchParams();

  const childCode = (searchParams.get('code') || '').toUpperCase();
  const parentCode = (searchParams.get('parentCode') || '').toUpperCase();

  const hasCode = childCode.length >= 4;
  const hasParentCode = parentCode.length >= 4;

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-blue-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4">

        {/* Logo */}
        <div className="text-center">
          <h1 className="text-3xl font-black">
            <span className="text-slate-900">Spend</span>
            <span style={{ color: '#2E7D5A' }}>XP</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Financial literacy for young learners</p>
        </div>

        {/* Route to correct flow */}
        {hasCode && <ParentAcceptsInvite code={childCode} />}
        {hasParentCode && <ChildAcceptsInvite code={parentCode} />}

        {!hasCode && !hasParentCode && (
          <Card className="border-none shadow-2xl">
            <CardContent className="p-10 text-center space-y-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-10 w-10 text-red-500" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">Invalid Link</h2>
                <p className="text-slate-600 text-sm">No invite code found. Please use the link exactly as shared with you.</p>
              </div>
              <Link href="/"><Button variant="outline" className="w-full h-12 font-bold">Go to SpendXP</Button></Link>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}

export default function JoinPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <JoinContent />
    </Suspense>
  );
}
