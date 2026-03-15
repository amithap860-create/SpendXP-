
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { 
  useDoc, 
  useMemoFirebase,
  safeUpdateDoc,
  db,
  auth,
  recordFailedAttempt
} from '@/firebase';
import { 
  doc, 
  serverTimestamp, 
  Timestamp,
  deleteDoc
} from 'firebase/firestore';
import { 
  verifyBeforeUpdateEmail, 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  User
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
  ChevronRight,
  Info,
  Trash2,
  ArrowRight,
  X
} from 'lucide-react';
import { validateDisplayName, validateEmail, validatePassword } from '@/lib/validation';
import { rateLimiter } from '@/lib/rateLimiter';
import { useUser } from '@/lib/store';
import { XPWallet } from '@/components/XPWallet';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';
import { SUPPORTED_CURRENCIES, CurrencyOption } from '@/config/currency';
import { scaleAmount, formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';

type ReauthMethod = 'password' | 'google' | 'both';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuthContext();
  const { level } = useUser();
  const [providerRefreshKey, setProviderRefreshKey] = useState(0);

  const profileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [user]);
  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);

  const linkedProviders = useMemo(() => {
    if (!user) return [];
    return user.providerData.map(p => p.providerId);
  }, [user, providerRefreshKey]);

  const hasPassword = linkedProviders.includes('password');
  const hasGoogle = linkedProviders.includes('google.com');

  const reauthMethod = useMemo((): ReauthMethod => {
    if (hasGoogle && !hasPassword) return 'google';
    if (!hasGoogle && hasPassword) return 'password';
    if (hasGoogle && hasPassword) return 'both';
    return 'google';
  }, [hasGoogle, hasPassword]);

  if (authLoading || profileLoading) {
    return <ProfileSkeleton />;
  }

  const isGoogleUser = linkedProviders.includes('google.com');
  
  const memberSince = profile?.createdAt 
    ? new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format((profile.createdAt as Timestamp).toDate())
    : 'Recently';

  return (
    <div className="flex min-h-screen bg-background pb-20">
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
            <EmailSection 
              user={user as User} 
              profile={profile} 
              reauthMethod={reauthMethod} 
              providerRefreshKey={providerRefreshKey}
            />
            <PasswordSection 
              user={user as User} 
              linkedProviders={linkedProviders} 
              onRefresh={() => setProviderRefreshKey(k => k + 1)} 
            />
            <ParentSection profile={profile} uid={user?.uid!} displayName={profile?.displayName} />
            <DangerZone user={user as User} reauthMethod={reauthMethod} />
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

type EmailChangeStep = 'idle' | 'form' | 'reauth' | 'pending' | 'success';

function EmailSection({ user, profile, reauthMethod, providerRefreshKey }: { user: User, profile: any, reauthMethod: ReauthMethod, providerRefreshKey: number }) {
  const [emailChangeStep, setEmailChangeStep] = useState<EmailChangeStep>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [reauthPassword, setReauthPassword] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Load check for pending change
  useEffect(() => {
    if (profile?.pendingEmail && profile.pendingEmail !== user.email && emailChangeStep === 'idle') {
      setNewEmail(profile.pendingEmail);
      setEmailChangeStep('pending');
    }
  }, [profile, user.email, emailChangeStep]);

  // Poller for pending step
  useEffect(() => {
    if (emailChangeStep !== 'pending') return;

    const interval = setInterval(async () => {
      await user.reload();
      if (user.email === newEmail) {
        setEmailChangeStep('success');
        clearInterval(interval);
        await safeUpdateDoc(doc(db, 'users', user.uid), { pendingEmail: null });
        setTimeout(() => {
          setEmailChangeStep('idle');
          setNewEmail('');
        }, 3000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [emailChangeStep, newEmail, user]);

  // Timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleContinue = () => {
    const val = validateEmail(newEmail);
    if (!val.valid) { setEmailChangeError(val.error!); return; }
    if (newEmail === user.email) { setEmailChangeError('Please enter a different email address.'); return; }
    setEmailChangeError('');
    setEmailChangeStep('reauth');
  };

  const reauthWithGoogle = async (): Promise<boolean> => {
    setEmailChangeLoading(true);
    setEmailChangeError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await reauthenticateWithPopup(user, provider);
      setEmailChangeLoading(false);
      return true;
    } catch (err: any) {
      setEmailChangeLoading(false);
      if (err.code === 'auth/popup-closed-by-user') setEmailChangeError('Sign-in window was closed. Please try again.');
      else if (err.code === 'auth/popup-blocked') setEmailChangeError('Pop-up was blocked. Please allow pop-ups and try again.');
      else setEmailChangeError('Could not verify your identity.');
      return false;
    }
  };

  const reauthWithPassword = async (password: string): Promise<boolean> => {
    setEmailChangeLoading(true);
    setEmailChangeError('');
    try {
      const credential = EmailAuthProvider.credential(user.email!, password);
      const { reauthenticateWithCredential } = await import('firebase/auth');
      await reauthenticateWithCredential(user, credential);
      setEmailChangeLoading(false);
      return true;
    } catch (err: any) {
      setEmailChangeLoading(false);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setEmailChangeError('Incorrect password.');
        await recordFailedAttempt(db, user.email!);
      } else setEmailChangeError('Could not verify your identity.');
      return false;
    }
  };

  const proceedWithEmailChange = async () => {
    setEmailChangeLoading(true);
    setEmailChangeError('');
    try {
      await verifyBeforeUpdateEmail(user, newEmail);
      await safeUpdateDoc(doc(db, 'users', user.uid), {
        pendingEmail: newEmail,
        updatedAt: serverTimestamp()
      });
      setEmailChangeStep('pending');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setEmailChangeError('An account with this email already exists.');
      else setEmailChangeError('Could not send verification email. Please try again.');
    } finally {
      setEmailChangeLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    if (!rateLimiter.check({ key: 'email:change:resend', maxCalls: 1, windowMs: 60000 })) return;
    try {
      await verifyBeforeUpdateEmail(user, newEmail);
      setResendCooldown(60);
    } catch (err) {
      setEmailChangeError('Failed to resend email.');
    }
  };

  const cancelEmailChange = async () => {
    await safeUpdateDoc(doc(db, 'users', user.uid), { pendingEmail: null });
    setEmailChangeStep('idle');
    setNewEmail('');
    setReauthPassword('');
    setEmailChangeError('');
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Email address</h3>
      
      {emailChangeStep === 'idle' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-700">{user.email}</span>
              {reauthMethod === 'google' && <Badge variant="secondary" className="bg-slate-50 text-slate-400 text-[10px] border-none uppercase">Google account</Badge>}
            </div>
            <Button variant="ghost" size="sm" onClick={() => setEmailChangeStep('form')} className="text-primary font-bold">Change</Button>
          </div>
          <p className="text-xs text-slate-400 italic">
            You'll confirm this change with {reauthMethod === 'google' ? 'Google Sign-In' : 'your password'}.
          </p>
        </div>
      )}

      {emailChangeStep === 'form' && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Enter your new email address</Label>
          <Input 
            type="email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)} 
            placeholder="new-email@example.com"
            className="h-12 text-base"
            suppressHydrationWarning
          />
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            We'll send a verification link to this address. Your email won't change until you click it.
          </p>
          {emailChangeError && <p className="text-xs text-rose-500 font-bold">{emailChangeError}</p>}
          <div className="flex gap-2">
            <Button onClick={handleContinue} size="sm" className="font-bold">Continue <ArrowRight className="h-4 w-4 ml-1" /></Button>
            <Button variant="ghost" size="sm" onClick={() => setEmailChangeStep('idle')} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {emailChangeStep === 'reauth' && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900">Confirm it's you</h4>
            <p className="text-xs text-slate-500">We need to verify your identity before changing your email.</p>
          </div>

          {(reauthMethod === 'password' || reauthMethod === 'both') && (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400">Enter current password</Label>
              <Input 
                type="password" 
                value={reauthPassword} 
                onChange={(e) => setReauthPassword(e.target.value)}
                className="h-12 text-base"
                suppressHydrationWarning
              />
              <Button 
                onClick={async () => {
                  const ok = await reauthWithPassword(reauthPassword);
                  if (ok) await proceedWithEmailChange();
                }} 
                disabled={emailChangeLoading || !reauthPassword} 
                className="w-full font-black"
              >
                {emailChangeLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirm with Password'}
              </Button>
            </div>
          )}

          {reauthMethod === 'both' && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white px-2 text-slate-400 font-bold">or</span></div>
            </div>
          )}

          {(reauthMethod === 'google' || reauthMethod === 'both') && (
            <Button 
              variant="outline" 
              onClick={async () => {
                const ok = await reauthWithGoogle();
                if (ok) await proceedWithEmailChange();
              }}
              disabled={emailChangeLoading}
              className="w-full h-12 gap-3 border-2 font-bold bg-white"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-5 w-5" alt="" />
              {emailChangeLoading ? 'Verifying...' : 'Confirm with Google'}
            </Button>
          )}

          {emailChangeError && <p className="text-xs text-rose-500 font-bold text-center">{emailChangeError}</p>}
          
          <div className="text-center">
            <button onClick={() => setEmailChangeStep('form')} className="text-xs font-bold text-slate-400 hover:underline">Back</button>
          </div>
        </div>
      )}

      {emailChangeStep === 'pending' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 bg-teal-50 border-2 border-teal-100 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
              <Mail className="h-4 w-4" /> Verification email sent
            </div>
            <p className="text-xs text-teal-800 leading-relaxed font-medium">
              We sent a link to <span className="font-black underline">{newEmail}</span>. Click it to confirm the change. Your current email stays active until you verify the new one.
            </p>
            <div className="flex gap-4 pt-1">
              <button 
                onClick={handleResend} 
                disabled={resendCooldown > 0} 
                className={cn("text-[10px] font-black uppercase tracking-widest transition-opacity", resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : "hover:underline")}
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend link'}
              </button>
              <button onClick={cancelEmailChange} className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:underline">Cancel change</button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
            <RefreshCw className="h-3 w-3 animate-spin" /> Waiting for verification...
          </div>
        </div>
      )}

      {emailChangeStep === 'success' && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-500">
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="font-bold text-emerald-900">Email updated to {newEmail}!</div>
        </div>
      )}
    </Card>
  );
}

type PasswordSectionState = 'loading' | 'google_only' | 'email_only' | 'google_and_password' | 'no_provider';

function PasswordSection({ user, linkedProviders, onRefresh }: { user: User, linkedProviders: string[], onRefresh: () => void }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasPassword = linkedProviders.includes('password');
  const hasGoogle = linkedProviders.includes('google.com');

  const passwordState: PasswordSectionState = useMemo(() => {
    if (!user) return 'loading';
    if (hasGoogle && !hasPassword) return 'google_only';
    if (!hasGoogle && hasPassword) return 'email_only';
    if (hasGoogle && hasPassword) return 'google_and_password';
    return 'no_provider';
  }, [user, hasGoogle, hasPassword]);

  const passwordValidation = useMemo(() => validatePassword(newPass), [newPass]);

  const handleAddPassword = async () => {
    if (newPass !== confirmPass) { setError("Passwords don't match."); return; }
    const validation = validatePassword(newPass);
    if (!validation.valid) { setError(validation.error); return; }

    setLoading(true);
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(user.email!, newPass);
      await linkWithCredential(user, credential);
      await safeUpdateDoc(doc(db, 'users', user.uid), {
        provider: 'google+email',
        updatedAt: serverTimestamp()
      });
      await user.reload();
      onRefresh();
      setSuccess('Password set! You can now sign in with either Google or email.');
      setIsEditing(false);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('This email already has a password account.');
      else if (err.code === 'auth/requires-recent-login') {
        try {
          const provider = new GoogleAuthProvider();
          await reauthenticateWithPopup(user, provider);
          const credential = EmailAuthProvider.credential(user.email!, newPass);
          await linkWithCredential(user, credential);
          await user.reload();
          onRefresh();
          setSuccess('Password set successfully!');
          setIsEditing(false);
        } catch (reAuthErr) { setError('Please sign out and back in to add a password.'); }
      } else setError('Failed to add password.');
    } finally { setLoading(false); }
  };

  const handleUpdatePassword = async () => {
    if (newPass !== confirmPass) { setError("New passwords don't match."); return; }
    const validation = validatePassword(newPass);
    if (!validation.valid) { setError(validation.error); return; }

    setLoading(true);
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      setSuccess('Password updated successfully!');
      setIsEditing(false);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        await auth.signOut();
        router.push('/login?reason=reauth_required');
      } else if (err.code === 'auth/wrong-password') setError('Current password is incorrect.');
      else setError('Update failed. Please try again.');
    } finally { setLoading(false); }
  };

  const handleGoogleReauth = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      await updatePassword(user, newPass);
      setSuccess('Password updated with Google confirmation!');
      setIsEditing(false);
    } catch (err: any) { setError('Google re-authentication failed.'); }
    finally { setLoading(false); }
  };

  if (passwordState === 'loading') {
    return (
      <Card className="border-none shadow-sm bg-white p-6 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-full" />
      </Card>
    );
  }

  if (passwordState === 'no_provider') return null;

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Account password</h3>
      
      {success && (
        <div className="mb-4 p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> {success}
        </div>
      )}

      {passwordState === 'google_only' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
            <Info className="h-5 w-5 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600 leading-tight">You signed in with Google. You haven't set a password yet.</p>
          </div>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" className="gap-2 font-bold" suppressHydrationWarning>
              <Plus className="h-4 w-4" /> Add a password
            </Button>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div className="space-y-3">
                <Input type="password" placeholder="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="h-12" suppressHydrationWarning />
                {newPass && (
                  <div className="flex gap-1 h-1 px-1">
                    <div className={cn("flex-1 rounded-full", passwordValidation.strength === 'weak' ? "bg-rose-500" : "bg-emerald-500")} />
                    <div className={cn("flex-1 rounded-full", ['fair', 'strong'].includes(passwordValidation.strength) ? "bg-emerald-500" : "bg-slate-100")} />
                    <div className={cn("flex-1 rounded-full", passwordValidation.strength === 'strong' ? "bg-emerald-500" : "bg-slate-100")} />
                  </div>
                )}
                <Input type="password" placeholder="Confirm Password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="h-12" suppressHydrationWarning />
              </div>
              {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
              <div className="flex gap-2">
                <Button onClick={handleAddPassword} disabled={loading} size="sm" className="font-bold">Set Password</Button>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400">Cancel</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {(passwordState === 'email_only' || passwordState === 'google_and_password') && (
        <div className="space-y-4">
          {passwordState === 'google_and_password' && (
            <Badge variant="secondary" className="bg-teal-50 text-teal-700 border-teal-100 gap-1 font-bold">
              <ShieldCheck className="h-3 w-3" /> Google + Password linked
            </Badge>
          )}
          
          {!isEditing ? (
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">••••••••••••</span>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold">Change</Button>
            </div>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm identity</p>
                <Input type="password" placeholder="Current Password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="h-12 bg-white" suppressHydrationWarning />
                {passwordState === 'google_and_password' && (
                  <Button variant="outline" onClick={handleGoogleReauth} className="w-full gap-2 font-bold h-12 bg-white border-2">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4" alt="" />
                    Or: Confirm with Google
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                <Input type="password" placeholder="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="h-12" suppressHydrationWarning />
                <Input type="password" placeholder="Confirm New Password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="h-12" suppressHydrationWarning />
              </div>
              {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
              <div className="flex gap-2">
                <Button onClick={handleUpdatePassword} disabled={loading} size="sm" className="font-bold">Update Password</Button>
                <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setError(null); }} className="text-slate-400">Cancel</Button>
              </div>
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
    } catch (err) { setError('Failed to send invite.'); }
    finally { setLoading(false); }
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Parent connection</h3>
      <div className="space-y-4">
        <p className="text-sm text-slate-500 leading-relaxed">Invite a parent to monitor your learning progress and unlock badges.</p>
        <div className="flex gap-2">
          <Input type="email" placeholder="Parent's email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="h-12" suppressHydrationWarning />
          <Button onClick={handleInvite} disabled={loading} className="font-bold">Invite</Button>
        </div>
        {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
        {message && <p className="text-xs text-emerald-600 font-bold">{message}</p>}
      </div>
    </Card>
  );
}

function DangerZone({ user, reauthMethod }: { user: User, reauthMethod: ReauthMethod }) {
  const [step, setStep] = useState(1);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      let success = false;
      if (reauthMethod === 'google') {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await reauthenticateWithPopup(user, provider);
        success = true;
      } else {
        const credential = EmailAuthProvider.credential(user.email!, password);
        await reauthenticateWithCredential(user, credential);
        success = true;
      }

      if (success) {
        await deleteDoc(doc(db, 'users', user.uid));
        await user.delete();
        window.location.href = '/login?reason=account_deleted';
      }
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') setError('Incorrect password.');
      else if (err.code === 'auth/requires-recent-login') setError('Please sign out and sign back in to delete your account.');
      else setError('Failed to delete account. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-rose-50/50 p-6 border-rose-100 border">
      <h3 className="text-[15px] font-bold text-rose-600 border-b border-rose-100 pb-3 mb-4">Danger Zone</h3>
      
      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-xs text-rose-700 font-medium leading-relaxed">
            Deleting your account is permanent. You will lose all your XP, badges, and progress.
          </p>
          <Button 
            variant="outline" 
            onClick={() => setStep(2)} 
            className="w-full h-12 border-rose-200 text-rose-600 hover:bg-rose-100 hover:text-rose-700 font-bold gap-2"
          >
            <Trash2 className="h-4 w-4" /> Delete My Account
          </Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-rose-900">Final Confirmation</h4>
            <button onClick={() => { setStep(1); setError(''); }} className="text-rose-400 hover:text-rose-600"><X className="h-4 w-4" /></button>
          </div>
          
          {reauthMethod === 'password' ? (
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-rose-400">Enter your password to proceed</Label>
              <Input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-white border-rose-200"
                placeholder="Password"
                suppressHydrationWarning
              />
            </div>
          ) : (
            <p className="text-xs text-rose-700 font-bold bg-rose-100/50 p-3 rounded-lg">
              Confirm your identity with Google to permanently delete your data.
            </p>
          )}

          {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}

          <Button 
            onClick={handleDelete} 
            disabled={loading || (reauthMethod === 'password' && !password)} 
            className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest gap-2 shadow-lg shadow-rose-200"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            Confirm Permanent Deletion
          </Button>
        </div>
      )}
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen bg-background p-8">
      <div className="max-w-6xl auto w-full space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /></div>
          <div className="space-y-8"><Skeleton className="h-64 w-full rounded-2xl" /></div>
        </div>
      </div>
    </div>
  );
}
