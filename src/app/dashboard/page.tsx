'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { 
  db, 
  safeGetDoc, 
  safeOnSnapshot, 
  useFirestore, 
  useMemoFirebase 
} from '@/firebase';
import { 
  doc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  Timestamp
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
  formatCompact, 
  formatRelativeTime 
} from '@/lib/dateHelpers';
import { RadarChart } from '@/components/charts/RadarChart';
import { lessons } from '@/data/lessons';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuthContext();
  const { formatINR } = useCurrency();
  const [loading, setLoading] = useState(true);
  
  // Data State
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
    if (!user) return;

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
          getAllGameScores(db, user.uid),
          getConceptStrengths(db, user.uid),
          getDocs(collection(db, 'users', user.uid, 'lessonProgress')),
          safeGetDoc(doc(db, 'dailyChallenges', istDateKey))
        ]);

        setProfile(profileData);
        setProgression(progData);
        setGameScores(scoresData);
        setStrengths(strengthsData);
        setCompletedLessonsCount(tasksSnap.docs.filter(d => d.data().completed).length);
        setDailyParticipantCount(dailyDoc?.participantCount || 0);

        // Fetch rank for daily challenge
        const rankSnap = await getDocs(query(
          collection(db, 'dailyChallenges', istDateKey, 'scores'),
          orderBy('score', 'desc')
        ));
        const userRankIndex = rankSnap.docs.findIndex(d => d.id === user.uid);
        if (userRankIndex !== -1) {
          setDailyRank({
            score: rankSnap.docs[userRankIndex].data().score,
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

    // Listen to activity log in real time
    const activityQuery = query(
      collection(db, 'users', user.uid, 'activityLog'),
      orderBy('playedAt', 'desc'),
      limit(10)
    );
    const unsubActivity = safeOnSnapshot(activityQuery, (snap) => {
      setActivityLog(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Timer for daily challenge reset
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
    if (!progression || progression.totalGamesPlayed === 0) 
      return "Welcome to SpendXP! Start your first game to earn XP.";
    if (!dailyRank) 
      return "Daily challenge available — play now to keep your streak!";
    // Add other contextual sub-titles here as needed
    return `You've earned ${progression.totalXP?.toLocaleString()} XP so far. Keep going!`;
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

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-8">
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-8 animate-in fade-in duration-700">
        
        {/* HERO HEADER */}
        <section className="bg-white rounded-3xl border-[0.5px] border-slate-200 p-8 shadow-sm grid md:grid-cols-2 gap-8 items-center overflow-hidden relative">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                {greeting}, {profile?.displayName?.split(' ')[0]}!
              </h1>
              <p className="text-slate-500 font-medium mt-1">{subtitle}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-xs font-black uppercase tracking-widest">
                {progression?.level === 1 ? 'Starter' : progression?.level === 2 ? 'Saver' : 'Investor'}
              </span>
              <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest">
                {profile?.ageGroup} • {profile?.birthYear ? (new Date().getFullYear() - profile.birthYear) : '8-20'}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90">
                <circle
                  cx="64" cy="64" r="54"
                  fill="none" stroke="#f1f5f9" strokeWidth="8"
                />
                <circle
                  cx="64" cy="64" r="54"
                  fill="none" stroke="#14b8a6" strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={(2 * Math.PI * 54) * (1 - (levelProgress / 100))}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900">{formatCompact(progression?.totalXP || 0)}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">XP</span>
              </div>
            </div>
            <div className="mt-2 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                / {formatCompact(nextLevelXP)} XP to Next Rank
              </p>
            </div>
          </div>
        </section>

        {/* STREAKS & STATS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border-[0.5px] border-slate-200 shadow-sm text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-black text-slate-900">3</span>
              <div className="w-4 h-5 relative">
                <div className="absolute bottom-0 left-0 w-full h-full bg-orange-500 rounded-t-full rounded-br-full -rotate-45" />
                <div className="absolute bottom-1 left-1 w-1/2 h-1/2 bg-yellow-400 rounded-t-full rounded-br-full -rotate-45" />
              </div>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Day Streak</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border-[0.5px] border-slate-200 shadow-sm text-center space-y-1">
            <span className="text-2xl font-black text-slate-900">{progression?.totalGamesPlayed || 0}</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Games Played</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border-[0.5px] border-slate-200 shadow-sm text-center space-y-1">
            <span className="text-xl font-black text-slate-900 truncate block">
              {formatINR(progression?.walletBalance || 0)}
            </span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Saved Virtually</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border-[0.5px] border-slate-200 shadow-sm text-center space-y-1">
            <span className="text-2xl font-black text-slate-900">{completedLessonsCount} / 6</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lessons Done</p>
          </div>
        </section>

        {/* CONTINUE PLAYING */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Continue playing</h2>
            <Link href="/games" className="text-xs font-bold text-teal-600 hover:underline">View all</Link>
          </div>
          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible">
            {recommendedGames.slice(0, 6).map((game) => (
              <Link 
                key={game.id} 
                href={`/games?game=${game.id}`}
                className="flex-shrink-0 w-[200px] h-[140px] md:w-full bg-white rounded-2xl border-[0.5px] border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-teal-600 transition-colors">{game.name}</h3>
                  <p className="text-[10px] text-slate-400 font-medium">
                    Best: {gameScores?.[game.id as keyof GameScores]?.highScore || 'Not played'}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <div className="w-2 h-2 rounded-full bg-teal-500" />
                    <div className="w-2 h-2 rounded-full bg-slate-200" />
                  </div>
                  <span className="text-xs font-black text-teal-600 group-hover:translate-x-1 transition-transform">Play →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          {/* KNOWLEDGE RADAR */}
          <section className="bg-white rounded-3xl border-[0.5px] border-slate-200 p-8 shadow-sm flex flex-col items-center">
            <h2 className="w-full text-sm font-black text-slate-900 uppercase tracking-tight mb-8">Financial knowledge</h2>
            {strengths ? (
              <>
                <RadarChart scores={strengths} size={220} />
                <div className="w-full mt-8 grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Strongest</p>
                    <span className="px-2 py-1 bg-teal-50 text-teal-600 rounded-lg text-[10px] font-black uppercase">
                      {Object.entries(strengths).sort((a,b) => b[1]-a[1])[0][0]}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Focus next</p>
                    <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase">
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
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Today's challenge</h2>
            <div className="bg-white rounded-3xl border-[0.5px] border-l-4 border-l-teal-500 border-slate-200 p-8 shadow-sm space-y-6">
              {dailyRank ? (
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-teal-100 rounded-2xl flex items-center justify-center text-teal-600">
                    <div className="w-6 h-6 border-4 border-teal-600 rounded-full border-t-transparent -rotate-45" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900">Completed today!</h3>
                    <p className="text-xs text-slate-500 font-medium">You scored {dailyRank.score} · Rank #{dailyRank.rank}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-1">
                    <h3 className="text-xl font-black text-slate-900">FinIQ Daily Blitz</h3>
                    <p className="text-sm text-slate-500 font-medium leading-tight">Same questions for everyone — see how you rank against 50,000+ users.</p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>🔥 {dailyParticipantCount} players today</span>
                    <span>⏳ Resets in {timeLeft}</span>
                  </div>
                  <Link href="/games?game=finIQQuiz&mode=daily">
                    <button className="w-full h-12 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest hover:bg-slate-800 transition-colors">
                      Play Now
                    </button>
                  </Link>
                </>
              )}
            </div>
          </section>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* LEARNING PATH */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Learning path</h2>
            <div className="bg-white rounded-3xl border-[0.5px] border-slate-200 p-8 shadow-sm space-y-8">
              <div className="flex justify-between items-center relative">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-100 -translate-y-1/2" />
                {lessons.map((lesson, i) => (
                  <div key={lesson.id} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                      i < completedLessonsCount 
                        ? "bg-teal-500 border-teal-500" 
                        : i === completedLessonsCount 
                          ? "bg-white border-teal-500 animate-pulse scale-110 shadow-lg shadow-teal-500/20" 
                          : "bg-white border-slate-200"
                    )}>
                      {i < completedLessonsCount && <div className="w-2 h-3 border-r-2 border-b-2 border-white rotate-45 mb-0.5" />}
                    </div>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{lesson.topic}</span>
                  </div>
                ))}
              </div>

              {completedLessonsCount < lessons.length ? (
                <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                  <div>
                    <h4 className="font-black text-slate-900 text-sm">Next: {lessons[completedLessonsCount].title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">~3 min read · +80 XP</p>
                  </div>
                  <Link href={`/learn?lesson=${lessons[completedLessonsCount].id}`}>
                    <button className="w-full h-10 bg-teal-500 text-white rounded-lg font-black uppercase text-xs tracking-widest shadow-lg shadow-teal-500/20">
                      Start Lesson
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="p-6 bg-teal-50 rounded-2xl text-center">
                  <p className="text-teal-600 font-black text-sm uppercase">Scholar Badge Earned!</p>
                </div>
              )}
            </div>
          </section>

          {/* RECENT ACTIVITY */}
          <section className="space-y-4">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-tight">Recent activity</h2>
            <div className="bg-white rounded-3xl border-[0.5px] border-slate-200 p-6 shadow-sm space-y-4">
              {activityLog.length > 0 ? (
                <div className="space-y-4">
                  {activityLog.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          activity.type === 'game' ? 'bg-rose-400' : 'bg-teal-400'
                        )} />
                        <div>
                          <p className="text-xs font-bold text-slate-700">
                            {activity.gameName || 'Academy Lesson'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            +{activity.xpEarned} XP
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-300">
                        {formatRelativeTime(activity.playedAt)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-slate-400 text-xs font-medium">No activity yet. Play a game to start!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* PARENT NUDGE */}
        {profile && !profile.parentLinked && (profile.ageGroup === 'junior' || profile.ageGroup === 'teen') && !nudgeDismissed && (
          <section className="bg-amber-50 rounded-3xl border-[0.5px] border-l-4 border-l-amber-500 border-amber-100 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-black text-slate-900 uppercase tracking-tight">Connect your parent</h3>
              <p className="text-sm text-slate-600 font-medium">Share your progress and earn the Family Linked badge (+50 XP).</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={() => setNudgeDismissed(true)}
                className="flex-1 px-6 h-12 bg-white text-slate-400 rounded-xl font-bold text-sm border-[0.5px] border-slate-200"
              >
                Maybe later
              </button>
              <Link href="/profile#parent-connection" className="flex-1">
                <button className="w-full px-6 h-12 bg-amber-500 text-white rounded-xl font-black uppercase text-sm tracking-widest shadow-lg shadow-amber-500/20">
                  Connect
                </button>
              </Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 animate-pulse">
      <div className="h-48 bg-white rounded-3xl border border-slate-100" />
      <div className="grid grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100" />)}
      </div>
      <div className="space-y-4">
        <div className="h-4 w-32 bg-slate-200 rounded" />
        <div className="flex gap-4 overflow-hidden">
          {[1,2,3].map(i => <div key={i} className="min-w-[200px] h-[140px] bg-white rounded-2xl border border-slate-100" />)}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="h-64 bg-white rounded-3xl border border-slate-100" />
        <div className="h-64 bg-white rounded-3xl border border-slate-100" />
      </div>
    </div>
  );
}
