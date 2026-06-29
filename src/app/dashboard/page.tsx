'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import {
  db,
  safeGetDoc,
} from '@/firebase';
import {
  doc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  type QueryDocumentSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { 
  getProgression, 
  getAllGameScores, 
  getConceptStrengths,
  UserProgression,
  GameScores,
  ConceptStrengths
} from '@/lib/progressionService';
import { useCurrency } from '@/hooks/useCurrency';
import {
  getISTDateKey,
  getNextISTMidnight,
  formatRelativeTime
} from '@/lib/dateHelpers';
import { getCurrentStreak } from '@/lib/dailyChallenge';
import { lessons } from '@/data/lessons';
import { Skeleton } from '@/components/ui/skeleton';
import { Scale, Award, BookOpen, ShieldCheck, AlertTriangle, Flame, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay';
import { IntroSlides } from '@/components/onboarding/IntroSlides';
import { TooltipTour } from '@/components/onboarding/TooltipTour';
import { getRankForXP, getRankProgress, getNextRank, getFogEnemy, getCurrentSaga } from '@/config/narrative';
import { getAvatar } from '@/config/avatars';
import Image from 'next/image';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { trackRankUp } from '@/lib/analytics';

const RadarChart = dynamic(() => import('@/components/charts/RadarChart').then(mod => mod.RadarChart), {
  ssr: false,
  loading: () => <div className="h-[220px] w-[220px] rounded-full bg-slate-100 animate-pulse" />
});

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { formatValue, formatCompact } = useCurrency();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [radarSize, setRadarSize] = useState(220);

  // Data State - declare all hooks unconditionally
  const [profile, setProfile] = useState<any>(null);
  const [progression, setProgression] = useState<UserProgression | null>(null);
  const [gameScores, setGameScores] = useState<GameScores | null>(null);
  const [strengths, setStrengths] = useState<ConceptStrengths | null>(null);
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [dailyParticipantCount, setDailyParticipantCount] = useState(0);
  const [dailyRank, setDailyRank] = useState<{ score: number; rank: number } | null>(null);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  // Initialise timeLeft immediately so it shows on first render
  const calcTimeLeft = () => {
    const next = getNextISTMidnight();
    const diff = next.getTime() - Date.now();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}h ${mins}m`;
  };
  const [timeLeft, setTimeLeft] = useState(calcTimeLeft);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showIntroSlides, setShowIntroSlides] = useState(false);
  const [showTooltipTour, setShowTooltipTour] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = 'Dashboard | SpendXP';
    // Show intro slides only on very first visit (before onboarding starts)
    const hasSeenIntro = localStorage.getItem('spendxp_intro_done');
    if (!hasSeenIntro) {
      setShowIntroSlides(true);
    }
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnTo=/dashboard');
    }
  }, [user, authLoading, router]);

  // These useMemo hooks must be declared before any conditional return (Rules of Hooks)
  // Both use the narrative rank system (Apprentice → Legend) so the XP circle
  // stays consistent with the Order of the Golden Ledger section below.
  const nextLevelXP = useMemo(() => {
    const totalXP = progression?.totalXP ?? 0;
    const nextRank = getNextRank(totalXP);
    return nextRank ? nextRank.minXP - totalXP : 0;
  }, [progression]);

  const levelProgress = useMemo(() => {
    const totalXP = progression?.totalXP ?? 0;
    return Math.round(getRankProgress(totalXP) * 100);
  }, [progression]);

  // Resize effect — must be before the conditional return (Rules of Hooks)
  useEffect(() => {
    const handleResize = () => {
      setRadarSize(Math.min(window.innerWidth - 48, 280));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Reject stub uids (e.g. '1') from the localStorage AuthContext that
    // arrive before Firebase Auth has confirmed the real user identity.
    // Real Firebase Auth uids are 28 characters long.
    const uid = user?.uid;
    if (!user || !uid || typeof uid !== 'string' || uid.length < 5) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const istDateKey = getISTDateKey();
        const [
          profileData,
          progData,
          scoresData,
          strengthsData,
          tasksSnap,
          dailyDoc
        ] = await Promise.all([
          safeGetDoc(doc(db, 'users', uid)),
          getProgression(uid),
          getAllGameScores(uid),
          getConceptStrengths(uid),
          getDocs(collection(db, 'users', uid, 'lessonProgress')),
          safeGetDoc(doc(db, 'dailyChallenges', istDateKey))
        ]);

        setProfile(profileData);
        setProgression(progData);
        setGameScores(scoresData);
        setStrengths(strengthsData);
        setCompletedLessonsCount(
          tasksSnap.docs.filter((d: QueryDocumentSnapshot<DocumentData>) => d.data()?.completed).length
        );
        setDailyParticipantCount(dailyDoc?.participantCount || 0);

        // Fetch real streak
        const streak = await getCurrentStreak(uid);
        setCurrentStreak(streak);

        const rankSnap = await getDocs(query(
          collection(db, 'dailyChallenges', istDateKey, 'scores'),
          orderBy('score', 'desc')
        ));
        const userRankIndex = rankSnap.docs.findIndex(d => d.id === uid);
        if (userRankIndex !== -1) {
          setDailyRank({
            score: rankSnap.docs[userRankIndex]?.data()?.score ?? 0,
            rank: userRankIndex + 1
          });
        }
      } catch (err) {
        console.error('[SpendXP] Dashboard Load Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    const timer = setInterval(() => {
      setTimeLeft(calcTimeLeft());
    }, 60000);

    return () => {
      clearInterval(timer);
    };
  }, [user]);

  // Track rank-up events — compare stored rank to current rank
  useEffect(() => {
    if (!progression) return;
    const totalXP = progression.totalXP ?? 0;
    const currentRank = getRankForXP(totalXP);
    const storedRankName = localStorage.getItem('spendxp_last_rank');
    if (storedRankName && storedRankName !== currentRank.name) {
      trackRankUp({ newRank: currentRank.name, totalXP });
    }
    localStorage.setItem('spendxp_last_rank', currentRank.name);
  }, [progression]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Still up';
  }, []);

  const subtitle = useMemo(() => {
    if (!progression || (progression?.totalGamesPlayed ?? 0) === 0) 
      return "Welcome to SpendXP! Start your first game to earn XP.";
    if (!dailyRank) 
      return "Daily challenge available — play now to keep your streak!";
    return `You've earned ${progression?.totalXP?.toLocaleString() ?? '0'} XP so far. Keep going!`;
  }, [progression, dailyRank]);

  const recommendedGames = useMemo(() => {
    const allGames = [
      { id: 'budgetBlitz', name: 'Budget Blitz', topic: 'budgeting' },
      { id: 'finIQQuiz', name: 'FinIQ Quiz', topic: 'taxes' },
      { id: 'moneyMaze', name: 'Money Maze', topic: 'spending' },
      { id: 'stockMarketSim', name: 'Stock Market Simulator', topic: 'investing' },
      { id: 'creditScoreBuilder', name: 'Credit Score Builder', topic: 'credit' },
    ];

    const scored = allGames.map(game => {
      let score = 0;
      const userScore = gameScores?.[game.id as keyof GameScores];
      if (userScore && userScore.gamesPlayed > 0) score += 30;
      if (profile?.interests?.includes(game.topic)) score += 20;
      if (!userScore || (userScore.highScore || 0) < 500) score += 10;
      return { ...game, recommendationScore: score };
    });

    return scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
  }, [gameScores, profile]);

  // Conditional returns after all hooks are declared
  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #E1F5EE',
          borderTop: '3px solid #1A1F2E',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}/>
        <style>{`@keyframes spin {
        to { transform: rotate(360deg); }
      }`}</style>
      </div>
    );
  }

  // Auth guard — placed AFTER all hooks to satisfy Rules of Hooks
  if (authLoading || !user) return <DashboardSkeleton />;

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen-safe bg-slate-50 pb-24 md:pb-8">
      {/* First-run intro slides */}
      {showIntroSlides && (
        <IntroSlides
          onComplete={() => {
            localStorage.setItem('spendxp_intro_done', '1');
            setShowIntroSlides(false);
            // Start tooltip tour after slides
            setTimeout(() => setShowTooltipTour(true), 600);
          }}
        />
      )}

      {/* In-app tooltip tour */}
      {showTooltipTour && (
        <TooltipTour
          onComplete={() => {
            localStorage.setItem('spendxp_tour_done', '1');
            setShowTooltipTour(false);
          }}
        />
      )}

      <HowToPlayModal forceOpen={showHowToPlay} onClose={() => setShowHowToPlay(false)} />
      {/* Help button */}
      <button
        onClick={() => setShowHowToPlay(true)}
        className="fixed bottom-24 right-4 md:bottom-6 z-40 w-9 h-9 rounded-full bg-[#1A1F2E] text-white text-xs font-black shadow-lg hover:bg-[#252B3B] transition-colors flex items-center justify-center"
        title="How to play"
      >
        ?
      </button>
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-700">
        
        {/* HERO HEADER */}
        <section className="bg-white rounded-3xl border-[0.5px] border-slate-200 p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
          <div className="space-y-4 text-center md:text-left flex-1">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {greeting}, {profile?.displayName?.split(' ')?.[0] ?? 'there'}!
              </h1>
              <p className="text-slate-500 font-medium mt-1 text-sm md:text-base">{subtitle}</p>
            </div>
            <div className="flex justify-center md:justify-start gap-2">
              <span className="px-3 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                {getRankForXP(progression?.totalXP ?? 0).name}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                {profile?.ageGroup ?? 'Student'} • {profile?.birthYear != null ? (new Date().getFullYear() - profile.birthYear) : '8-20'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center shrink-0">
            <div className="relative h-28 w-28 md:h-32 md:w-32">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="50%" cy="50%" r="44%"
                  fill="none" stroke="#f1f5f9" strokeWidth="8"
                />
                <circle
                  cx="50%" cy="50%" r="44%"
                  fill="none" stroke="#2E7D5A" strokeWidth="8"
                  strokeDasharray="276%"
                  strokeDashoffset={2.76 * (1 - (levelProgress / 100)) * 100 + '%'}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl md:text-2xl font-black text-slate-900">{(progression?.totalXP || 0).toLocaleString()}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">XP</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                {nextLevelXP > 0
                  ? `/ ${nextLevelXP.toLocaleString()} XP to ${getNextRank(progression?.totalXP ?? 0)?.name ?? 'Next Rank'}`
                  : 'Max Rank Achieved!'}
              </p>
            </div>
          </div>
        </section>

        {/* STORYLINE CARD — Order of the Golden Ledger */}
        {(() => {
          // tour anchor — wrapping div gets id below
          const totalXP = progression?.totalXP ?? 0;
          const rank = getRankForXP(totalXP);
          const nextRank = getNextRank(totalXP);
          const rankPct = getRankProgress(totalXP) * 100;
          const fog = getFogEnemy(rank.activeFog.toLowerCase().replace(/ /g, '_').replace(/'/g, ''));
          const saga = getCurrentSaga();
          const avatarCfg = getAvatar(profile?.avatarId ?? 'voss');
          return (
            <section id="tour-storyline" className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              {/* Top accent bar */}
              <div className={cn('h-1 w-full bg-gradient-to-r', avatarCfg.bgGradient)} />

              {/* Header row */}
              <div className="px-5 pt-4 pb-3 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Order of the Golden Ledger</span>
                  {saga && (
                    <span className="hidden md:inline text-[9px] font-bold text-slate-400 border border-slate-200 rounded-full px-2 py-0.5 flex items-center gap-1">
                      <Flame className="h-2.5 w-2.5 text-amber-500 inline" /> {saga.name}
                    </span>
                  )}
                </div>
                <Link href="/story" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                  Full Lore →
                </Link>
              </div>

              <div className="p-5 space-y-4">
                {/* Rank + district + avatar row */}
                <div className="flex items-center gap-4">
                  <div className={cn('w-16 h-16 rounded-xl overflow-hidden bg-gradient-to-br flex-shrink-0 shadow-sm', avatarCfg.bgGradient)}>
                    <Image src={avatarCfg.imagePath} alt={avatarCfg.name} width={64} height={64} className="w-full h-full object-cover object-top scale-110" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="w-6 h-6 rounded-lg bg-[#E8F5EE] flex items-center justify-center shrink-0">
                        <Award className="h-3.5 w-3.5 text-[#2E7D5A]" />
                      </div>
                      <span className="text-xl font-black text-slate-900">{rank.name}</span>
                      <span className="text-xs font-bold text-slate-400 border border-slate-200 rounded-full px-2 py-0.5">{rank.district}</span>
                    </div>
                    {/* XP progress */}
                    <div className="mt-1.5 space-y-1">
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700" style={{ width: `${rankPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[9px] font-bold text-slate-400">
                        <span>{totalXP.toLocaleString()} XP</span>
                        {nextRank
                          ? <span>{(nextRank.minXP - totalXP).toLocaleString()} XP to {nextRank.name}</span>
                          : <span>Max Rank!</span>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                {/* Story brief */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-1.5 mb-1">
                    <BookOpen className="h-3 w-3 text-primary" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Mission Brief</p>
                  </div>
                  <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{rank.storyLine}"</p>
                </div>

                {/* Active Fog enemy — description + weakness */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Active Threat</p>
                        <p className="text-sm font-black text-slate-800">{fog.name}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{fog.description}</p>
                  </div>
                  <div className="bg-[#F0FAF5] border border-[#A8D5BC] rounded-2xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShieldCheck className="h-3 w-3 text-primary" />
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary">Counter</p>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">{fog.weakness}</p>
                  </div>
                </div>

                {/* CTA row */}
                <div className="flex gap-3 pt-1">
                  <Link
                    href="/quests"
                    className="flex-1 h-10 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
                  >
                    Open Case Files →
                  </Link>
                  <Link
                    href="/story"
                    className="h-10 px-4 border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors"
                  >
                    The Lore
                  </Link>
                </div>
              </div>
            </section>
          );
        })()}

        {/* STREAKS & STATS */}
        <section id="tour-stats" className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Day Streak', val: currentStreak, icon: true },
            { label: 'Games Played', val: progression?.totalGamesPlayed || 0 },
            { label: 'Saved Virtually', val: formatValue(progression?.walletBalance || 0), smallVal: true },
            { label: 'Lessons Done', val: `${completedLessonsCount} / 8` },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-3 md:p-5 rounded-2xl border-[0.5px] border-slate-200 shadow-sm text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className={cn("font-black text-slate-900", stat.smallVal ? "text-lg md:text-xl" : "text-xl md:text-2xl")}>{stat.val}</span>
                {stat.icon && (
                  <div className="w-3 h-4 md:w-4 md:h-5 relative">
                    <div className="absolute bottom-0 left-0 w-full h-full bg-[#1A1F2E] rounded-t-full rounded-br-full -rotate-45" />
                    <div className="absolute bottom-1 left-1 w-1/2 h-1/2 bg-[#4EA07A] rounded-t-full rounded-br-full -rotate-45" />
                  </div>
                )}
              </div>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* CONTINUE PLAYING */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">Continue playing</h2>
            <Link href="/games" className="text-xs font-bold text-primary hover:underline">View all</Link>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
            {recommendedGames.slice(0, 6).map((game) => (
              <Link 
                key={game.id} 
                href={`/games?game=${game.id}`}
                className="flex-shrink-0 w-[160px] h-[120px] md:w-full md:h-[140px] bg-white rounded-2xl border-[0.5px] border-slate-200 p-4 md:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group snap-start"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-xs md:text-sm group-hover:text-primary transition-colors line-clamp-1">{game.name}</h3>
                  <p className="text-[10px] md:text-xs text-slate-400 font-medium">
                    Best: {gameScores?.[game.id as keyof GameScores]?.highScore || 'Not played'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  </div>
                  <span className="text-[10px] font-black text-primary group-hover:translate-x-1 transition-transform">Play →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {/* KNOWLEDGE RADAR */}
          <section className="bg-white rounded-3xl border-[0.5px] border-slate-200 p-6 md:p-8 shadow-sm flex flex-col items-center">
            <h2 className="w-full text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight mb-6 md:mb-8">Financial knowledge</h2>
            {strengths ? (
              <>
                <RadarChart scores={strengths} size={radarSize} />
                <div className="w-full mt-6 md:mt-8 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase">Strongest</p>
                    <span className="px-2 py-1 bg-primary/5 text-primary rounded-lg text-[10px] md:text-xs font-black uppercase">
                      {Object.entries(strengths).sort((a,b) => b[1]-a[1])[0][0]}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase">Focus next</p>
                    <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] md:text-xs font-black uppercase">
                      {Object.entries(strengths).sort((a,b) => a[1]-b[1])[0][0]}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-300 italic text-xs">No data yet</div>
            )}
          </section>

          {/* DAILY CHALLENGE */}
          <section className="space-y-4">
            <h2 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight">Today's challenge</h2>
            <div className="bg-white rounded-3xl border-[0.5px] border-l-4 border-l-primary border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
              {dailyRank ? (
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <div className="w-5 h-5 md:w-6 md:h-6 border-4 border-primary rounded-full border-t-transparent -rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm md:text-base">Completed today!</h3>
                    <p className="text-[10px] md:text-xs text-slate-500 font-medium">You scored {dailyRank.score} · Rank #{dailyRank.rank}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-black text-slate-900">FinIQ Daily Blitz</h3>
                    <p className="text-xs md:text-sm text-slate-500 font-medium leading-tight">Same questions for everyone — see how you rank against other users.</p>
                  </div>
                  <div className="flex items-center justify-between text-[10px] md:text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-rose-500" /> {dailyParticipantCount} players today</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {timeLeft} left</span>
                  </div>
                  <Link href="/games?game=finIQQuiz&mode=daily">
                    <button className="w-full h-12 bg-slate-900 text-white rounded-xl font-black uppercase text-xs md:text-sm tracking-widest hover:bg-slate-800 transition-colors">
                      Play Now
                    </button>
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
      
      {/* Onboarding Overlay */}
      <OnboardingOverlay />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 animate-pulse">
      <div className="h-40 md:h-48 bg-white rounded-3xl border border-slate-100" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-20 md:h-24 bg-white rounded-2xl border border-slate-100" />)}
      </div>
      <div className="space-y-4">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3].map(i => <div key={i} className="min-w-[160px] h-[120px] md:min-w-[200px] md:h-[140px] bg-white rounded-2xl border border-slate-100" />)}
        </div>
      </div>
    </div>
  );
}