
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { 
  safeUpdateDoc,
  safeGetDoc,
  db,
  auth,
  recordFailedAttempt
} from '@/firebase';
import { 
  doc, 
  serverTimestamp, 
  Timestamp,
  deleteDoc,
  writeBatch,
  collection,
  getDocs
} from 'firebase/firestore';
import { 
  verifyBeforeUpdateEmail, 
  updatePassword,
  EmailAuthProvider,
  linkWithCredential,
  reauthenticateWithPopup,
  GoogleAuthProvider,
  User,
  reauthenticateWithCredential
} from 'firebase/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
  X,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { validateDisplayName, validateEmail, validatePassword } from '@/lib/validation';
import { rateLimiter } from '@/lib/rateLimiter';
import { useUser, type UserProfile } from '@/lib/store';
import { XPWallet } from '@/components/XPWallet';
import { useRouter } from 'next/navigation';
import { useCurrency } from '@/hooks/useCurrency';
import { SUPPORTED_CURRENCIES, CurrencyOption, DEFAULT_CURRENCY } from '@/config/currency';
import { scaleAmount, formatCurrency } from '@/lib/formatCurrency';
import { cn } from '@/lib/utils';
import { SectionErrorBoundary } from '@/components/profile/SectionErrorBoundary';
import BugReport from '@/components/BugReport';

type FirestoreUserProfile = UserProfile & {
  currencyCode?: string;
  pendingEmail?: string | null;
  createdAt?: Timestamp;
  pendingParentEmail?: string;
  parentLinked?: boolean;
  emailVerified?: boolean;
  ageGroup?: string;
  interests?: string[];
};

