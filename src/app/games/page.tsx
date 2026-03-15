'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { BudgetBlitz } from '@/components/games/BudgetBlitz';
import { FinIQQuiz } from '@/components/games/FinIQQuiz';
import { MoneyMaze } from '@/components/games/MoneyMaze';
import { StockMarketSim } from '@/components/games/StockMarketSim';
import { CreditScoreBuilder } from '@/components/games/CreditScoreBuilder';
import { CompoundClicker } from '@/components/games/CompoundClicker';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { cn } from '@/lib/utils';

type GameID = 'budgetBlitz' | 'finIQQuiz' | 'moneyMaze' | 'stockMarketSim' | 'creditScoreBuilder' | 'compoundClicker';

interface GamesHubProps {
  searchParams: Promise<{ game?: string; mode?: string }>;
}

export default function GamesHub({ searchParams }: GamesHubProps) {
  const router = useRouter();
  const resolvedParams = use(searchParams);
  
  const [activeGame, setActiveGame] = useState<GameID | null>(null);
  const [isDaily, setIsDaily] = useState(false);
  const [highlightedGame, setHighlightedGame] = useState<string | null>(null);

  useEffect(() => {
    const gameParam = resolvedParams.game as GameID;
    const modeParam = resolvedParams.mode;
    
    if (gameParam) {
      const validGames: GameID[] = [
        'budgetBlitz', 
        'finIQQuiz', 
        'moneyMaze', 
        'stockMarketSim', 
        'creditScoreBuilder', 
        'compoundClicker'
      ];

      if (validGames.includes(gameParam)) {
        if (gameParam === 'finIQQuiz' && modeParam === 'daily') {
          // Special case: Direct open for daily challenge
          setActiveGame('finIQQuiz');
          setIsDaily(true);
        } else {
          // Normal case: Highlight and scroll
          setHighlightedGame(gameParam);
          
          // Use a small timeout to ensure DOM is ready for scrolling
          setTimeout(() => {
            const element = document.getElementById(`game-card-${gameParam}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);

          // Remove highlight after 2 seconds
          setTimeout(() => {
            setHighlightedGame(null);
          }, 2000);
        }
      }
      
      // Clear params from URL
      router.replace('/games');
    }
  }, [resolvedParams, router]);

  const renderGame = () => {
    switch (activeGame) {
      case 'budgetBlitz': return <BudgetBlitz onExit={() => setActiveGame(null)} />;
      case 'finIQQuiz': return <FinIQQuiz onExit={() => setActiveGame(null)} isDailyChallenge={isDaily} dailyMode={isDaily} />;
      case 'moneyMaze': return <MoneyMaze onExit={() => setActiveGame(null)} />;
      case 'stockMarketSim': return <StockMarketSim onExit={() => setActiveGame(null)} />;
      case 'creditScoreBuilder': return <CreditScoreBuilder onExit={() => setActiveGame(null)} />;
      case 'compoundClicker': return <CompoundClicker onExit={() => setActiveGame(null)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <EmailVerificationBanner />
      
      {!activeGame ? (
        <main className="max-w-5xl mx-auto px-4 py-8 w-full space-y-8">
          <header>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Arcade</h1>
            <p className="text-slate-500 font-medium">Learn by playing. Earn XP to level up.</p>
          </header>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <GameCard 
              id="budgetBlitz"
              name="Budget Blitz" 
              desc="Sort needs, wants and savings at speed." 
              color="bg-emerald-500" 
              isHighlighted={highlightedGame === 'budgetBlitz'}
              onClick={() => setActiveGame('budgetBlitz')} 
            />
            <GameCard 
              id="finIQQuiz"
              name="FinIQ Quiz" 
              desc="Daily scenarios to test your financial IQ." 
              color="bg-blue-500" 
              isHighlighted={highlightedGame === 'finIQQuiz'}
              onClick={() => setActiveGame('finIQQuiz')} 
            />
            <GameCard 
              id="stockMarketSim"
              name="Stock Market Sim" 
              desc="Trade virtual stocks based on live news." 
              color="bg-indigo-500" 
              isHighlighted={highlightedGame === 'stockMarketSim'}
              onClick={() => setActiveGame('stockMarketSim')} 
            />
            <GameCard 
              id="creditScoreBuilder"
              name="Credit Builder" 
              desc="Manage your score through lifecycle choices." 
              color="bg-purple-500" 
              isHighlighted={highlightedGame === 'creditScoreBuilder'}
              onClick={() => setActiveGame('creditScoreBuilder')} 
            />
            <GameCard 
              id="compoundClicker"
              name="Compound Clicker" 
              desc="See the magic of long-term growth." 
              color="bg-amber-500" 
              isHighlighted={highlightedGame === 'compoundClicker'}
              onClick={() => setActiveGame('compoundClicker')} 
            />
            <GameCard 
              id="moneyMaze"
              name="Money Maze" 
              desc="Solve puzzles to optimize your allocation." 
              color="bg-rose-500" 
              isHighlighted={highlightedGame === 'moneyMaze'}
              onClick={() => setActiveGame('moneyMaze')} 
            />
          </div>
        </main>
      ) : (
        <main className="flex-1 p-4 flex items-center justify-center">
          <div className="w-full max-w-4xl animate-in zoom-in duration-300">
            <button 
              onClick={() => {
                setActiveGame(null);
                setIsDaily(false);
              }}
              className="mb-4 text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
            >
              ← Back to Arcade
            </button>
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
  onClick, 
  isHighlighted 
}: { 
  id: string; 
  name: string; 
  desc: string; 
  color: string; 
  onClick: () => void;
  isHighlighted: boolean;
}) {
  return (
    <button 
      id={`game-card-${id}`}
      onClick={onClick}
      className={cn(
        "bg-white rounded-3xl border-[0.5px] border-slate-200 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group overflow-hidden relative",
        "ring-offset-2",
        isHighlighted ? "ring-2 ring-teal-500" : "ring-0 transition-all duration-1000"
      )}
    >
      <div className={cn("absolute top-0 left-0 w-2 h-full", color)} />
      <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-teal-600 transition-colors">{name}</h3>
      <p className="text-sm text-slate-500 font-medium leading-snug">{desc}</p>
      <div className="mt-6 flex justify-end">
        <span className="text-xs font-black text-slate-300 group-hover:text-teal-600 transition-colors">PLAY NOW →</span>
      </div>
    </button>
  );
}
