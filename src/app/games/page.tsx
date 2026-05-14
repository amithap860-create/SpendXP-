'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { cn } from '@/lib/utils';
import { GameLoadingSkeleton } from '@/components/games/GameLoadingSkeleton';
import { useAgeAdapt } from '@/lib/ageAdaptProvider';
import { ConceptBreakdown } from '@/components/ConceptBreakdown';
import { usePremium } from '@/hooks/usePremium';

const BudgetBlitz = dynamic(() => import('@/components/games/BudgetBlitz').then(mod => mod.BudgetBlitz), {
  loading: () => <GameLoadingSkeleton />,
  ssr: false
});
const FinIQQuiz = dynamic(() => import('@/components/games/FinIQQuiz').then(mod => mod.FinIQQuiz), {
  loading: () => <GameLoadingSkeleton />,
  ssr: false
});
const MoneyMaze = dynamic(() => import('@/components/games/MoneyMaze').then(mod => mod.MoneyMaze), {
  loading: () => <GameLoadingSkeleton />,
  ssr: false
});
const StockMarketSim = dynamic(() => import('@/components/games/StockMarketSim').then(mod => mod.StockMarketSim), {
  loading: () => <GameLoadingSkeleton />,
  ssr: false
});
const CreditScoreBuilder = dynamic(() => import('@/components/games/CreditScoreBuilder').then(mod => mod.CreditScoreBuilder), {
  loading: () => <GameLoadingSkeleton />,
  ssr: false
});

type GameID = 'budgetBlitz' | 'finIQQuiz' | 'moneyMaze' | 'stockMarketSim' | 'creditScoreBuilder';

interface GamesHubProps {
  searchParams: Promise<{ game?: string; mode?: string }>;
}

// ─── Game icons — SVG only, no emoji ─────────────────────────────────────────