type ReauthMethod = 'password' | 'google' | 'both';
type EmailChangeStep = 'idle' | 'form' | 'reauth' | 'pending' | 'success';
type DeletionReauthState = 'idle' | 'confirm_warning' | 'reauth' | 'type_delete' | 'deleting' | 'error';

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuthContext();
  const { level } = useUser();
  const router = useRouter();
  const [providerRefreshKey, setProviderRefreshKey] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profile, setProfile] = useState<FirestoreUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    let cancelled = false;
    setProfileLoading(true);
    const loadProfile = async () => {
      try {
        const data = await safeGetDoc(doc(db, 'users', user.uid) as any);
        if (!cancelled) {
          setProfile(data as any);
        }
      } catch (err) {
        console.error('Profile load error:', err);
      } finally {
        if (!cancelled) {
          setProfileLoading(false);
        }
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user]);

  function getActualProviders(): {
    hasPassword: boolean
    hasGoogle: boolean
    hasCustom: boolean
    hasAny: boolean
    list: string[]
  } {
    const providerData = auth.currentUser?.providerData ?? [];
    const list = providerData.map(p => p.providerId);
    return {
      hasPassword: list.includes('password'),
      hasGoogle: list.includes('google.com'),
      hasCustom: list.includes('custom') || list.length === 0,
      hasAny: list.length > 0,
      list,
    };
  }

  const providers = useMemo(() => getActualProviders(), [providerRefreshKey, user]);

  const reauthMethod = useMemo((): ReauthMethod => {
    if (providers.hasGoogle && !providers.hasPassword) return 'google';
    if (!providers.hasGoogle && providers.hasPassword) return 'password';
    if (providers.hasGoogle && providers.hasPassword) return 'both';
    return 'google';
  }, [providers]);

  if (authLoading || profileLoading) {
    return <ProfileSkeleton />;
  }

  const memberSince = profile?.createdAt
    ? new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format((profile?.createdAt as Timestamp).toDate())
    : 'Recently';

  return (
    <div className="flex min-h-screen bg-background pb-20">
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        {/* IDENTITY CARD */}
        <Card className="border-none shadow-sm overflow-hidden bg-white">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-black shadow-lg overflow-hidden relative">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={profile?.displayName ?? ''} className="h-full w-full object-cover" />
              ) : (
                (profile?.displayName ?? 'S').charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 text-center md:text-left space-y-1">
              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{profile?.displayName ?? ''}</h1>
                <Badge variant="secondary" className="w-fit mx-auto md:mx-0 bg-primary/10 text-primary border-none">
                  Level {level}
                </Badge>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-500">
                <Mail className="h-3 w-3" />
                <span>{user?.email ?? ''}</span>
                {user != null && !(user.emailVerified ?? false) && (
                  <Badge variant="outline" className="text-[10px] border-amber-200 text-amber-600 bg-amber-50">Unverified</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 font-medium italic">Member since {memberSince}</p>
            </div>
          </CardContent>
        </Card>

        {/* Bug Report Button */}
        <div className="flex justify-center md:justify-start">
          <BugReport />
        </div>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl font-bold text-sm flex items-center gap-2 animate-in fade-in">
            <AlertTriangle className="h-4 w-4" /> {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="h-4 w-4" /></button>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl font-bold text-sm flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" /> {success}
            <button onClick={() => setSuccess(null)} className="ml-auto"><X className="h-4 w-4" /></button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            <SectionErrorBoundary sectionName="Display name">
              <DisplayNameSection user={user} profile={profile} uid={user?.uid ?? ''} />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Currency">
              <CurrencySection profile={profile} uid={user?.uid ?? ''} />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Email address">
              <EmailSection 
                user={user} 
                profile={profile} 
                reauthMethod={reauthMethod} 
                providerRefreshKey={providerRefreshKey}
              />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Account password">
              <PasswordContainer 
                user={user} 
                profile={profile}
                providers={providers} 
                onRefresh={() => setProviderRefreshKey(k => k + 1)}
              />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Parent connection">
              <ParentSection user={user} profile={profile} uid={user?.uid ?? ''} />
            </SectionErrorBoundary>

            <SectionErrorBoundary sectionName="Danger zone">
              <DangerZone 
                user={user} 
                profile={profile}
                reauthMethod={reauthMethod} 
                providers={providers}
                router={router}
              />
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

function PasswordContainer({ user, profile, providers, onRefresh }: { 
  user: User | null, 
  profile: FirestoreUserProfile | null,
  providers: { hasPassword: boolean }, 
  onRefresh: () => void
}) {
  const [showSetPasswordForm, setShowSetPasswordForm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState('');

  useEffect(() => {
    if (!passwordSuccess) return;
    const t = setTimeout(() => setPasswordSuccess(''), 4000);
    return () => clearTimeout(t);
  }, [passwordSuccess]);

  function closePasswordForm() {
    setShowSetPasswordForm(false);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setConfirmError('');
    setPasswordLoading(false);
  }

  async function setPasswordForFirstTime(): Promise<void> {
    const accountEmail = user?.email ?? '';
    if (!user || !accountEmail) {
      setPasswordError('Could not find your account email. Please sign out and sign back in.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      setPasswordError(validation.error ?? 'Invalid password.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');

    try {
      const credential = EmailAuthProvider.credential(accountEmail, newPassword);
      await linkWithCredential(user, credential);
      await user.reload();
      
      await safeUpdateDoc(doc(db, 'users', user.uid), {
        provider: 'email+password',
        updatedAt: serverTimestamp()
      });

      onRefresh();
      setPasswordSuccess(`Password set! You can now sign in with ${accountEmail} and this password.`);
      setShowSetPasswordForm(false);
      setPasswordLoading(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setPasswordError('This email already has a password linked. Try signing in with email and password.');
      } else if (err.code === 'auth/weak-password') {
        setPasswordError('Password is too weak. Use at least 8 characters with numbers and letters.');
      } else if (err.code === 'auth/requires-recent-login') {
        setPasswordError('Your session has expired. Please sign out, sign back in with Google, then set your password again.');
      } else if (err.code === 'auth/provider-already-linked') {
        onRefresh();
        setShowSetPasswordForm(false);
        setPasswordError('');
      } else {
        setPasswordError('Something went wrong. Please try again.');
        console.error('[SpendXP] setPasswordForFirstTime error:', err);
      }
    }
  }

  if (!providers.hasPassword) {
    return (
      <Card className="border-none shadow-sm bg-white p-6">
        <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Account password</h3>
        
        {!showSetPasswordForm ? (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600 font-medium">You haven't set a password yet.</p>
            </div>
            <Button onClick={() => setShowSetPasswordForm(true)} className="w-full font-black h-12 bg-primary">Set a password</Button>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-top-2">
            <p className="text-[13px] text-slate-400 font-medium">Setting password for: <span className="font-bold">{user?.email ?? ''}</span></p>
            
            <div className="space-y-2">
              <Input 
                type="password" 
                placeholder="New password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 text-base"
                autoComplete="new-password"
                suppressHydrationWarning
              />
              <PasswordStrengthBars password={newPassword} />
            </div>

            <div className="space-y-1">
              <Input 
                type="password" 
                placeholder="Confirm password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onBlur={() => setConfirmError(confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : '')}
                className={cn("h-12 text-base", confirmError ? "border-rose-500" : "")}
                autoComplete="new-password"
                suppressHydrationWarning
              />
              {confirmError && <p className="text-[11px] text-rose-600 font-bold">{confirmError}</p>}
            </div>

            <Button 
              onClick={setPasswordForFirstTime} 
              disabled={passwordLoading || !newPassword || newPassword !== confirmPassword}
              className="w-full h-12 bg-primary font-black"
            >
              {passwordLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Set password'}
            </Button>
            
            <div className="text-center">
              <button onClick={closePasswordForm} className="text-xs font-bold text-slate-400 hover:underline">Cancel</button>
            </div>
          </div>
        )}

        {passwordSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-[13px] text-[#085041] animate-in fade-in">
            {passwordSuccess}
          </div>
        )}
        
        {passwordError && (
          <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-[13px] text-[#712B13] animate-in fade-in">
            {passwordError}
          </div>
        )}
      </Card>
    );
  }

  return <PasswordSection user={user} profile={profile} onRefresh={onRefresh} />;
}

function PasswordStrengthBars({ password }: { password: string }) {
  const hasLength = password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);

  const strength = hasLength && hasNumber && hasSpecial
    ? 'strong'
    : hasLength && hasNumber
    ? 'fair'
    : 'weak';

  const barStyle = (filled: boolean, color: string) => ({
    height: '4px',
    flex: 1,
    borderRadius: '2px',
    background: filled ? color : 'var(--border)',
    transition: 'background 0.2s'
  });

  return (
    <div>
      <div className="flex gap-1 mt-1.5">
        <div style={barStyle(hasLength, '#EF9F27')}/>
        <div style={barStyle(hasNumber, '#EF9F27')}/>
        <div style={barStyle(hasSpecial, '#1D9E75')}/>
      </div>
      {password.length > 0 && (
        <p className={cn(
          "text-[11px] font-bold mt-1",
          strength === 'strong' ? "text-[#0F6E56]" : strength === 'fair' ? "text-[#854F0B]" : "text-[#A32D2D]"
        )}>
          {strength === 'strong' ? 'Strong password' : strength === 'fair' ? 'Fair — add a symbol' : 'Weak — add numbers and symbols'}
        </p>
      )}
    </div>
  );
}

function PasswordSection({ user, profile: _profile, onRefresh }: { user: User | null, profile: FirestoreUserProfile | null, onRefresh: () => void }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleUpdatePassword = async () => {
    if (!user) {
      setError('Could not find your account. Please sign in again.');
      return;
    }
    if (newPass !== confirmPass) { setError("Passwords don't match."); return; }
    const validation = validatePassword(newPass);
    if (!validation.valid) { setError(validation.error!); return; }

    const accountEmail = user?.email ?? '';
    if (!accountEmail) {
      setError('Could not find your account email. Please sign out and sign back in.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const credential = EmailAuthProvider.credential(accountEmail, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      setSuccess('Password updated!');
      setIsEditing(false);
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        await auth.signOut();
        router.push('/login?reason=reauth_required');
      } else {
        setError('Incorrect current password.');
        await recordFailedAttempt(db, accountEmail);
      }
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
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400">Current Password</Label>
            <Input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="h-12 text-base" />
          </div>
          
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400">New Password</Label>
            <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="h-12 text-base" />
            <PasswordStrengthBars password={newPass} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-slate-400">Confirm New Password</Label>
            <Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="h-12 text-base" />
          </div>

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

function CurrencySection({ profile, uid }: { profile: FirestoreUserProfile | null, uid: string }) {
  const { activeCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => { setMounted(true); }, []);

  const handleSelect = async (option: CurrencyOption) => {
    if (!mounted || option.code === (profile?.currencyCode ?? 'INR')) return;

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

  const previewCode = hoveredCode || (profile?.currencyCode ?? 'INR');
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
                  (profile?.currencyCode ?? 'INR') === c.code 
                    ? "border-primary bg-primary/5 ring-4 ring-primary/5" 
                    : "border-slate-100 hover:border-slate-200"
                )}
              >
                <span className={cn("text-2xl font-black", (profile?.currencyCode ?? 'INR') === c.code ? "text-primary" : "text-slate-400")}>{c.symbol}</span>
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

function DisplayNameSection({ user: _user, profile, uid }: { user: User | null, profile: FirestoreUserProfile | null, uid: string }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(profile?.displayName ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setNewName(profile?.displayName ?? '');
  }, [profile?.displayName]);

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
          <span className="font-bold text-slate-700">{profile?.displayName ?? ''}</span>
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

function EmailSection({ user, profile, reauthMethod, providerRefreshKey }: { user: User | null, profile: FirestoreUserProfile | null, reauthMethod: ReauthMethod, providerRefreshKey: number }) {
  const [emailChangeStep, setEmailChangeStep] = useState<EmailChangeStep>('idle');
  const [newEmail, setNewEmail] = useState('');
  const [reauthPassword, setReauthPassword] = useState('');
  const [emailChangeError, setEmailChangeError] = useState('');
  const [emailChangeLoading, setEmailChangeLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (profile?.pendingEmail && profile.pendingEmail !== (user?.email ?? '') && emailChangeStep === 'idle') {
      setNewEmail(profile.pendingEmail);
      setEmailChangeStep('pending');
    }
  }, [profile, user, user?.email, emailChangeStep]);

  useEffect(() => {
    if (!user) return;
    if (emailChangeStep !== 'pending') return;

    const interval = setInterval(async () => {
      await user.reload();
      if ((user?.email ?? '') === newEmail) {
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
    if (newEmail === (user?.email ?? '')) { setEmailChangeError('Please enter a different email address.'); return; }
    setEmailChangeError('');
    setEmailChangeStep('reauth');
  };

  const reauthWithGoogle = async (): Promise<boolean> => {
    if (!user) {
      setEmailChangeError('Could not verify your identity.');
      return false;
    }
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
    if (!user) {
      setEmailChangeError('Could not verify your identity.');
      return false;
    }
    setEmailChangeLoading(true);
    setEmailChangeError('');
    const accountEmail = user?.email ?? '';
    if (!accountEmail) {
      setEmailChangeLoading(false);
      setEmailChangeError('Could not verify your identity.');
      return false;
    }
    try {
      const credential = EmailAuthProvider.credential(accountEmail, password);
      await reauthenticateWithCredential(user, credential);
      setEmailChangeLoading(false);
      return true;
    } catch (err: any) {
      setEmailChangeLoading(false);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setEmailChangeError('Incorrect password.');
        await recordFailedAttempt(db, accountEmail);
      } else setEmailChangeError('Could not verify your identity.');
      return false;
    }
  };

  const proceedWithEmailChange = async () => {
    if (!user) {
      setEmailChangeError('Could not complete email change.');
      return;
    }
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
              <span className="text-sm font-bold text-slate-700">{user?.email ?? ''}</span>
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

function ParentSection({ user: _user, profile: _profile, uid }: { user: User | null, profile: FirestoreUserProfile | null, uid: string }) {
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

function DangerZone({ user: _user, profile: _profile, reauthMethod, providers, router }: { 
  user: User | null, 
  profile: FirestoreUserProfile | null,
  reauthMethod: ReauthMethod, 
  providers: any,
  router: any
}) {
  const [deletionState, setDeletionState] = useState<DeletionReauthState>('idle');
  const [deletionError, setDeletionError] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [reauthPassword, setReauthPassword] = useState('');

  async function reauthForDeletion(): Promise<boolean> {
    const currentUser = auth.currentUser;
    if (!currentUser) return false;

    if (providers.hasCustom || (!providers.hasPassword && !providers.hasGoogle)) {
      return true;
    }

    if (providers.hasGoogle && !providers.hasPassword) {
      try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        await reauthenticateWithPopup(currentUser, provider);
        return true;
      } catch (err: any) {
        if (err.code !== 'auth/popup-closed-by-user') {
          setDeletionError('Could not verify your identity. Please try again.');
        }
        return false;
      }
    }

    if (providers.hasPassword) {
      if (!reauthPassword) {
        setDeletionError('Please enter your password.');
        return false;
      }
      const currentEmail = currentUser?.email ?? '';
      if (!currentEmail) {
        setDeletionError('Could not verify your identity. Please try again.');
        return false;
      }
      try {
        const credential = EmailAuthProvider.credential(currentEmail, reauthPassword);
        await reauthenticateWithCredential(currentUser, credential);
        return true;
      } catch (err: any) {
        if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
          setDeletionError('Incorrect password.');
        } else if (err.code === 'auth/requires-recent-login') {
          setDeletionError('Session expired. Please sign out and sign back in, then try deleting again.');
        } else {
          setDeletionError('Could not verify your identity. Please try again.');
        }
        return false;
      }
    }

    return false;
  }

  async function executeAccountDeletion(): Promise<void> {
    const currentUser = auth.currentUser;
    if (!currentUser || deleteConfirmText !== 'DELETE') return;

    setDeletionState('deleting');
    setDeletionError('');

    try {
      const uid = currentUser.uid;
      
      const subcollections = [
        'gameScores', 'progression', 'lessonProgress',
        'activityLog', 'parentControls', 'questProgress',
        'savingsGoals', 'virtualInvestments', 'toolsUsed',
        'healthHistory', 'notifications', 'profile'
      ];

      for (const sub of subcollections) {
        const colRef = collection(db, 'users', uid, sub);
        const snap = await getDocs(colRef);
        if (snap.empty) continue;
        const batch = writeBatch(db);
        snap.docs.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      await deleteDoc(doc(db, 'users', uid));
      try {
        await deleteDoc(doc(db, 'leaderboard', uid));
      } catch {}

      await currentUser.delete();
      router.push('/?deleted=true');

    } catch (err: any) {
      console.error('[SpendXP] Account deletion error:', err);
      if (err.code === 'auth/requires-recent-login') {
        setDeletionState('reauth');
        setDeletionError('Session expired. Please re-verify your identity to complete deletion.');
      } else {
        setDeletionState('type_delete');
        setDeletionError('Something went wrong deleting your account. Please try again.');
      }
    }
  }

  return (
    <Card className="border-none shadow-sm bg-rose-50/50 p-6 border-rose-100 border">
      <h3 className="text-[15px] font-bold text-rose-600 border-b border-rose-100 pb-3 mb-4">Danger Zone</h3>
      
      {deletionState === 'idle' && (
        <div className="space-y-3">
          <Button 
            variant="outline" 
            onClick={async () => {
              const { signOut } = useAuthContext();
              await signOut();
            }}
            className="w-full h-12 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold gap-2 text-sm"
          >
            <Lock className="h-4 w-4" /> Sign Out
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => setDeletionState('confirm_warning')} 
            className="w-full h-12 border-rose-200 text-rose-600 hover:bg-rose-100 font-bold gap-2 text-sm"
          >
            <Trash2 className="h-4 w-4" /> Delete Account
          </Button>
        </div>
      )}

      {deletionState === 'confirm_warning' && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <p className="text-xs text-rose-700 font-bold leading-relaxed">
            This will permanently delete your SpendXP profile, all earned XP, badges, game history, and settings. This cannot be undone.
          </p>
          <div className="flex gap-2">
            <Button variant="destructive" size="sm" className="font-bold" onClick={() => setDeletionState('reauth')}>Continue</Button>
            <Button variant="ghost" size="sm" onClick={() => setDeletionState('idle')}>Cancel</Button>
          </div>
        </div>
      )}

      {deletionState === 'reauth' && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          {providers.hasCustom || (!providers.hasPassword && !providers.hasGoogle) ? (
            <div>
              <p className="text-xs text-slate-500 mb-3 font-bold">Account will be deleted immediately:</p>
              <Button variant="destructive" size="sm" className="font-bold" onClick={() => setDeletionState('type_delete')}>Delete Account</Button>
            </div>
          ) : providers.hasGoogle && !providers.hasPassword ? (
            <div>
              <p className="text-xs text-slate-500 mb-3 font-bold">Confirm with Google to continue:</p>
              <Button 
                variant="outline" 
                className="w-full gap-2 border-slate-200 bg-white"
                onClick={async () => {
                  const ok = await reauthForDeletion();
                  if (ok) setDeletionState('type_delete');
                }}
              >
                <Plus className="h-4 w-4 rotate-45" /> Continue with Google
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 mb-2 font-bold">Enter password to continue:</p>
              <Input 
                type="password" 
                value={reauthPassword} 
                onChange={e => setReauthPassword(e.target.value)} 
                className="h-12 bg-white" 
                placeholder="Current Password" 
              />
              <Button 
                className="w-full mt-3 font-black"
                onClick={async () => {
                  const ok = await reauthForDeletion();
                  if (ok) setDeletionState('type_delete');
                }}
              >
                Confirm
              </Button>
            </div>
          )}
          {deletionError && <p className="text-xs text-rose-600 font-bold">{deletionError}</p>}
          <Button variant="ghost" size="xs" onClick={() => setDeletionState('idle')} className="w-full text-slate-400">Cancel</Button>
        </div>
      )}

      {deletionState === 'type_delete' && (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <p className="text-xs text-rose-700 font-bold">Type <strong>DELETE</strong> to confirm:</p>
          <Input 
            value={deleteConfirmText} 
            onChange={e => setDeleteConfirmText(e.target.value)} 
            placeholder="DELETE" 
            className={cn("h-12 bg-white uppercase", deleteConfirmText === 'DELETE' ? "border-rose-500" : "")} 
          />
          <Button 
            variant="destructive" 
            className="w-full h-12 font-black"
            disabled={deleteConfirmText !== 'DELETE'}
            onClick={executeAccountDeletion}
          >
            Permanently delete my account
          </Button>
          {deletionError && <p className="text-xs text-rose-600 font-bold">{deletionError}</p>}
          <Button variant="ghost" size="xs" onClick={() => setDeletionState('idle')} className="w-full">Cancel</Button>
        </div>
      )}

      {deletionState === 'deleting' && (
        <div className="flex items-center gap-3 p-4">
          <RefreshCw className="h-5 w-5 animate-spin text-rose-500" />
          <p className="text-sm font-bold text-slate-600">Cleaning up your data...</p>
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
