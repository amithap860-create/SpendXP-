'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { db, safeGetDoc, safeUpdateDoc } from '@/firebase';
import { doc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  User,
  Mail,
  Zap,
  Trophy,
  Shield,
  Award,
  Pencil,
  Check,
  X,
  BarChart3,
  Star,
  BookOpen,
  LogOut,
  Trash2,
  Lock,
  ChevronDown,
  ChevronUp,
  Users,
  AlertTriangle,
  Eye,
  EyeOff,
  Key,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { getAvatar, AVATARS } from '@/config/avatars';
import Image from 'next/image';
import { COUNTRIES, getCountryConfig } from '@/config/currency';
import { cn } from '@/lib/utils';
import { getRankForXP, getRankProgress, getNextRank, getFogEnemy, getCurrentSaga } from '@/config/narrative';
import Link from 'next/link';

interface ProfileData {
  displayName: string;
  email: string;
  ageGroup: string;
  birthYear: number | null;
  currencyCode: string;
  countryCode: string;
  avatarId: string;
  isParent: boolean;
  parentLinked: boolean;
}

interface ProgressionData {
  totalXP: number;
  totalGamesPlayed: number;
  badges: string[];
  level: string;
}

interface LinkedChild {
  uid: string;
  displayName: string;
  email: string;
  ageGroup: string;
}

const LEVEL_THRESHOLDS = [
  { name: 'Saver', min: 0, max: 500, color: 'bg-slate-500' },
  { name: 'Investor', min: 500, max: 1500, color: 'bg-blue-500' },
  { name: 'Banker', min: 1500, max: 3500, color: 'bg-primary' },
  { name: 'Finance Pro', min: 3500, max: 7500, color: 'bg-primary' },
  { name: 'Money Master', min: 7500, max: 15000, color: 'bg-secondary' },
];

const BADGE_META: Record<string, { label: string; icon: string; color: string }> = {
  first_win: { label: 'First Win', icon: '🏆', color: 'bg-[#E8F5EE] text-[#2E7D5A] border-[#A8D5BC]' },
  five_game_streak: { label: '5-Game Streak', icon: '🔥', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  budget_master: { label: 'Budget Master', icon: '💰', color: 'bg-[#E8F5EE] text-primary border-[#A8D5BC]' },
  debt_destroyer: { label: 'Debt Destroyer', icon: '⚔️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  smart_investor: { label: 'Smart Investor', icon: '📈', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  tax_whiz: { label: 'Tax Whiz', icon: '🧾', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  daily_challenger: { label: 'Daily Challenger', icon: '📅', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  speed_demon: { label: 'Speed Demon', icon: '⚡', color: 'bg-[#E8F5EE] text-primary border-[#A8D5BC]' },
  perfect_round: { label: 'Perfect Round', icon: '✨', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  finance_scholar: { label: 'Finance Scholar', icon: '🎓', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  tool_explorer: { label: 'Tool Explorer', icon: '🔧', color: 'bg-[#E8F5EE] text-primary border-[#A8D5BC]' },
  goal_getter: { label: 'Goal Getter', icon: '🎯', color: 'bg-[#E8F5EE] text-primary border-[#A8D5BC]' },
  financially_stable: { label: 'Financially Stable', icon: '🏦', color: 'bg-sky-50 text-sky-700 border-sky-200' },
  money_master: { label: 'Money Master', icon: '👑', color: 'bg-[#E8F5EE] text-[#2E7D5A] border-[#A8D5BC]' },
  maths_master: { label: 'Maths Master', icon: '🧮', color: 'bg-primary/5 text-primary border-primary/20' },
  framework_master: { label: 'Framework Master', icon: '🗺️', color: 'bg-[#E8F5EE] text-primary border-[#A8D5BC]' },
  family_linked: { label: 'Family Linked', icon: '👨‍👩‍👧', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  scholar: { label: 'Scholar', icon: '📚', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  emergency_fund_builder: { label: 'Emergency Builder', icon: '🛡️', color: 'bg-[#E8F5EE] text-primary border-[#A8D5BC]' },
};

function getLevelInfo(xp: number) {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].min) return LEVEL_THRESHOLDS[i];
  }
  return LEVEL_THRESHOLDS[0];
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-40 rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </main>
    </div>
  );
}

// Collapsible section wrapper
function Section({
  title,
  icon: Icon,
  iconColor,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        suppressHydrationWarning
      >
        <div className="flex items-center gap-2 font-black text-sm text-slate-800">
          <Icon className={cn('h-4 w-4', iconColor)} />
          {title}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 border-t">{children}</div>}
    </Card>
  );
}

export default function ProfilePage() {
  const { user, loading: authLoading, currentAgeGroup, logout } = useAuthContext();
  const router = useRouter();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [progression, setProgression] = useState<ProgressionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Edit name
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');

  // Change password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Linked children
  const [linkedChildren, setLinkedChildren] = useState<LinkedChild[]>([]);
  const [linkEmailSent, setLinkEmailSent] = useState(false);
  const [linkEmailLoading, setLinkEmailLoading] = useState(false);

  // Logout confirm
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Avatar picker
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarSaving, setAvatarSaving] = useState(false);

  useEffect(() => {
    document.title = 'Profile | SpendXP';
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?next=/profile');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user?.uid) return;
    const uid = user.uid;

    const load = async () => {
      setLoading(true);
      try {
        const [userSnap, progressSnap] = await Promise.all([
          safeGetDoc(doc(db, 'users', uid)),
          safeGetDoc(doc(db, 'users', uid, 'progression', 'stats')),
        ]);

        setProfile({
          displayName: userSnap?.displayName ?? user.displayName ?? 'Explorer',
          email: userSnap?.email ?? user.email ?? '',
          ageGroup: userSnap?.ageGroup ?? currentAgeGroup ?? 'teen',
          birthYear: userSnap?.birthYear ?? null,
          currencyCode: userSnap?.currencyCode ?? 'INR',
          countryCode: userSnap?.countryCode ?? 'IN',
          avatarId: userSnap?.avatarId ?? 'voss',
          isParent: userSnap?.isParent ?? false,
          parentLinked: userSnap?.parentLinked ?? false,
        });

        setProgression({
          totalXP: progressSnap?.totalXP ?? 0,
          totalGamesPlayed: progressSnap?.totalGamesPlayed ?? 0,
          badges: progressSnap?.badges ?? [],
          level: progressSnap?.level ?? 'Saver',
        });

        // If this is a parent, load linked children
        if (userSnap?.isParent) {
          const q = query(collection(db, 'users'), where('parentUid', '==', uid));
          const snap = await getDocs(q);
          const kids: LinkedChild[] = snap.docs.map(d => {
            const data = d.data();
            return {
              uid: d.id,
              displayName: data.displayName ?? 'Child',
              email: data.email ?? '',
              ageGroup: data.ageGroup ?? 'junior',
            };
          });
          setLinkedChildren(kids);
        }
      } catch {
        setProfile({
          displayName: user.displayName ?? 'Explorer',
          email: user.email ?? '',
          ageGroup: currentAgeGroup ?? 'teen',
          birthYear: null,
          countryCode: 'IN',
          avatarId: 'voss',
          currencyCode: 'INR',
          isParent: false,
          parentLinked: false,
        });
        setProgression({ totalXP: 0, totalGamesPlayed: 0, badges: [], level: 'Saver' });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, authLoading, currentAgeGroup]);

  const handleSaveAvatar = async (avatarId: string) => {
    if (!user?.uid) return;
    setAvatarSaving(true);
    try {
      await safeUpdateDoc(doc(db, 'users', user.uid), { avatarId });
      setProfile(p => p ? { ...p, avatarId } : p);
      setShowAvatarPicker(false);
      toast({ title: 'Operative updated!' });
    } catch {
      toast({ title: 'Failed to update avatar', variant: 'destructive' });
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleSaveName = async () => {
    if (!user?.uid || !nameInput.trim()) return;
    try {
      await updateProfile(auth.currentUser!, { displayName: nameInput.trim() });
      await safeUpdateDoc(doc(db, 'users', user.uid), { displayName: nameInput.trim() });
      setProfile(p => p ? { ...p, displayName: nameInput.trim() } : p);
      setEditingName(false);
      toast({ title: 'Name updated!' });
    } catch {
      toast({ title: 'Failed to update name', variant: 'destructive' });
    }
  };

  const isEmailUser = user?.providerData?.some(p => p.providerId === 'password');

  const handleChangePassword = async () => {
    if (!auth.currentUser || !isEmailUser) return;
    if (newPassword !== confirmPassword) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }
    setPwLoading(true);
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email!, oldPassword);
      await reauthenticateWithCredential(auth.currentUser, cred);
      await updatePassword(auth.currentUser, newPassword);
      setOldPassword(''); setNewPassword(''); setConfirmPassword('');
      toast({ title: 'Password changed successfully!' });
    } catch (err: any) {
      const msg = err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Current password is incorrect.'
        : 'Failed to change password. Please try again.';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleSendLinkEmail = async () => {
    if (!auth.currentUser) return;
    setLinkEmailLoading(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setLinkEmailSent(true);
      toast({ title: 'Verification email sent — check your inbox!' });
    } catch {
      toast({ title: 'Could not send email. Try again later.', variant: 'destructive' });
    } finally {
      setLinkEmailLoading(false);
    }
  };

  const handleToggleParent = async () => {
    if (!user?.uid || !profile) return;
    const newVal = !profile.isParent;
    try {
      await safeUpdateDoc(doc(db, 'users', user.uid), { isParent: newVal });
      setProfile(p => p ? { ...p, isParent: newVal } : p);
      toast({ title: newVal ? 'Parent mode enabled' : 'Parent mode disabled' });
    } catch {
      toast({ title: 'Failed to update account type', variant: 'destructive' });
    }
  };

  // Currency / country change
  const [editingCurrency, setEditingCurrency] = useState(false);
  const [pendingCountryCode, setPendingCountryCode] = useState<string>('');

  const handleSaveCountry = async () => {
    if (!user?.uid || !pendingCountryCode) return;
    const country = COUNTRIES.find(c => c.code === pendingCountryCode);
    if (!country) return;
    try {
      await safeUpdateDoc(doc(db, 'users', user.uid), {
        countryCode: country.code,
        currencyCode: country.currency.code,
      });
      setProfile(p => p ? { ...p, countryCode: country.code, currencyCode: country.currency.code } : p);
      setEditingCurrency(false);
      toast({ title: `Currency updated to ${country.currency.code} (${country.flag} ${country.name})` });
    } catch {
      toast({ title: 'Failed to save currency preference', variant: 'destructive' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!auth.currentUser || !user) return;
    if (deleteConfirmText !== 'DELETE') {
      toast({ title: 'Type DELETE exactly to confirm', variant: 'destructive' });
      return;
    }
    setDeleteLoading(true);
    try {
      if (isEmailUser && deletePassword) {
        const cred = EmailAuthProvider.credential(auth.currentUser.email!, deletePassword);
        await reauthenticateWithCredential(auth.currentUser, cred);
      }
      // Delete Firestore user doc
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(auth.currentUser);
      toast({ title: 'Account deleted. Goodbye!' });
      router.replace('/');
    } catch (err: any) {
      const msg = err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential'
        ? 'Incorrect password. Account not deleted.'
        : 'Failed to delete account. You may need to sign out and back in first.';
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  if (authLoading || (!user && !authLoading)) return <ProfileSkeleton />;
  if (loading) return <ProfileSkeleton />;
  if (!profile || !progression) return <ProfileSkeleton />;

  const levelInfo = getLevelInfo(progression.totalXP);
  const nextLevel = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.indexOf(levelInfo) + 1];
  const xpIntoLevel = progression.totalXP - levelInfo.min;
  const xpForLevel = (nextLevel?.min ?? levelInfo.max) - levelInfo.min;
  const progressPct = Math.min(100, (xpIntoLevel / xpForLevel) * 100);
  const ageLabel = profile.ageGroup === 'junior' ? 'Junior (8–12)' : profile.ageGroup === 'teen' ? 'Teen (13–16)' : 'Senior (17–20)';
  const avatarCfg = getAvatar(profile.avatarId ?? 'voss');
  const countryCfg = getCountryConfig(profile.countryCode ?? 'IN');

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* ── Header card ── */}
        <Card className="border-none shadow-md overflow-hidden">
          {/* Gradient banner using avatar colours */}
          <div className={cn('h-20 w-full bg-gradient-to-r', avatarCfg.bgGradient)} />
          <CardContent className="pt-0 px-5 pb-5">
            <div className="flex items-end gap-4 -mt-10">
              {/* Avatar — click to change */}
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="relative group shrink-0"
                suppressHydrationWarning
              >
                <div className={cn(
                  'h-20 w-20 rounded-2xl overflow-hidden shadow-xl border-4 border-white bg-gradient-to-br',
                  avatarCfg.bgGradient
                )}>
                  <Image src={avatarCfg.imagePath} alt={avatarCfg.name} width={80} height={80} className="w-full h-full object-contain" />
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Pencil className="h-5 w-5 text-white" />
                </div>
              </button>
              <div className="mb-1 flex-1 min-w-0">
                {editingName ? (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      className="h-9 text-lg font-black max-w-xs"
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                      suppressHydrationWarning
                    />
                    <Button size="sm" onClick={handleSaveName} className="h-9 w-9 p-0" suppressHydrationWarning><Check className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingName(false)} className="h-9 w-9 p-0" suppressHydrationWarning><X className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <h1 className="text-xl font-black text-slate-900 truncate">{profile.displayName}</h1>
                    <button
                      onClick={() => { setNameInput(profile.displayName); setEditingName(true); }}
                      className="text-slate-400 hover:text-primary transition-colors"
                      suppressHydrationWarning
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <Badge variant="secondary" className="text-xs font-bold">{ageLabel}</Badge>
                  <span className="text-xs text-slate-400 font-medium">
                    {countryCfg.flag} {countryCfg.name} · {profile.currencyCode}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 italic">{avatarCfg.archetype} · &ldquo;{avatarCfg.tagline}&rdquo;</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
              <Mail className="h-3.5 w-3.5" />
              <span className="font-medium truncate">{profile.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-none shadow-sm text-center p-4">
            <Zap className="h-5 w-5 text-[#2E7D5A] mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{progression.totalXP.toLocaleString('en-IN')}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total XP</div>
          </Card>
          <Card className="border-none shadow-sm text-center p-4">
            <BarChart3 className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{progression.totalGamesPlayed}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Games</div>
          </Card>
          <Card className="border-none shadow-sm text-center p-4">
            <Award className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-2xl font-black text-slate-900">{progression.badges.length}</div>
            <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Badges</div>
          </Card>
        </div>

        {/* ── Level progress ── */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-black flex items-center gap-2">
              <Star className="h-4 w-4 text-[#2E7D5A]" /> Level Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            <div className="flex justify-between items-center">
              <div className={cn('px-3 py-1 rounded-full text-white text-xs font-black', levelInfo.color)}>{levelInfo.name}</div>
              {nextLevel && <div className="text-xs font-bold text-slate-400">{nextLevel.name} in {(nextLevel.min - progression.totalXP).toLocaleString('en-IN')} XP</div>}
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className={cn('h-full rounded-full transition-all duration-700', levelInfo.color)} style={{ width: `${progressPct}%` }} />
            </div>
            <div className="text-xs text-slate-400 font-medium text-right">{xpIntoLevel.toLocaleString('en-IN')} / {xpForLevel.toLocaleString('en-IN')} XP</div>
          </CardContent>
        </Card>

        {/* ── Order Storyline card ── */}
        {(() => {
          const totalXP = progression.totalXP ?? 0;
          const rank = getRankForXP(totalXP);
          const nextRank = getNextRank(totalXP);
          const rankPct = getRankProgress(totalXP) * 100;
          const fog = getFogEnemy(rank.activeFog.toLowerCase().replace(/ /g, '_').replace(/'/g, ''));
          const saga = getCurrentSaga();
          const avatarCfg = getAvatar(profile?.avatarId ?? 'voss');
          return (
            <Card className="border-none shadow-sm overflow-hidden">
              <div className={cn('h-1 w-full bg-gradient-to-r', avatarCfg.bgGradient)} />
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>⚖️</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Order of the Golden Ledger</span>
                    {saga && <span className="hidden sm:inline text-[9px] text-slate-400 border border-slate-200 rounded-full px-2 py-0.5 font-bold">{saga.emoji} {saga.name}</span>}
                  </div>
                  <Link href="/story" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Lore →</Link>
                </div>

                {/* Rank + progress */}
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br flex-shrink-0', avatarCfg.bgGradient)}>
                    <Image src={avatarCfg.imagePath} alt={avatarCfg.name} width={120} height={120} className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-base font-black text-slate-900">{rank.emoji} {rank.name}</span>
                      <span className="text-[9px] font-bold text-slate-400">{rank.district}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full" style={{ width: `${rankPct}%` }} />
                    </div>
                    <p className="text-[9px] font-bold text-slate-400">
                      {nextRank ? `${(nextRank.minXP - totalXP).toLocaleString()} XP to ${nextRank.emoji} ${nextRank.name}` : 'Max Rank!'}
                    </p>
                  </div>
                </div>

                {/* Mission brief */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">📋 Current Mission</p>
                  <p className="text-xs font-medium text-slate-600 italic">"{rank.storyLine}"</p>
                </div>

                {/* Fog threat compact */}
                <div className="flex gap-3">
                  <div className="flex-1 bg-red-50 border border-red-100 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-red-500 mb-1">⚠️ Active Threat</p>
                    <p className="text-xs font-black text-red-700">{fog.emoji} {fog.name}</p>
                    <p className="text-[10px] text-red-500 mt-0.5 leading-tight">{fog.description.slice(0, 60)}…</p>
                  </div>
                  <div className="flex-1 bg-primary/5 border border-primary/10 rounded-xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">🛡️ Counter</p>
                    <p className="text-[10px] text-slate-700 leading-tight font-medium">{fog.weakness.slice(0, 70)}…</p>
                  </div>
                </div>

                <Link href="/quests" className="block w-full h-9 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors">
                  Open Case Files →
                </Link>
              </CardContent>
            </Card>
          );
        })()}

        {/* ── Badges ── */}
        {progression.badges.length > 0 && (
          <Section title={`Badges (${progression.badges.length})`} icon={Trophy} iconColor="text-[#2E7D5A]" defaultOpen={false}>
            <div className="flex flex-wrap gap-2 pt-4">
              {progression.badges.map(b => {
                const meta = BADGE_META[b] ?? { label: b, icon: '🏅', color: 'bg-slate-50 text-slate-700 border-slate-200' };
                return (
                  <div key={b} className={cn('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold', meta.color)}>
                    <span>{meta.icon}</span><span>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ── Currency & Country ── */}
        <Section title="Currency & Country" icon={ToggleLeft} iconColor="text-primary">
          <div className="pt-4 space-y-4">
            {!editingCurrency ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{countryCfg.flag}</span>
                  <div>
                    <p className="font-black text-slate-800">{countryCfg.name}</p>
                    <p className="text-xs text-slate-400 font-bold">{profile.currencyCode}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-bold border-2"
                  onClick={() => { setPendingCountryCode(profile.countryCode); setEditingCurrency(true); }}
                  suppressHydrationWarning
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select your country</p>
                <div className="grid grid-cols-2 gap-2">
                  {COUNTRIES.map(c => (
                    <button
                      key={c.code}
                      onClick={() => setPendingCountryCode(c.code)}
                      suppressHydrationWarning
                      className={cn(
                        'flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all text-sm font-bold',
                        pendingCountryCode === c.code
                          ? 'border-primary bg-primary/5 shadow-md'
                          : 'border-slate-100 bg-white hover:border-slate-200'
                      )}
                    >
                      <span className="text-lg">{c.flag}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400">{c.currency.code}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-2 font-bold" onClick={() => setEditingCurrency(false)} suppressHydrationWarning>Cancel</Button>
                  <Button size="sm" className="flex-1 font-black" onClick={handleSaveCountry} disabled={!pendingCountryCode} suppressHydrationWarning>Save currency</Button>
                </div>
              </div>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">
              Changing your country updates how virtual money amounts are displayed throughout the app. Your balance is not affected.
            </p>
          </div>
        </Section>

        {/* ── Account — Change Password ── */}
        {isEmailUser && (
          <Section title="Change Password" icon={Lock} iconColor="text-primary">
            <div className="space-y-3 pt-4">
              <div>
                <Label className="text-xs font-bold text-slate-500 mb-1 block">Current Password</Label>
                <div className="relative">
                  <Input
                    type={showOldPw ? 'text' : 'password'}
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    placeholder="Your current password"
                    className="pr-10"
                    suppressHydrationWarning
                  />
                  <button
                    onClick={() => setShowOldPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    suppressHydrationWarning
                  >
                    {showOldPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 mb-1 block">New Password</Label>
                <div className="relative">
                  <Input
                    type={showNewPw ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="pr-10"
                    suppressHydrationWarning
                  />
                  <button
                    onClick={() => setShowNewPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    suppressHydrationWarning
                  >
                    {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div>
                <Label className="text-xs font-bold text-slate-500 mb-1 block">Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  suppressHydrationWarning
                />
              </div>
              <Button
                onClick={handleChangePassword}
                disabled={pwLoading || !oldPassword || !newPassword || !confirmPassword}
                className="w-full min-h-[44px]"
                suppressHydrationWarning
              >
                <Key className="h-4 w-4 mr-2" />
                {pwLoading ? 'Updating…' : 'Update Password'}
              </Button>
            </div>
          </Section>
        )}

        {/* ── Linked Accounts / Family ── */}
        <Section title="Family &amp; Linked Accounts" icon={Users} iconColor="text-primary">
          <div className="space-y-4 pt-4">
            {/* Parent toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border">
              <div>
                <div className="font-bold text-sm text-slate-800">Parent account</div>
                <div className="text-xs text-slate-500 mt-0.5">Turn this on if you are a parent monitoring a child</div>
              </div>
              <button
                onClick={handleToggleParent}
                className="text-primary shrink-0 ml-3"
                suppressHydrationWarning
              >
                {profile.isParent
                  ? <ToggleRight className="h-8 w-8" />
                  : <ToggleLeft className="h-8 w-8 text-slate-400" />}
              </button>
            </div>

            {/* Children list (parent only) */}
            {profile.isParent && (
              <div className="space-y-2">
                <div className="text-xs font-black uppercase text-slate-400 tracking-widest">Linked Children</div>
                {linkedChildren.length === 0 ? (
                  <p className="text-sm text-slate-500">No children linked yet. Send a link invitation below.</p>
                ) : (
                  linkedChildren.map(child => (
                    <div key={child.uid} className="flex items-center gap-3 p-3 bg-white rounded-xl border">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                        {(child.displayName[0] ?? 'C').toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm truncate">{child.displayName}</div>
                        <div className="text-xs text-slate-400 truncate">{child.email}</div>
                      </div>
                      <Badge variant="outline" className="text-[10px] capitalize shrink-0">{child.ageGroup}</Badge>
                    </div>
                  ))
                )}

                {/* Send link invitation via email */}
                <div className="pt-2 border-t">
                  <p className="text-xs text-slate-500 mb-2">
                    To link a child&apos;s account, send them a verification link. They open it and it connects their account to yours.
                  </p>
                  {linkEmailSent ? (
                    <div className="text-xs text-primary bg-[#E8F5EE] border border-[#A8D5BC] rounded-lg p-3 font-medium">
                      ✓ Link invitation sent to {profile.email}. Ask your child to check their email and tap the link.
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={handleSendLinkEmail}
                      disabled={linkEmailLoading}
                      className="w-full min-h-[44px] text-sm"
                      suppressHydrationWarning
                    >
                      {linkEmailLoading ? 'Sending…' : 'Send Link Invitation via Email'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Child: show linked parent status */}
            {!profile.isParent && (
              <div className="text-sm text-slate-500 bg-slate-50 rounded-xl p-3 border">
                {profile.parentLinked
                  ? '✓ Your account is linked to a parent account.'
                  : 'Your account is not linked to any parent. Ask your parent to send you a link invitation from their profile.'}
              </div>
            )}
          </div>
        </Section>

        {/* ── Quick links ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/learn')}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow text-left"
            suppressHydrationWarning
          >
            <BookOpen className="h-7 w-7 text-primary shrink-0" />
            <div>
              <div className="font-black text-sm text-slate-900">Learn</div>
              <div className="text-xs text-slate-400">Open Academy</div>
            </div>
          </button>
          <button
            onClick={() => router.push('/games')}
            className="flex items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow text-left"
            suppressHydrationWarning
          >
            <Zap className="h-7 w-7 text-[#2E7D5A] shrink-0" />
            <div>
              <div className="font-black text-sm text-slate-900">Games</div>
              <div className="text-xs text-slate-400">Earn more XP</div>
            </div>
          </button>
        </div>

        {/* ── Log out ── */}
        {!logoutConfirm ? (
          <Button
            variant="outline"
            className="w-full min-h-[44px] border-slate-300 text-slate-700 gap-2"
            onClick={() => setLogoutConfirm(true)}
            suppressHydrationWarning
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        ) : (
          <Card className="border-[#A8D5BC] bg-[#E8F5EE]">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-bold text-[#1A4035]">Are you sure you want to sign out?</p>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setLogoutConfirm(false)} className="flex-1 min-h-[44px]" suppressHydrationWarning>
                  Cancel
                </Button>
                <Button onClick={handleLogout} className="flex-1 min-h-[44px] bg-[#1A1F2E] hover:bg-[#252B3B]" suppressHydrationWarning>
                  Yes, sign out
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Delete account ── */}
        <Section title="Delete Account" icon={Trash2} iconColor="text-rose-500">
          <div className="space-y-3 pt-4">
            <div className="flex items-start gap-2 p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>This is permanent. All your XP, badges, and progress will be deleted and cannot be recovered.</span>
            </div>
            <div>
              <Label className="text-xs font-bold text-slate-500 mb-1 block">Type DELETE to confirm</Label>
              <Input
                value={deleteConfirmText}
                onChange={e => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="font-mono"
                suppressHydrationWarning
              />
            </div>
            {isEmailUser && (
              <div>
                <Label className="text-xs font-bold text-slate-500 mb-1 block">Enter your password</Label>
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={e => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                  suppressHydrationWarning
                />
              </div>
            )}
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
              className="w-full min-h-[44px]"
              suppressHydrationWarning
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {deleteLoading ? 'Deleting…' : 'Delete My Account'}
            </Button>
          </div>
        </Section>

      </main>

      {/* ── Avatar Picker Modal ── */}
      {showAvatarPicker && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowAvatarPicker(false)}
        >
          <div
            className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 space-y-5 max-h-[85vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Change Operative</h2>
                <p className="text-xs text-slate-400 font-medium">Pick your financial alter-ego</p>
              </div>
              <button onClick={() => setShowAvatarPicker(false)} className="text-slate-400 hover:text-slate-600" suppressHydrationWarning>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {AVATARS.map(avatar => (
                <button
                  key={avatar.id}
                  onClick={() => handleSaveAvatar(avatar.id)}
                  disabled={avatarSaving}
                  suppressHydrationWarning
                  className={cn(
                    'flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 transition-all duration-200',
                    avatarCfg.id === avatar.id
                      ? `border-primary bg-primary/5 scale-105 shadow-md`
                      : 'border-slate-100 bg-white hover:border-slate-300'
                  )}
                >
                  <div className={cn('w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br', avatar.bgGradient)}>
                    <Image src={avatar.imagePath} alt={avatar.name} width={56} height={56} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] font-black text-slate-600 truncate w-full text-center">{avatar.name}</span>
                  <span className="text-[8px] text-slate-400 truncate w-full text-center">{avatar.archetype}</span>
                  {avatarCfg.id === avatar.id && (
                    <span className="text-[8px] font-black uppercase tracking-wider text-primary">Active</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
