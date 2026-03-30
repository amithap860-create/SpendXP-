'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { 
  db, 
  safeGetDoc, 
  safeOnSnapshot, 
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
import { lessons } from '@/data/lessons';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import OnboardingOverlay from '@/components/onboarding/OnboardingOverlay';

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

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?returnTo=/dashboard');
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth
  if (authLoading || !user) {
    return <DashboardSkeleton />;
  }

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
  const [timeLeft, setTimeLeft] = useState('');

  const nextLevelXP = useMemo(() => {
    if (!progression) return 500;
    const currentLevel = progression.level || 1;
    const levels = [0, 500, 1500, 3500, 7500, 15000, 30000];
    return levels[currentLevel] || levels[levels.length - 1];
  }, [progression]);

  const levelProgress = useMemo(() => {
    if (!progression) return 0;
    const currentXP = progression.totalXP || 0;
    const levels = [0, 500, 1500, 3500, 7500, 15000, 30000];
    const currentLevel = progression.level || 1;
    const floor = levels[currentLevel - 1] || 0;
    const ceil = levels[currentLevel] || levels[levels.length - 1];
    return Math.min(100, Math.max(0, ((currentXP - floor) / (ceil - floor)) * 100));
  }, [progression]);

  useEffect(() => {
    const handleResize = () => {
      setRadarSize(Math.min(window.innerWidth - 48, 280));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user) {
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
          safeGetDoc(doc(db, 'users', user.uid)),
          getProgression(user.uid),
          getAllGameScores(user.uid),
          getConceptStrengths(user.uid),
          getDocs(collection(db, 'users', user.uid, 'lessonProgress')),
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

        const rankSnap = await getDocs(query(
          collection(db, 'dailyChallenges', istDateKey, 'scores'),
          orderBy('score', 'desc')
        ));
        const userRankIndex = rankSnap.docs.findIndex(d => d.id === user.uid);
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

    const activityQuery = query(
      collection(db, 'users', user.uid, 'activityLog'),
      orderBy('playedAt', 'desc'),
      limit(10)
    );
    const unsubActivity = safeOnSnapshot(activityQuery, (snap) => {
      setActivityLog(
        snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({ id: d.id, ...d.data() }))
      );
    });

    const timer = setInterval(() => {
      const next = getNextISTMidnight();
      const diff = next.getTime() - Date.now();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      setTimeLeft(`${hours}h ${mins}m`);
    }, 60000);

    return () => {
      unsubActivity();
      clearInterval(timer);
    };
  }, [user]);

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
      { id: 'compoundClicker', name: 'Compound Clicker', topic: 'saving' },
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
          borderTop: '3px solid #0F6E56',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }}/>
        <style>{`@keyframes spin {
        to { transform: rotate(360deg); }
      }`}</style>
      </div>
    );
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen-safe bg-slate-50 pb-24 md:pb-8">
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
              <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                {progression?.level === 1 ? 'Starter' : progression?.level === 2 ? 'Saver' : 'Investor'}
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
                  fill="none" stroke="#14b8a6" strokeWidth="8"
                  strokeDasharray="276%"
                  strokeDashoffset={2.76 * (1 - (levelProgress / 100)) * 100 + '%'}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl md:text-2xl font-black text-slate-900">{formatCompact(progression?.totalXP || 0)}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">XP</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                / {formatCompact(nextLevelXP)} XP to Next Rank
              </p>
            </div>
          </div>
        </section>

        {/* STREAKS & STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { label: 'Day Streak', val: '3', icon: true },
            { label: 'Games Played', val: progression?.totalGamesPlayed || 0 },
            { label: 'Saved Virtually', val: formatValue(progression?.walletBalance || 0), smallVal: true },
            { label: 'Lessons Done', val: `${completedLessonsCount} / 8` },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-3 md:p-5 rounded-2xl border-[0.5px] border-slate-200 shadow-sm text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span className={cn("font-black text-slate-900", stat.smallVal ? "text-lg md:text-xl" : "text-xl md:text-2xl")}>{stat.val}</span>
                {stat.icon && (
                  <div className="w-3 h-4 md:w-4 md:h-5 relative">
                    <div className="absolute bottom-0 left-0 w-full h-full bg-orange-500 rounded-t-full rounded-br-full -rotate-45" />
                    <div className="absolute bottom-1 left-1 w-1/2 h-1/2 bg-yellow-400 rounded-t-full rounded-br-full -rotate-45" />
                  </div>
                )}
              </div>
              <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* CONTINUE PLAYING */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base md:text-lg font-black text-slate-900 uppercase tracking-tight">Continue playing</h2>
            <Link href="/games" className="text-xs font-bold text-teal-600 hover:underline">View all</Link>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible">
            {recommendedGames.slice(0, 6).map((game) => (
              <Link 
                key={game.id} 
                href={`/games?game=${game.id}`}
                className="flex-shrink-0 w-[160px] h-[120px] md:w-full md:h-[140px] bg-white rounded-2xl border-[0.5px] border-slate-200 p-4 md:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group snap-start"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-xs md:text-sm group-hover:text-teal-600 transition-colors line-clamp-1">{game.name}</h3>
                  <p className="text-[9px] md:text-[10px] text-slate-400 font-medium">
                    Best: {gameScores?.[game.id as keyof GameScores]?.highScore || 'Not played'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                  </div>
                  <span className="text-[10px] font-black text-teal-600 group-hover:translate-x-1 transition-transform">Play →</span>
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
                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Strongest</p>
                    <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded-lg text-[9px] md:text-[10px] font-black uppercase">
                      {Object.entries(strengths).sort((a,b) => b[1]-a[1])[0][0]}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase">Focus next</p>
                    <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[9px] md:text-[10px] font-black uppercase">
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
            <div className="bg-white rounded-3xl border-[0.5px] border-l-4 border-l-teal-500 border-slate-200 p-6 md:p-8 shadow-sm space-y-6">
              {dailyRank ? (
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 md:h-12 md:w-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
                    <div className="w-5 h-5 md:w-6 md:h-6 border-4 border-teal-600 rounded-full border-t-transparent -rotate-45" />
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
                    <span>🔥 {dailyParticipantCount} players today</span>
                    <span>⏳ {timeLeft} left</span>
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