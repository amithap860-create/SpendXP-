'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { 
  useFirestore, 
  useDoc, 
  useMemoFirebase,
  safeUpdateDoc,
  safeSetDoc,
  db
} from '@/firebase';
import { 
  doc, 
  serverTimestamp, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  writeBatch,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { 
  updateProfile, 
  verifyBeforeUpdateEmail, 
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser
} from 'firebase/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Mail, 
  RefreshCw,
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { validateDisplayName, validateEmail } from '@/lib/validation';
import { rateLimiter } from '@/lib/rateLimiter';
import { getRefreshedToken } from '@/lib/authHelpers';
import { useUser } from '@/lib/store';
import { cn } from '@/lib/utils';
import { XPWallet } from '@/components/XPWallet';

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuthContext();
  const { level } = useUser();

  const profileRef = useMemoFirebase(() => user ? doc(db, 'users', user.uid) : null, [user]);
  const { data: profile, isLoading: profileLoading } = useDoc(profileRef);

  if (authLoading || profileLoading) {
    return <ProfileSkeleton />;
  }

  const isGoogleUser = user?.providerData.some(p => p.providerId === 'google.com');
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
                  {profile?.levelName || 'Investor'} — Level {level}
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
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            <DisplayNameSection profile={profile} uid={user?.uid!} />
            <EmailSection user={user} isGoogleUser={isGoogleUser} profile={profile} />
            {!isGoogleUser && <PasswordSection user={user} />}
            <ParentSection profile={profile} uid={user?.uid!} displayName={profile?.displayName} />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            <Card className="border-none shadow-sm bg-white p-6">
              <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Progression Overview</h3>
              <div className="scale-95 origin-top-left -mt-4">
                <XPWallet />
              </div>
            </Card>
            <DangerZoneSection user={user} />
          </div>
        </div>
      </main>
    </div>
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
          <p className="text-[10px] text-slate-400">2–30 characters. Letters, numbers, spaces, hyphens only.</p>
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

  const cancelPending = async () => {
    await safeUpdateDoc(doc(db, 'users', user.uid), { pendingEmail: null });
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Email address</h3>
      {profile?.pendingEmail && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-lg space-y-2">
          <p className="text-xs font-bold text-amber-700 flex items-center gap-2">
            <AlertCircle className="h-3 w-3" /> Change pending: verify {profile.pendingEmail}
          </p>
          <div className="flex gap-2">
            <button onClick={cancelPending} className="text-[10px] font-black uppercase text-amber-800 underline" suppressHydrationWarning>Cancel Change</button>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-700">{user?.email}</span>
        {isGoogleUser ? (
          <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200">Managed by Google</Badge>
        ) : !isEditing ? (
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold" suppressHydrationWarning>Change</Button>
        ) : null}
      </div>

      {isEditing && !sent && (
        <div className="mt-4 space-y-4 animate-in slide-in-from-top-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-400">New Email</Label>
            <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="h-12" suppressHydrationWarning />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-400">Current Password</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" suppressHydrationWarning />
            <p className="text-[10px] text-slate-400 italic">Required to confirm identity.</p>
          </div>
          {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={loading} size="sm" className="font-bold" suppressHydrationWarning>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Update Email'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400" suppressHydrationWarning>Cancel</Button>
          </div>
        </div>
      )}

      {sent && (
        <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center space-y-2 animate-in zoom-in">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-emerald-900">Check your new inbox!</p>
          <p className="text-xs text-emerald-700">We've sent a link to {newEmail}. Your email won't change until you click it.</p>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-emerald-800 font-black uppercase" suppressHydrationWarning>Dismiss</Button>
        </div>
      )}
    </Card>
  );
}

function PasswordSection({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleUpdate = async () => {
    if (newPass !== confirmPass) { setError("New passwords don't match."); return; }
    if (newPass.length < 8) { setError("New password too short."); return; }

    setLoading(true);
    setError(null);

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPass);
      await getRefreshedToken();
      setSuccess(true);
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') setError('Current password is incorrect.');
      else if (err.code === 'auth/requires-recent-login') setError('Please sign out and back in to change password.');
      else setError('Update failed. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Password</h3>
      {!isEditing ? (
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-slate-700">••••••••••••</span>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-primary font-bold" suppressHydrationWarning>Change</Button>
        </div>
      ) : !success ? (
        <div className="space-y-4 animate-in slide-in-from-top-2">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-400">Current Password</Label>
            <Input type="password" value={currentPass} onChange={(e) => setCurrentPass(e.target.value)} className="h-12" suppressHydrationWarning />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-400">New Password</Label>
            <Input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="h-12" suppressHydrationWarning />
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase text-slate-400">Confirm New Password</Label>
            <Input type="password" value={confirmPass} onChange={(e) => setConfirmPass(e.target.value)} className="h-12" suppressHydrationWarning />
          </div>
          {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
          <div className="flex gap-2">
            <Button onClick={handleUpdate} disabled={loading} size="sm" className="font-bold" suppressHydrationWarning>
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Update Password'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} className="text-slate-400" suppressHydrationWarning>Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center space-y-2 animate-in zoom-in">
          <p className="text-sm font-bold text-emerald-900">Password updated!</p>
          <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setSuccess(false); }} className="text-emerald-800 font-black uppercase" suppressHydrationWarning>Dismiss</Button>
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

  // Watch for request acceptance
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'linkRequests'), where('childUid', '==', uid), where('status', '==', 'pending'), limit(1));
    const unsub = onSnapshot(q, (snap) => {
      // Logic handled via profile document listener usually
    });
    return () => unsub();
  }, [uid]);

  const handleInvite = async () => {
    const val = validateEmail(parentEmail);
    if (!val.valid) { setError(val.error!); return; }
    if (parentEmail === profile.email) { setError("You can't invite yourself!"); return; }

    if (!rateLimiter.check({ key: 'parent:invite', maxCalls: 3, windowMs: 86400000 })) {
      setError('Daily limit reached. Try again tomorrow.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const q = query(collection(db, 'users'), where('email', '==', parentEmail.toLowerCase()), limit(1));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const parentUid = snap.docs[0].id;
        await safeSetDoc(doc(db, 'linkRequests', `${uid}_${parentUid}`), {
          parentUid,
          childUid: uid,
          childName: displayName,
          parentEmail: parentEmail.toLowerCase(),
          status: 'pending',
          createdAt: serverTimestamp()
        }, { merge: true });
        
        await safeUpdateDoc(doc(db, 'users', uid), { pendingParentEmail: parentEmail.toLowerCase() });
        setMessage(`Invite sent to ${parentEmail}! They'll see a request in their account.`);
      } else {
        const inviteCode = crypto.randomUUID().replace(/-/g,'').slice(0,8).toUpperCase();
        await safeSetDoc(doc(collection(db, 'pendingParentInvites')), {
          childUid: uid,
          childName: displayName,
          parentEmail: parentEmail.toLowerCase(),
          inviteCode,
          createdAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 86400000))
        });
        
        await safeUpdateDoc(doc(db, 'users', uid), { pendingParentEmail: parentEmail.toLowerCase() });
        setMessage(`${parentEmail} invited to join SpendXP. Link sent!`);
      }
    } catch (err) {
      setError('Failed to send invite.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your parent?')) return;
    const batch = writeBatch(db);
    batch.update(doc(db, 'users', uid), { 
      parentLinked: false, 
      parentEmail: null, 
      parentUid: null, 
      pendingParentEmail: null 
    });
    await batch.commit();
  };

  if (profile?.parentLinked) {
    return (
      <Card className="border-none shadow-sm bg-white p-6">
        <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Parent / guardian</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <span className="text-sm font-bold text-slate-700">Connected to {profile.parentEmail}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDisconnect} className="text-rose-500 font-bold hover:bg-rose-50" suppressHydrationWarning>Disconnect</Button>
        </div>
      </Card>
    );
  }

  if (profile?.pendingParentEmail) {
    return (
      <Card className="border-none shadow-sm bg-white p-6">
        <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Parent / guardian</h3>
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex flex-col items-center text-center gap-3">
          <div className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
          <p className="text-xs font-bold text-amber-800">Waiting for {profile.pendingParentEmail} to accept your invite.</p>
          <Button variant="outline" size="sm" onClick={async () => {
            await safeUpdateDoc(doc(db, 'users', uid), { pendingParentEmail: null });
          }} className="border-amber-200 text-amber-800" suppressHydrationWarning>Cancel Invite</Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm bg-white p-6">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Parent / guardian</h3>
      <div className="space-y-4">
        <p className="text-sm text-slate-500 leading-relaxed">
          Your parent can monitor your progress, set play time limits, and get weekly reports. Enter their email to invite them.
        </p>
        <div className="flex gap-2">
          <Input 
            type="email" 
            placeholder="Parent's email" 
            value={parentEmail} 
            onChange={(e) => setParentEmail(e.target.value)} 
            className="h-12"
            suppressHydrationWarning
          />
          <Button onClick={handleInvite} disabled={loading} className="font-bold" suppressHydrationWarning>
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Invite'}
          </Button>
        </div>
        {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
        {message && <p className="text-xs text-emerald-600 font-bold">{message}</p>}
      </div>
    </Card>
  );
}

function DangerZoneSection({ user }: { user: any }) {
  const [step, setStep] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => setStep(prev => prev + 1);

  const handleDelete = async () => {
    if (confirmDelete !== 'DELETE') return;
    setLoading(true);
    setError(null);

    try {
      if (!user.providerData.some(p => p.providerId === 'google.com')) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }
      
      const batch = writeBatch(db);
      const collections = ['gameScores', 'progression', 'lessonProgress', 'activityLog', 'parentControls'];
      for (const coll of collections) {
        const q = await getDocs(collection(db, 'users', user.uid, coll));
        q.forEach(d => batch.delete(d.ref));
      }
      batch.delete(doc(db, 'users', user.uid));
      batch.delete(doc(db, 'leaderboard', user.uid));
      await batch.commit();
      
      await deleteUser(user);
      window.location.href = '/?deleted=true';
    } catch (err: any) {
      if (err.code === 'auth/wrong-password') setError('Incorrect password.');
      else setError('Deletion failed. Please sign out and in again.');
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-sm bg-white p-6 border-l-4 border-red-400">
      <h3 className="text-[15px] font-medium text-primary border-b border-slate-100 pb-3 mb-4">Danger zone</h3>
      
      {step === 0 && (
        <Button variant="outline" onClick={handleNext} className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 font-bold h-12" suppressHydrationWarning>
          Delete my account
        </Button>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-in fade-in">
          <div className="p-4 bg-rose-50 rounded-xl text-rose-800 text-xs space-y-2">
            <p className="font-black uppercase">Permanently delete everything:</p>
            <ul className="list-disc pl-4 font-medium">
              <li>Profile and all game scores</li>
              <li>XP, badges, and progress</li>
              <li>Connection to parent accounts</li>
            </ul>
            <p className="font-bold">This cannot be undone.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleNext} className="bg-rose-600 hover:bg-rose-700 font-bold flex-1" suppressHydrationWarning>I understand, continue →</Button>
            <Button variant="ghost" onClick={() => setStep(0)} suppressHydrationWarning>Cancel</Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4">
          <p className="text-sm font-bold text-slate-700">Confirm identity to delete:</p>
          {user.providerData.some(p => p.providerId === 'google.com') ? (
            <p className="text-xs text-slate-500">Sign in with Google again when prompted after clicking next.</p>
          ) : (
            <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-12" suppressHydrationWarning />
          )}
          {error && <p className="text-xs text-rose-500 font-bold">{error}</p>}
          <Button onClick={handleNext} className="w-full bg-rose-600 hover:bg-rose-700 font-bold" suppressHydrationWarning>Next Step</Button>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-in zoom-in">
          <p className="text-sm font-bold text-slate-700">Type <span className="text-rose-600 underline">DELETE</span> to confirm:</p>
          <Input value={confirmDelete} onChange={(e) => setConfirmDelete(e.target.value)} className="h-12 border-rose-200" placeholder="DELETE" suppressHydrationWarning />
          <Button 
            onClick={handleDelete} 
            disabled={confirmDelete !== 'DELETE' || loading} 
            className="w-full bg-rose-600 hover:bg-rose-700 h-14 text-lg font-black"
            suppressHydrationWarning
          >
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Permanently delete account'}
          </Button>
          <Button variant="ghost" onClick={() => setStep(0)} className="w-full" suppressHydrationWarning>Wait, take me back</Button>
        </div>
      )}
    </Card>
  );
}

function ProfileSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        <Card className="p-8"><div className="flex items-center gap-6"><Skeleton className="h-24 w-24 rounded-full" /><div className="space-y-2"><Skeleton className="h-8 w-48" /><Skeleton className="h-4 w-32" /></div></div></Card>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-8">
            {[1, 2, 3, 4].map(i => <Card key={i} className="p-6 space-y-4"><Skeleton className="h-4 w-24" /><Skeleton className="h-12 w-full" /></Card>)}
          </div>
          <div className="space-y-8">
            <Card className="p-6 h-64"><Skeleton className="h-full w-full" /></Card>
            <Card className="p-6 h-32 border-l-4 border-red-100"><Skeleton className="h-full w-full" /></Card>
          </div>
        </div>
      </main>
    </div>
  );
}
