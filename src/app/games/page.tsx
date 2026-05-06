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

export default function GamesHub({ searchParams }: GamesHubProps) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  const { ageGroup } = useAgeAdapt();
  const { canAccess } = usePremium();
  
  const [activeGame, setActiveGame] = useState<GameID | null>(null);
  const [isDaily, setIsDaily] = useState(false);

  useEffect(() => {
    document.title = 'Games | SpendXP';
  }, []);
  const [highlightedGame, setHighlightedGame] = useState<string | null>(null);
  const [showDailyBreakdown, setShowDailyBreakdown] = useState(false);

  useEffect(() => {
    const gameParam = resolvedParams.game as GameID;
    const modeParam = resolvedParams.mode;
    
    if (gameParam) {
      const validGames: GameID[] = [
        'budgetBlitz',
        'finIQQuiz',
        'moneyMaze',
        'stockMarketSim',
        'creditScoreBuilder'
      ];

      if (validGames.includes(gameParam)) {
        if (gameParam === 'finIQQuiz' && modeParam === 'daily') {
          setIsDaily(true);
          setShowDailyBreakdown(true);
          setActiveGame('finIQQuiz');
        } else {
          setHighlightedGame(gameParam);
          setTimeout(() => {
            const element = document.getElementById(`game-card-${gameParam}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
          setTimeout(() => {
            setHighlightedGame(null);
          }, 2000);
        }
      }
      router.replace('/games');
    }
  }, [resolvedParams, router]);

  // Deterministic topic for daily challenge based on day of month
  const dailyTopics = ['budgeting-basics', 'investing-basics', 'credit-scores', 'taxes-india', 'spending-habits', 'emergency-fund', 'emi-and-debt'];
  const todayIndex = new Date().getDate() % dailyTopics.length;
  const todayBreakdownId = dailyTopics[todayIndex];

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
      case 'budgetBlitz': return <BudgetBlitz onExit={() => setActiveGame(null)} />;
      case 'finIQQuiz': return <FinIQQuiz onExit={() => setActiveGame(null)} isDailyChallenge={isDaily} />;
      case 'moneyMaze': return <MoneyMaze onExit={() => setActiveGame(null)} />;
      case 'stockMarketSim': return <StockMarketSim onExit={() => setActiveGame(null)} />;
      case 'creditScoreBuilder': return <CreditScoreBuilder onExit={() => setActiveGame(null)} />;
      default: return null;
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
            {/* FREE games */}
            <GameCard
              id="budgetBlitz"
              name="Budget Blitz"
              desc="Sort needs, wants and savings at speed."
              color="bg-primary"
              emoji="⚡"
              isHighlighted={highlightedGame === 'budgetBlitz'}
              onClick={() => setActiveGame('budgetBlitz')}
            />
            <GameCard
              id="finIQQuiz"
              name="FinIQ Quiz"
              desc="Daily scenarios to test your financial IQ."
              color="bg-blue-500"
              emoji="🧠"
              isHighlighted={highlightedGame === 'finIQQuiz'}
              onClick={() => setActiveGame('finIQQuiz')}
            />
            <GameCard
              id="moneyMaze"
              name="Money Maze"
              desc="Solve puzzles to optimize your allocation."
              color="bg-rose-500"
              emoji="🌀"
              isHighlighted={highlightedGame === 'moneyMaze'}
              onClick={() => setActiveGame('moneyMaze')}
            />

            {/* PREMIUM games */}
            <GameCard
              id="stockMarketSim"
              name="Stock Market Sim"
              desc="Trade virtual stocks based on live news."
              color="bg-amber-500"
              emoji="📈"
              isHighlighted={highlightedGame === 'stockMarketSim'}
              locked={!canAccess('stock_market_sim')}
              onClick={() => canAccess('stock_market_sim') ? setActiveGame('stockMarketSim') : router.push('/upgrade')}
            />
            <GameCard
              id="creditScoreBuilder"
              name="Credit Builder"
              desc="Manage your score through lifecycle choices."
              color="bg-violet-500"
              emoji="💳"
              isHighlighted={highlightedGame === 'creditScoreBuilder'}
              locked={!canAccess('credit_score_builder')}
              onClick={() => canAccess('credit_score_builder') ? setActiveGame('creditScoreBuilder') : router.push('/upgrade')}
            />

            {/* Group Play — coming soon (premium) */}
            <GameCard
              id="groupPlay"
              name="Group Play"
              desc="Challenge friends and compete on leaderboards."
              color="bg-slate-400"
              emoji="👥"
              isHighlighted={false}
              locked
              comingSoon
              onClick={() => router.push('/upgrade')}
            />
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
                onClick={() => {
                  setActiveGame(null);
                  setIsDaily(false);
                }}
                className="mb-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest flex items-center gap-2 h-11 px-4 rounded-xl hover:bg-slate-100 transition-colors"
              >
                ← Back to Arcade
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
  id,
  name,
  desc,
  color,
  emoji,
  onClick,
  isHighlighted,
  locked = false,
  comingSoon = false,
}: {
  id: string;
  name: string;
  desc: string;
  color: string;
  emoji: string;
  onClick: () => void;
  isHighlighted: boolean;
  locked?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <button
      id={`game-card-${id}`}
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl border-[0.5px] border-slate-200 p-6 md:p-8 shadow-sm transition-all text-left group overflow-hidden relative",
        "ring-offset-2",
        isHighlighted ? "ring-2 ring-primary" : "ring-0 transition-all duration-1000",
        "min-h-[160px] flex flex-col justify-between",
        locked ? "opacity-80 hover:opacity-100 cursor-pointer" : "hover:shadow-xl hover:-translate-y-1"
      )}
    >
      <div className={cn("absolute top-0 left-0 w-2 h-full", locked ? "bg-slate-300" : color)} />

      {/* Lock / Coming Soon badges */}
      {locked && (
        <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
          {comingSoon ? (
            <span className="text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-full">Coming Soon</span>
          ) : (
            <span className="text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">✨ Premium</span>
          )}
        </div>
      )}

      <div>
        <div className="text-2xl mb-2">{emoji}</div>
        <h3 className={cn(
          "text-xl font-black mb-2 transition-colors",
          locked ? "text-slate-400" : "text-slate-900 group-hover:text-primary"
        )}>{name}</h3>
        <p className="text-sm text-slate-500 font-medium leading-snug">{desc}</p>
      </div>

      <div className="flex justify-end pt-4">
        {locked ? (
          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
            {comingSoon ? 'COMING SOON' : '🔒 UNLOCK →'}
          </span>
        ) : (
          <span className="text-[10px] font-black text-slate-300 group-hover:text-primary transition-colors uppercase tracking-widest">
            PLAY NOW →
          </span>
        )}
      </div>
    </button>
  );
}
