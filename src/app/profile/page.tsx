'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { 
  useDoc, 
  useMemoFirebase,
  safeUpdateDoc,
  db,
  googleProvider
} from '@/firebase';
import { 
  doc, 
  serverTimestamp, 
  Timestamp,
} from 'firebase/firestore';
import { 
  verifyBeforeUpdateEmail, 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithPopup
} from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mail, 
  RefreshCw,
  CheckCircle2, 
  AlertCircle,
  Plus,
  ShieldCheck,
  Lock,
  Globe,
  ChevronRight
} from 'lucide-react';
import { validateDisplayName, validateEmail } from '@/lib/validation';
import { rateLimiter } from '@/lib/rateLimiter';
import { useUser } from '@/lib/store';
import { XPWallet } from '@/components/XPWallet';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';
import { SUPPORTED_CURRENCIES, CurrencyOption } from '@/config/currency';
import { scaleAmount, formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user, loading: authLoading, linkedProviders } = useAuthContext();
  const { level } = useUser();

  const profileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [user]);
  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);

  if (authLoading || profileLoading) {
    return <ProfileSkeleton />;
  }

  const isGoogleUser = linkedProviders.includes('google.com');
  
  const memberSince = profile?.createdAt 
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format((profile.createdAt as Timestamp).toDate())
    : 'Recently';

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* IDENTITY CARD */}
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden relative">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={profile?.displayName} className="h-full w-full object-cover" />
              ) : (
                profile?.displayName?.charAt(0).toUpperCase() || 'S'
              )}
            </div>
            <div className="flex-1 text-center md:text-left space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile?.displayName}</h1>
                <Badge variant="secondary" className="w-fit mx-auto md:mx-0 bg-primary/10 text-primary border-none">
                  Level {level}
                </Badge>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-500">
                <Mail className="h-3 w-3" />
                <span>{user?.email}</span>
                {!user?.emailVerified && (
                  <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50">Unverified</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium italic">Member since {memberSince}</p>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <DisplayNameSection profile={profile} uid={user?.uid!} />
            <CurrencySection profile={profile} uid={user?.uid!} />
            <EmailSection user={user} isGoogleUser={isGoogleUser} profile={profile} />
            <PasswordSection user={user} linkedProviders={linkedProviders} />
            <ParentSection profile={profile} uid={user?.uid!} displayName={profile?.displayName} />
          </div>

          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-white p-6">
              <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Progression Overview</h3>
              <div className="scale-95 origin-top-left -mt-4">
                <XPWallet />
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function CurrencySection({ profile, uid }: { profile: any, uid: string }) {
  const { activeCurrency } = useCurrency();
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const handleSelect = async (option: CurrencyOption) => {
    if (option.code === profile.currencyCode) return;

    // Optimistic Update handled by profile listener usually, 
    // but we can set UI immediately if needed.
    const success = await safeUpdateDoc(doc(db, 'users', uid), {
      currencyCode: option.code,
      updatedAt: serverTimestamp()
    });

    if (success) {
      setToast(`Currency updated to ${option.symbol} ${option.code}`);
      setTimeout(() => setToast(null), 2500);
      setIsEditing(false);
    }
  };

  const previewAmount = hoveredCode || profile.currencyCode || 'INR';
  const previewFormatted = formatCurrency(scaleAmount(25000, previewAmount), SUPPORTED_CURRENCIES.find(c => c.code === previewAmount)!);

  return (
    <Card className="border-none shadow-sm bg-white p-6 relative">
      {toast && (
        <div className="absolute top-0 left-0 right-0 p-2 bg-emerald-500 text-white text-xs font-black text-center animate-out fade-out duration-1000 slide-out-to-top transition-all">
          {toast}
        </div>
      )}
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Currency preference</h3>
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Globe className="h-4 w-4 text-slate-400" />
            <span className="font-bold text-slate-700">
              {activeCurrency.symbol} {activeCurrency.code} — {activeCurrency.name}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold" suppressHydrationWarning>Change</Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUPPORTED_CURRENCIES.map(c => (
              <button
                key={c.code}
                onMouseEnter={() => setHoveredCode(c.code)}
                onMouseLeave={() => setHoveredCode(null)}
                onClick={() => handleSelect(c)}
                suppressHydrationWarning
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1",
                  profile.currencyCode === c.code 
                    ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                    : "border-slate-100 hover:border-slate-200"
                )}
              >
                <span className={cn("text-2xl font-black", profile.currencyCode === c.code ? "text-primary" : "text-slate-400")}>{c.symbol}</span>
                <span className="text-[10px] font-black uppercase tracking-widest">{c.code}</span>
                <span className="text-[8px] text-slate-400 font-bold text-center line-clamp-1">{c.name}</span>
              </button>
            ))}
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Preview</p>
            <p className="text-sm font-medium text-slate-600">
              A ₹25,000 monthly salary would show as <span className="font-black text-primary">{previewFormatted}</span>
            </p>
            <p className="text-[9px] text-slate-400 italic">
              Exchange rates are approximate and for learning purposes only.
            </p>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => setIsEditing(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
              suppressHydrationWarning
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}

