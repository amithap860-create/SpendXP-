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
  Plus,
  ShieldCheck,
  Globe,
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
import { SUPPORTED_CURRENCIES, CurrencyOption, DEFAULT_CURRENCY } from '@/config/currency';
import { scaleAmount, formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { SectionErrorBoundary } from '@/components/profile/SectionErrorBoundary';

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

  const memberSince = profile?.createdAt 
    ? new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format((profile.createdAt as Timestamp).toDate())
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
            <SectionErrorBoundary sectionName="Display name">
              <DisplayNameSection profile={profile} uid={user?.uid!} />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Currency">
              <CurrencySection profile={profile} uid={user?.uid!} />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Email address">
              <EmailSection 
                user={user as User} 
                profile={profile} 
                reauthMethod={reauthMethod} 
                providerRefreshKey={providerRefreshKey}
              />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Account password">
              <PasswordSection 
                user={user as User} 
                linkedProviders={linkedProviders} 
                onRefresh={() => setProviderRefreshKey(k => k + 1)} 
              />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Parent connection">
              <ParentSection profile={profile} uid={user?.uid!} />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Danger zone">
              <DangerZone user={user as User} reauthMethod={reauthMethod} />
            </SectionErrorBoundary>
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
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleSelect = async (option: CurrencyOption) => {
    if (!mounted || option.code === profile.currencyCode) return;

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

  if (!mounted) {
    return <Skeleton className="h-32 w-full rounded-2xl" />;
  }

  const previewCode = hoveredCode || profile.currencyCode || 'INR';
  const previewOption = SUPPORTED_CURRENCIES.find(c => c.code === previewCode) || DEFAULT_CURRENCY;
  const previewFormatted = formatCurrency(scaleAmount(25000, previewCode), previewOption);

  return (
    <Card className="border-none shadow-sm bg-white p-6 relative overflow-hidden">
      {toast && (
        <div className="absolute top-0 left-0 right-0 p-2 bg-emerald-500 text-white text-[10px] font-black text-center z-10 animate-in slide-in-from-top duration-300">
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
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold">Change</Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUPPORTED_CURRENCIES.map(c => (
              <button
                key={c.code}
                onClick={() => {
                  setHoveredCode(c.code);
                  handleSelect(c);
                }}
                suppressHydrationWarning
                className={cn(
                  "p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 active:scale-95",
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
              onClick={() => {
                setIsEditing(false);
                setHoveredCode(null);
              }}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 uppercase tracking-widest"
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
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold">Edit</Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <Input 
            value={newName} 
            onChange={(e) => setNewName(e.target.value)} 
            placeholder="New display name"
            className="h-12 text-base"
            suppressHydrationWarning
          />
          {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
          {success && <p className="text-xs text-emerald-500 font-bold">Name updated!</p>}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || success} size="sm" className="font-bold">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400">Cancel</Button>
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

  useEffect(() => {
    if (profile?.pendingEmail && profile.pendingEmail !== user.email && emailChangeStep === 'idle') {
      setNewEmail(profile.pendingEmail);
      setEmailChangeStep('pending');
    }
  }, [profile, user.email, emailChangeStep]);

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
      setEmailChangeError('Could not verify your identity.');
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
        </div>
      )}

      {emailChangeStep === 'form' && (
        <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
          <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">New email address</Label>
          <Input 
            type="email" 
            value={newEmail} 
            onChange={(e) => setNewEmail(e.target.value)} 
            placeholder="new-email@example.com"
            className="h-12 text-base"
            suppressHydrationWarning
          />
          {emailChangeError && <p className="text-xs text-rose-500 font-bold">{emailChangeError}</p>}
          <div className="flex gap-2">
            <Button onClick={handleContinue} size="sm" className="font-bold">Continue</Button>
            <Button variant="ghost" size="sm" onClick={() => setEmailChangeStep('idle')} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}

      {emailChangeStep === 'reauth' && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 text-sm">Confirm it's you</h4>
            <p className="text-xs text-slate-500">We need to verify your identity before changing your email.</p>
          </div>

          {(reauthMethod === 'password' || reauthMethod === 'both') && (
            <div className="space-y-3">
              <Input 
                type="password" 
                value={reauthPassword} 
                onChange={(e) => setReauthPassword(e.target.value)}
                placeholder="Current Password"
                className="h-12 text-base"
                suppressHydrationWarning
              />
              <Button 
                onClick={async () => {
                  const ok = await reauthWithPassword(reauthPassword);
                  if (ok) await proceedWithEmailChange();
                }} 
                disabled={emailChangeLoading || !reauthPassword} 
                className="w-full font-black text-sm"
              >
                {emailChangeLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirm with Password'}
              </Button>
            </div>
          )}

          {reauthMethod === 'both' && <div className="text-center text-[10px] uppercase font-bold text-slate-400">or</div>}

          {(reauthMethod === 'google' || reauthMethod === 'both') && (
            <Button 
              variant="outline" 
              onClick={async () => {
                const ok = await reauthWithGoogle();
                if (ok) await proceedWithEmailChange();
              }}
              disabled={emailChangeLoading}
              className="w-full h-12 gap-3 border-2 font-bold bg-white text-sm"
            >
              Confirm with Google
            </Button>
          )}

          {emailChangeError && <p className="text-xs text-rose-500 font-bold text-center">{emailChangeError}</p>}
          
          <div className="text-center">
            <button onClick={() => setEmailChangeStep('form')} className="text-xs font-bold text-slate-400 hover:underline">Back</button>
          </div>
        </div>
      )}

      {emailChangeStep === 'pending' && (
        <div className="p-4 bg-teal-50 border-2 border-teal-100 rounded-2xl space-y-3">
          <div className="flex items-center gap-2 text-teal-700 font-bold text-sm">
            <Mail className="h-4 w-4" /> Verification sent
          </div>
          <p className="text-xs text-teal-800 leading-relaxed font-medium">
            Verify <span className="font-black underline">{newEmail}</span> to complete the change.
          </p>
        </div>
      )}

      {emailChangeStep === 'success' && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-100 rounded-2xl flex items-center gap-3 animate-in zoom-in duration-500">
          <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="font-bold text-emerald-900 text-sm">Email updated!</div>
        </div>
      )}
    </Card>
  );
}

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

  const handleUpdatePassword = async () => {
    if (newPass !== confirmPass) { setError("Passwords don't match."); return; }
    const validation = validatePassword(newPass);
    if (!validation.valid) { setError(validation.error); return; }

    setLoading(true);
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      setSuccess('Password updated!');
      setIsEditing(false);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        await auth.signOut();
        router.push('/login?reason=reauth_required');
      } else setError('Incorrect current password.');
    } finally { setLoading(false); }
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Account password</h3>
      {success && <p className="mb-4 text-xs text-emerald-600 font-bold">{success}</p>}
      
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">••••••••••••</span>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold">Change</Button>
        </div>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <Input type="password" placeholder="Current Password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="h-12 text-base" />
          <Input type="password" placeholder="New Password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="h-12 text-base" />
          {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleUpdatePassword} disabled={loading} size="sm" className="font-bold">Update</Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400">Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function ParentSection({ profile, uid }: { profile: any, uid: string }) {
  const [parentEmail, setParentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleInvite = async () => {
    const val = validateEmail(parentEmail);
    if (!val.valid) { setError(val.error!); return; }
    setLoading(true);
    try {
      await safeUpdateDoc(doc(db, 'users', uid), { pendingParentEmail: parentEmail.toLowerCase() });
      setMessage(`Invite sent!`);
    } catch (err) { setError('Failed to send invite.'); }
    finally { setLoading(false); }
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Parent connection</h3>
      <div className="space-y-4">
        <p className="text-xs text-slate-500 leading-relaxed">Invite a parent to monitor your learning journey.</p>
        <div className="flex gap-2">
          <Input type="email" placeholder="Parent's email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} className="h-12 text-base" />
          <Button onClick={handleInvite} disabled={loading} className="font-bold">Invite</Button>
        </div>
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
    try {
      if (reauthMethod === 'google') {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        const credential = EmailAuthProvider.credential(user.email!, password);
        const { reauthenticateWithCredential } = await import('firebase/auth');
        await reauthenticateWithCredential(user, credential);
      }
      await deleteDoc(doc(db, 'users', user.uid));
      await user.delete();
      window.location.href = '/login?reason=account_deleted';
    } catch (err: any) {
      setError('Failed to delete account. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-rose-50/50 p-6 border-rose-100 border">
      <h3 className="text-[15px] font-bold text-rose-600 border-b border-rose-100 pb-3 mb-4">Danger Zone</h3>
      
      {step === 1 ? (
        <Button 
          variant="outline" 
          onClick={() => setStep(2)} 
          className="w-full h-12 border-rose-200 text-rose-600 hover:bg-rose-100 font-bold gap-2 text-sm"
        >
          <Trash2 className="h-4 w-4" /> Delete Account
        </Button>
      ) : (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <p className="text-xs text-rose-700 font-bold">This is permanent. Confirm to proceed.</p>
          {reauthMethod === 'password' && <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 bg-white text-base" placeholder="Password" />}
          {error && <p className="text-xs text-rose-600 font-bold">{error}</p>}
          <Button onClick={handleDelete} disabled={loading} className="w-full h-12 bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-xs">Confirm Deletion</Button>
          <Button variant="ghost" onClick={() => setStep(1)} className="w-full text-xs">Cancel</Button>
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