function IconBolt({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconBrain({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M9.5 2C7 2 5 4 5 6.5c0 .8.2 1.5.6 2.1C4.2 9.4 3 11 3 13c0 2.5 1.8 4.5 4.2 5C8 19.6 9.2 21 11 21h2c1.8 0 3-1.4 3.8-3 2.4-.5 4.2-2.5 4.2-5 0-2-1.2-3.6-2.6-4.4.4-.6.6-1.3.6-2.1C19 4 17 2 14.5 2c-.9 0-1.7.3-2.5.7C11.2 2.3 10.4 2 9.5 2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconMaze({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 2v5M7 10v7M12 7v3M12 14v5M17 2v8M17 14v5M2 7h5M10 7h2M14 12h3M2 14h5M10 12h2M14 19h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}
function IconChart({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <polyline points="3,17 9,11 13,15 21,7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="17,7 21,7 21,11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconCard({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="2" y1="10" x2="22" y2="10" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="5" y="14" width="5" height="2" rx="0.5" fill="currentColor"/>
    </svg>
  );
}
function IconGroup({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="15" cy="7" r="3" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M3 19c0-3 2.7-5 6-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M21 19c0-3-2.7-5-6-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <path d="M9 19c0-2.8 2-5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function IconLock({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="4" y="9" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M7 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}
function IconStar({ className }: { className?: string }) {
  return (
    <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor" className={className}>
      <path d="M8 1l1.8 5.4H15l-4.6 3.3 1.8 5.4L8 12.1l-4.2 3 1.8-5.4L1 6.4h5.2z"/>
    </svg>
  );
}

// ─── Game definitions ─────────────────────────────────────────────────────────

interface GameDef {
  id: string;
  name: string;
  desc: string;
  accentColor: string; // left bar color
  Icon: React.ComponentType<{ className?: string }>;
  premium?: boolean;
  comingSoon?: boolean;
}

const GAMES: GameDef[] = [
  {
    id: 'budgetBlitz',
    name: 'Budget Blitz',
    desc: 'Sort needs, wants and savings at speed.',
    accentColor: 'bg-primary',
    Icon: IconBolt,
  },
  {
    id: 'finIQQuiz',
    name: 'FinIQ Quiz',
    desc: 'Daily scenarios to test your financial IQ.',
    accentColor: 'bg-[#1A3A5F]',
    Icon: IconBrain,
  },
  {
    id: 'moneyMaze',
    name: 'Money Maze',
    desc: 'Solve puzzles to optimise your allocation.',
    accentColor: 'bg-[#5F3A1A]',
    Icon: IconMaze,
  },
  {
    id: 'stockMarketSim',
    name: 'Stock Market Sim',
    desc: 'Trade virtual stocks based on live news.',
    accentColor: 'bg-[#1A4A3A]',
    Icon: IconChart,
    premium: true,
  },
  {
    id: 'creditScoreBuilder',
    name: 'Credit Builder',
    desc: 'Manage your score through lifecycle choices.',
    accentColor: 'bg-[#3A1A5F]',
    Icon: IconCard,
    premium: true,
  },
  {
    id: 'groupPlay',
    name: 'Group Play',
    desc: 'Challenge friends and compete on leaderboards.',
    accentColor: 'bg-slate-400',
    Icon: IconGroup,
    premium: true,
    comingSoon: true,
  },
];

export default function GamesHub({ searchParams }: GamesHubProps) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const { ageGroup } = useAgeAdapt();
  const { canAccess } = usePremium();

  const [activeGame, setActiveGame] = useState<GameID | null>(null);
  const [isDaily, setIsDaily] = useState(false);
  const [highlightedGame, setHighlightedGame] = useState<string | null>(null);
  const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);

  useEffect(() => {
    document.title = 'Games | SpendXP';
  }, []);

  useEffect(() => {
    const gameParam = resolvedParams.game as GameID;
    const modeParam = resolvedParams.mode;

    if (gameParam) {
      const validGames: GameID[] = [
        'budgetBlitz', 'finIQQuiz', 'moneyMaze', 'stockMarketSim', 'creditScoreBuilder'
      ];
      if (validGames.includes(gameParam)) {
        if (gameParam === 'finIQQuiz' && modeParam === 'daily') {
          setIsDaily(true);
          setShowDailyBreakdown(true);
          setActiveGame('finIQQuiz');
        } else {
          setHighlightedGame(gameParam);
          setTimeout(() => {
            document.getElementById(`game-card-${gameParam}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 100);
          setTimeout(() => setHighlightedGame(null), 2000);
        }
      }
      router.replace('/games');
    }
  }, [resolvedParams, router]);

  const dailyTopics = ['budgeting-basics', 'investing-basics', 'credit-scores', 'taxes-india', 'spending-habits', 'emergency-fund', 'emi-and-debt'];
  const todayBreakdownId = dailyTopics[new Date().getDate() % dailyTopics.length];

  const renderGame = () => {
    if (isDaily && showDailyBreakdown) {
      return (
        <ConceptBreakdown
          breakdownId={todayBreakdownId}
          ageGroup={ageGroup}
          activityType="challenge"
          activityTitle="FinIQ Daily Blitz"
          onContinue={() => setShowDailyBreakdown(false)}
        />
      );
    }
    switch (activeGame) {
      case 'budgetBlitz':       return <BudgetBlitz onExit={() => setActiveGame(null)} />;
      case 'finIQQuiz':         return <FinIQQuiz onExit={() => setActiveGame(null)} isDailyChallenge={isDaily} />;
      case 'moneyMaze':         return <MoneyMaze onExit={() => setActiveGame(null)} />;
      case 'stockMarketSim':    return <StockMarketSim onExit={() => setActiveGame(null)} />;
      case 'creditScoreBuilder':return <CreditScoreBuilder onExit={() => setActiveGame(null)} />;
      default:                  return null;
    }
  };

  return (
    <div className="min-h-screen-safe bg-slate-50 flex flex-col">
      <EmailVerificationBanner />

      {!activeGame ? (
        <main className="max-w-5xl mx-auto px-4 py-8 w-full space-y-8">
          <header>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Arcade</h1>
            <p className="text-slate-500 font-medium">Learn by playing. Earn XP to level up.</p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {GAMES.map(game => {
              const isLocked = game.premium && !canAccess(game.id as any);
              const handleClick = () => {
                if (game.comingSoon) {
                  // Coming-soon features → join the waitlist on the upgrade page
                  router.push('/upgrade');
                } else if (isLocked) {
                  router.push('/upgrade');
                } else {
                  setActiveGame(game.id as GameID);
                }
              };
              return (
                <GameCard
                  key={game.id}
                  game={game}
                  isHighlighted={highlightedGame === game.id}
                  locked={!!isLocked}
                  onClick={handleClick}
                />
              );
            })}
          </div>
        </main>
      ) : (
        <main className="flex-1 p-0 md:p-4 flex items-center justify-center">
          <div className={cn(
            "w-full animate-in zoom-in duration-300",
            (isDaily && showDailyBreakdown) ? "max-w-none" : "max-w-4xl p-4"
          )}>
            {!showDailyBreakdown && (
              <button
                onClick={() => { setActiveGame(null); setIsDaily(false); }}
                className="mb-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-2 h-11 px-4 rounded-xl hover:bg-slate-100 transition-colors"
              >
                Back to Arcade
              </button>
            )}
            {renderGame()}
          </div>
        </main>
      )}
    </div>
  );
}

function GameCard({
  game,
  isHighlighted,
  locked,
  onClick,
}: {
  game: GameDef;
  isHighlighted: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  const { Icon } = game;
  return (
    <button
      id={`game-card-${game.id}`}
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl border-[0.5px] border-slate-200 p-6 md:p-8 shadow-sm transition-all text-left group overflow-hidden relative",
        "ring-offset-2 min-h-[160px] flex flex-col justify-between",
        isHighlighted ? "ring-2 ring-primary" : "ring-0 transition-all duration-1000",
        locked ? "opacity-80 hover:opacity-100 cursor-pointer" : "hover:shadow-xl hover:-translate-y-1"
      )}
    >
      {/* Left accent bar */}
      <div className={cn("absolute top-0 left-0 w-2 h-full", locked ? "bg-slate-200" : game.accentColor)} />

      {/* Premium / Coming Soon badge */}
      {locked && (
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
          {game.comingSoon ? (
            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
              Waitlist
            </span>
          ) : (
            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <IconStar />
              Premium
            </span>
          )}
        </div>
      )}

      <div>
        <div className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          locked ? "bg-slate-100 text-slate-400" : "bg-primary/10 text-primary"
        )}>
          <Icon />
        </div>
        <h3 className={cn(
          "text-xl font-black mb-2 transition-colors",
          locked ? "text-slate-400" : "text-slate-900 group-hover:text-primary"
        )}>
          {game.name}
        </h3>
        <p className="text-sm text-slate-500 font-medium leading-snug">{game.desc}</p>
      </div>

      <div className="flex justify-end pt-4">
        {locked ? (
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
            {game.comingSoon ? 'JOIN WAITLIST →' : <><IconLock />UNLOCK</>}
          </span>
        ) : (
          <span className="text-[10px] font-black text-slate-300 group-hover:text-primary transition-colors uppercase tracking-widest">
            PLAY NOW
          </span>
        )}
      </div>
    </button>
  );
}