function DisplayNameSection({ profile, uid }: { profile: any, uid: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    const val = validateDisplayName(newName);
    if (!val.valid) {
      setError(val.error!);
      return;
    }

    if (!rateLimiter.check({ key: 'profile:name:update', maxCalls: 5, windowMs: 3600000 })) {
      setError('Too many updates. Try again in an hour.');
      return;
    }

    setLoading(true);
    setError(null);

    const success = await safeUpdateDoc(doc(db, 'users', uid), {
      displayName: newName,
      updatedAt: serverTimestamp()
    });

    if (success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsEditing(false);
      }, 2000);
    } else {
      setError('Update failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Display name</h3>
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <span className="font-bold text-slate-700">{profile?.displayName}</span>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold" suppressHydrationWarning>Edit</Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            placeholder="New display name"
            className="h-12"
            suppressHydrationWarning
          />
          {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
          {success && <p className="text-xs text-emerald-500 font-bold">Name updated!</p>}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || success} size="sm" className="font-bold" suppressHydrationWarning>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400" suppressHydrationWarning>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function EmailSection({ user, isGoogleUser, profile }: { user: any, isGoogleUser: boolean, profile: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleUpdate = async () => {
    const val = validateEmail(newEmail);
    if (!val.valid) { setError(val.error!); return; }
    if (newEmail === user.email) { setError('Email is the same as current.'); return; }

    setLoading(true);
    setError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      await verifyBeforeUpdateEmail(user, newEmail);
      
      await safeUpdateDoc(doc(db, 'users', user.uid), {
        pendingEmail: newEmail,
        updatedAt: serverTimestamp()
      });
      
      setSent(true);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') setError('Incorrect current password.');
      else setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Email address</h3>
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700">{user?.email}</span>
        {isGoogleUser ? (
          <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200">Google account</Badge>
        ) : !isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold" suppressHydrationWarning>Change</Button>
        ) : null}
      </div>

      {isEditing && !sent && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
          <Input type="email" placeholder="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-12" suppressHydrationWarning />
          <Input type="password" placeholder="Confirm with Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" suppressHydrationWarning />
          {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={loading} size="sm" className="font-bold" suppressHydrationWarning>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Update Email'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400" suppressHydrationWarning>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function PasswordSection({ user, linkedProviders }: { user: any, linkedProviders: string[] }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isGoogleOnly = linkedProviders.includes('google.com') && !linkedProviders.includes('password');
  const isEmailOnly = !linkedProviders.includes('google.com') && linkedProviders.includes('password');
  const isBoth = linkedProviders.includes('google.com') && linkedProviders.includes('password');

  const handleAddPassword = async () => {
    if (newPass !== confirmPass) { setError("Passwords don't match."); return; }
    if (newPass.length < 8) { setError("Password too short."); return; }
    setLoading(true);
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(user.email, newPass);
      await linkWithCredential(user, credential);
      await safeUpdateDoc(doc(db, 'users', user.uid), {
        provider: 'google+email',
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
      window.location.reload();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('This email already has a password account.');
      else if (err.code === 'auth/requires-recent-login') {
        await user.auth.signOut();
        router.push('/login?reason=reauth_required');
      }
      else setError('Failed to add password.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPass !== confirmPass) { setError("New passwords don't match."); return; }
    setLoading(true);
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        await user.auth.signOut();
        router.push('/login?reason=reauth_required');
      } else if (err.code === 'auth/wrong-password') {
        setError('Current password is incorrect.');
      } else {
        setError('Update failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleReauth = async () => {
    setLoading(true);
    try {
      await reauthenticateWithPopup(user, googleProvider);
      await updatePassword(user, newPass);
      setSuccess(true);
    } catch (err: any) {
      setError('Google re-authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Account password</h3>
      
      {isGoogleOnly ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Your account uses Google Sign-In.</p>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 font-bold" suppressHydrationWarning>
              <Plus className="h-4 w-4" /> Add a password
            </Button>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <Input type="password" placeholder="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="h-12" suppressHydrationWarning />
              <Input type="password" placeholder="Confirm Password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="h-12" suppressHydrationWarning />
              {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
              <div className="flex gap-2">
                <Button onClick={handleAddPassword} disabled={loading} size="sm" className="font-bold" suppressHydrationWarning>Link Password</Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400" suppressHydrationWarning>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {!isEditing ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">••••••••••••</span>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold" suppressHydrationWarning>Change</Button>
            </div>
          ) : !success ? (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Re-authenticate to proceed</p>
                <Input type="password" placeholder="Current Password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="h-12 bg-white" suppressHydrationWarning />
                {isBoth && (
                  <Button variant="outline" onClick={handleGoogleReauth} className="w-full gap-2 font-bold h-12 bg-white border-2" suppressHydrationWarning>
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4" alt="" />
                    Confirm with Google
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Input type="password" placeholder="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="h-12" suppressHydrationWarning />
                <Input type="password" placeholder="Confirm New Password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="h-12" suppressHydrationWarning />
              </div>
              {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
              <div className="flex gap-2">
                <Button onClick={handleUpdatePassword} disabled={loading} size="sm" className="font-bold" suppressHydrationWarning>Update Password</Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400" suppressHydrationWarning>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center space-y-2 animate-in zoom-in">
              <p className="text-sm font-bold text-emerald-900">Password updated!</p>
              <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setSuccess(false); }} className="text-emerald-800 font-black uppercase" suppressHydrationWarning>Dismiss</Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function ParentSection({ profile, uid, displayName }: { profile: any, uid: string, displayName: string }) {
  const [parentEmail, setParentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleInvite = async () => {
    const val = validateEmail(parentEmail);
    if (!val.valid) { setError(val.error!); return; }
    setLoading(true);
    setError(null);
    try {
      await safeUpdateDoc(doc(db, 'users', uid), { pendingParentEmail: parentEmail.toLowerCase() });
      setMessage(`Invite sent to ${parentEmail}!`);
    } catch (err) {
      setError('Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Parent connection</h3>
      <div className="space-y-4">
        <p className="text-sm text-slate-500 leading-relaxed">Invite a parent to monitor your learning progress and unlock badges.</p>
        <div className="flex gap-2">
          <Input type="email" placeholder="Parent's email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="h-12" suppressHydrationWarning />
          <Button onClick={handleInvite} disabled={loading} className="font-bold" suppressHydrationWarning>Invite</Button>
        </div>
        {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
        {message && <p className="text-xs text-emerald-600 font-bold">{message}</p>}
      </div>
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /></div>
          <div className="space-y-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>
        </div>
      </div>
    </div>
  );
}
