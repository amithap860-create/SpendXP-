"use client"

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useUser } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { lessons, Lesson } from '@/data/lessons';
import { LessonViewer } from '@/components/learn/LessonViewer';
import { EmailVerificationBanner } from '@/components/EmailVerificationBanner';
import { 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Zap, 
  ArrowRight,
  GraduationCap,
  Trophy,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/AuthContext';
import { awardBadge } from '@/lib/badgeService';

// lessons.ts's `relatedGame` values don't all match the games hub's actual
// GameID strings (e.g. lessons use 'finIQ', the games hub uses 'finIQQuiz').
// This maps lesson data -> the real game id/name so links + labels are correct.
const GAME_INFO: Record<string, { id: string; name: string }> = {
  budgetBlitz: { id: 'budgetBlitz', name: 'Budget Blitz' },
  finIQ: { id: 'finIQQuiz', name: 'FinIQ Quiz' },
  moneyMaze: { id: 'moneyMaze', name: 'Money Maze' },
  stockMarketSim: { id: 'stockMarketSim', name: 'Stock Market Sim' },
  creditScoreBuilder: { id: 'creditScoreBuilder', name: 'Credit Builder' },
};

export default function LearnHub() {
  const { user } = useAuthContext();
  const { tasks, ageGroup } = useUser();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    document.title = 'Learn | SpendXP';
  }, []);

  // Preserves lessons.ts's authored order — that order IS the intended
  // learning path, so filtering (not resorting) keeps sequencing correct.
  const availableLessons = lessons.filter(l => l.ageGroups.includes((ageGroup || 'junior') as any));
  const isLessonComplete = (id: string) => !!tasks.find(t => t.id === `lesson-${id}`)?.completed;
  const completedCount = lessons.filter(l => isLessonComplete(l.id)).length;
  const overallProgress = (completedCount / lessons.length) * 100;

  const handleLessonFinish = async (lessonId: string) => {
    const wasAlreadyComplete = !!tasks.find(t => t.id === `lesson-${lessonId}`)?.completed;
    setActiveLesson(null);
    // Only award Scholar when this was the final *new* lesson completed
    if (user && !wasAlreadyComplete && completedCount + 1 === lessons.length) {
      await awardBadge(user.uid, 'scholar');
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 flex flex-col max-w-7xl mx-auto p-4 md:p-8">
        <EmailVerificationBanner />
        
        <div className="space-y-8">
          <header className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase mb-3">
                  <GraduationCap className="h-3 w-3" /> Academy Hub
                </div>
                <h2 className="text-4xl font-black text-foreground tracking-tight">Level Up Your Knowledge</h2>
                <p className="text-muted-foreground text-lg font-medium">Complete lessons to earn XP and master financial strategies.</p>
              </div>
              <div className="w-full md:w-80 p-6 bg-card rounded-2xl shadow-xl space-y-4 border">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase text-muted-foreground">Academy Completion</span>
                  <span className="text-xl font-black text-primary">{completedCount}/{lessons.length}</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
                {completedCount === lessons.length ? (
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-tighter">
                    <Star className="h-4 w-4 fill-current" /> Finance Scholar Badge Earned!
                  </div>
                ) : (
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Complete all {lessons.length} to earn Scholar Badge</p>
                )}
              </div>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => {
              const isCompleted = isLessonComplete(lesson.id);
              const xpReward = lesson.cards.reduce((acc, c) => acc + c.xpReward, 0);
              const isAgeAppropriate = !!availableLessons.find(l => l.id === lesson.id);

              // Hard-locked linear path: within this user's age-appropriate
              // lessons (in lessons.ts's authored order), a lesson is locked
              // until the lesson before it is completed.
              // BUG FIX (2026-09): this used to lock a lesson purely based on
              // whether its predecessor was done, with no exemption for
              // lessons the user had ALREADY completed (e.g. done out of
              // order before this sequencing existed, or simply out of
              // order). That meant a finished lesson could re-lock itself
              // and become inaccessible for review — exactly the "still
              // locked after completing" symptom reported. A completed
              // lesson must never be treated as locked.
              const sequenceIndex = availableLessons.findIndex(l => l.id === lesson.id);
              const prevLesson = sequenceIndex > 0 ? availableLessons[sequenceIndex - 1] : null;
              const isSequenceLocked = !isCompleted && isAgeAppropriate && !!prevLesson && !isLessonComplete(prevLesson.id);
              const isLocked = !isCompleted && (!isAgeAppropriate || isSequenceLocked);

              const game = GAME_INFO[lesson.relatedGame];

              return (
                <Card
                  key={lesson.id}
                  className={cn(
                    "group hover:shadow-2xl transition-all cursor-pointer border-none bg-card overflow-hidden flex flex-col",
                    isCompleted && "ring-2 ring-primary/20",
                    isLocked && "opacity-50 grayscale"
                  )}
                  onClick={() => !isLocked && setActiveLesson(lesson)}
                >
                  <div className={cn(
                    "h-2",
                    lesson.topic === 'budgeting' ? "bg-[#1A3A5F]" :
                    lesson.topic === 'investing' ? "bg-primary" :
                    lesson.topic === 'saving' ? "bg-primary" :
                    lesson.topic === 'credit' ? "bg-secondary" :
                    lesson.topic === 'taxes' ? "bg-rose-500" : "bg-slate-500"
                  )} />
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      {isCompleted ? (
                        <Badge className="bg-[#C8E8D8] text-primary hover:bg-[#C8E8D8] border-none gap-1 font-black">
                          <CheckCircle2 className="h-3 w-3" /> DONE
                        </Badge>
                      ) : isLocked ? (
                        <Badge variant="outline" className="text-[10px] uppercase font-black">LOCKED</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-black">
                          +{xpReward} XP
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="font-medium">
                      {!isAgeAppropriate
                        ? `Available for ${lesson.ageGroups.join('/')} level`
                        : isSequenceLocked && prevLesson
                          ? `Complete "${prevLesson.title}" first`
                          : `Master the basics of ${lesson.topic}.`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4 space-y-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.estimatedMinutes}m read</div>
                      <div className="flex items-center gap-1"><Trophy className="h-3 w-3" /> Strategy</div>
                    </div>
                    <button
                      className={cn(
                        "w-full h-12 flex items-center justify-center gap-2 font-black rounded-xl border-2 transition-all",
                        isCompleted ? "border-border text-muted-foreground" : "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      )}
                      disabled={isLocked}
                      suppressHydrationWarning
                    >
                      {isCompleted ? 'Review Lesson' : 'Start Learning'} <ArrowRight className="h-4 w-4" />
                    </button>
                    {isCompleted && game && (
                      <a
                        href={`/games?game=${game.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full h-11 flex items-center justify-center gap-2 font-black rounded-xl bg-muted text-primary hover:bg-primary/10 transition-colors text-sm"
                      >
                        <Zap className="h-4 w-4" /> Practice in {game.name}
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Rendered via portal so it sits above the sticky nav at document.body level */}
          {activeLesson && typeof document !== 'undefined' && createPortal(
            <LessonViewer
              lesson={activeLesson}
              onClose={() => handleLessonFinish(activeLesson.id)}
            />,
            document.body
          )}

          {/* ── More to Explore ── */}
          <div className="mt-12 pt-8 border-t border-border space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">More to Explore</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <a href="/tools" className="group flex items-center gap-4 bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M14 3a3 3 0 0 1 0 6 3 3 0 0 1-2.45-1.26L5.7 13.6a1.5 1.5 0 1 1-2.12-2.12l5.86-5.87A3 3 0 0 1 14 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-black text-foreground text-sm group-hover:text-primary transition-colors">Financial Tools</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">EMI, compound interest, SIP &amp; more calculators</p>
                </div>
                <span className="ml-auto text-xs font-black text-slate-300 group-hover:text-primary transition-colors">→</span>
              </a>
              <a href="/resources" className="group flex items-center gap-4 bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M2 5c0-1.1.9-2 2-2h4a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    <path d="M22 5c0-1.1-.9-2-2-2h-4a2 2 0 0 0-2 2v10h6a2 2 0 0 0 2-2V5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                    <line x1="12" y1="5" x2="12" y2="15" stroke="currentColor" strokeWidth="1.8"/>
                    <line x1="2" y1="19" x2="22" y2="19" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="font-black text-foreground text-sm group-hover:text-primary transition-colors">Resource Library</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">Frameworks, budgeting methods &amp; curriculum map</p>
                </div>
                <span className="ml-auto text-xs font-black text-slate-300 group-hover:text-primary transition-colors">→</span>
              </a>
              <a href="/flashcards" className="group flex items-center gap-4 bg-card rounded-2xl border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-colors">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                    <rect x="7" y="9" width="14" height="10" rx="2" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.8"/>
                  </svg>
                </div>
                <div>
                  <p className="font-black text-foreground text-sm group-hover:text-primary transition-colors">Flashcards</p>
                  <p className="text-xs text-muted-foreground font-medium mt-0.5">AI-generated quick-review cards for you</p>
                </div>
                <span className="ml-auto text-xs font-black text-slate-300 group-hover:text-primary transition-colors">→</span>
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
