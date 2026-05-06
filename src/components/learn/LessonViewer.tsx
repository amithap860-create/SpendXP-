import React, { useState } from 'react';
import { Lesson, LessonCard } from '@/data/lessons';
import { useAgeAdapt } from '@/lib/ageAdaptProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft, CheckCircle2, Zap, ArrowRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/store';
import { LearnMoreLink } from '@/components/LearnMoreLink';
import { useAuthContext } from '@/context/AuthContext';
import { db, safeUpdateDoc } from '@/firebase';
import { doc, increment } from 'firebase/firestore';

interface LessonViewerProps {
  lesson: Lesson;
  onClose: () => void;
}

export function LessonViewer({ lesson, onClose }: LessonViewerProps) {
  const { ageGroup } = useAgeAdapt();
  const { completeTask } = useUser();
  const { user } = useAuthContext();
  // Steps: 0..cards.length-1 = lesson cards, cards.length = briefs, cards.length+1 = quiz
  const BRIEF_STEP = lesson.cards.length;
  const QUIZ_STEP = lesson.cards.length + 1;
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [briefIndex, setBriefIndex] = useState(0);

  const isBriefStep = currentStep === BRIEF_STEP;
  const isLastCard = currentStep === QUIZ_STEP;
  const totalSteps = QUIZ_STEP + 1;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < BRIEF_STEP) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleQuizSelect = (index: number) => {
    if (showQuizResult) return;
    setSelectedQuizIndex(index);
    setShowQuizResult(true);
  };

  const handleFinish = async () => {
    completeTask(`lesson-${lesson.id}`);
    // Award quiz completion bonus XP
    if (user?.uid) {
      const totalCardXP = lesson.cards.reduce((acc, c) => acc + c.xpReward, 0);
      const quizBonus = 20;
      await safeUpdateDoc(doc(db, 'users', user.uid, 'progression', 'stats'), {
        totalXP: increment(totalCardXP + quizBonus),
        lastActivityAt: new Date(),
      });
    }
    onClose();
  };

  const renderVisual = (card: LessonCard) => {
    if (card.visual === 'pie') {
      const { segments } = card.visualData;
      let cumulativePercent = 0;
      return (
        <div className="flex flex-col items-center py-6">
          <svg viewBox="0 0 32 32" className="w-48 h-48 rounded-full border-4 border-white shadow-xl rotate-[-90deg]">
            {segments.map((s: any, i: number) => {
              const startX = Math.cos(2 * Math.PI * cumulativePercent);
              const startY = Math.sin(2 * Math.PI * cumulativePercent);
              cumulativePercent += s.value / 100;
              const endX = Math.cos(2 * Math.PI * cumulativePercent);
              const endY = Math.sin(2 * Math.PI * cumulativePercent);
              const largeArcFlag = s.value > 50 ? 1 : 0;
              const pathData = `M 16 16 L ${16 + 16 * startX} ${16 + 16 * startY} A 16 16 0 ${largeArcFlag} 1 ${16 + 16 * endX} ${16 + 16 * endY} Z`;
              return <path key={i} d={pathData} fill={s.color} />;
            })}
            <circle cx="16" cy="16" r="10" fill="white" />
          </svg>
          <div className="flex gap-4 mt-6 flex-wrap justify-center">
            {segments.map((s: any, i: number) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-xs font-bold uppercase text-slate-500">{s.label} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (card.visual === 'bar') {
      const { items } = card.visualData;
      return (
        <div className="space-y-4 py-6 w-full max-w-sm mx-auto">
          {items.map((item: any, i: number) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-xs font-black uppercase text-slate-400">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000" 
                  style={{ width: `${item.value}%`, backgroundColor: item.color }} 
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (card.visual === 'line') {
      const { points } = card.visualData;
      const pathData = `M ${points.map((p: any) => `${p.x * 10},${100 - p.y / 8}`).join(' L ')}`;
      return (
        <div className="py-6 flex flex-col items-center">
          <div className="relative w-full h-40 bg-slate-50 rounded-xl border p-4">
            <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
              <path d={pathData} fill="none" stroke="#2e72db" strokeWidth="4" strokeLinecap="round" className="animate-draw" />
              {points.map((p: any, i: number) => (
                <circle key={i} cx={p.x * 10} cy={100 - p.y / 8} r="4" fill="#2e72db" />
              ))}
            </svg>
          </div>
          <p className="text-xs font-bold text-slate-400 mt-2 uppercase">{card.visualData.label}</p>
        </div>
      );
    }

    if (card.visual === 'comparison') {
      const { left, right } = card.visualData;
      return (
        <div className="grid grid-cols-2 gap-8 py-8 px-4">
          <div className="flex flex-col items-center gap-4">
            <div className="flex-1 w-full flex items-end justify-center">
              <div className="w-12 rounded-t-xl animate-in slide-in-from-bottom duration-1000" style={{ height: `${left.value}%`, backgroundColor: left.color }} />
            </div>
            <div className="text-center font-black text-xs uppercase text-slate-500">{left.label}</div>
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="flex-1 w-full flex items-end justify-center">
              <div className="w-12 rounded-t-xl animate-in slide-in-from-bottom duration-1000" style={{ height: `${right.value}%`, backgroundColor: right.color }} />
            </div>
            <div className="text-center font-black text-xs uppercase text-slate-500">{right.label}</div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      <header className="p-4 border-b bg-white flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onClose}><ChevronLeft className="h-6 w-6" /></Button>
        <div className="flex-1 px-8 space-y-2">
          <div className="flex justify-between text-[10px] font-black uppercase text-slate-400">
            <span>{lesson.title}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto relative bg-slate-50 p-4 md:p-8 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          {isBriefStep && lesson.briefs?.length ? (
            <Card className="border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="bg-primary p-6 text-white text-center">
                <div className="text-4xl mb-2">{lesson.briefs[briefIndex].emoji}</div>
                <p className="text-xs font-black uppercase tracking-widest opacity-80">Did You Know?</p>
                <p className="text-xs text-[#A8D5BC] mt-1">{briefIndex + 1} of {lesson.briefs.length}</p>
              </div>
              <CardContent className="p-8 space-y-6">
                <p className="text-lg font-bold text-slate-800 leading-relaxed text-center">{lesson.briefs[briefIndex].fact}</p>
                <div className="flex gap-3">
                  {briefIndex > 0 && (
                    <Button variant="outline" onClick={() => setBriefIndex(i => i - 1)} className="flex-none h-12 px-6 font-bold">Back</Button>
                  )}
                  {briefIndex < lesson.briefs.length - 1 ? (
                    <Button onClick={() => setBriefIndex(i => i + 1)} className="flex-1 h-12 font-black">Next Fact</Button>
                  ) : (
                    <Button onClick={() => setCurrentStep(QUIZ_STEP)} className="flex-1 h-12 font-black">Take the Quiz →</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : !isLastCard ? (
            <Card className="border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
              <CardContent className="p-8 md:p-12 space-y-8">
                <h2 className="text-3xl md:text-4xl font-black text-primary tracking-tight leading-tight">
                  {lesson.cards[currentStep].title}
                </h2>
                
                <p className={cn(
                  "text-slate-600 leading-relaxed",
                  ageGroup === 'junior' ? "text-xl font-medium" : "text-lg"
                )}>
                  {lesson.cards[currentStep].body[ageGroup]}
                </p>

                {renderVisual(lesson.cards[currentStep])}

                <div className="p-6 rounded-2xl bg-primary/5 border-2 border-primary/10 space-y-2">
                  <div className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3" /> Real Life Example
                  </div>
                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                    "{lesson.cards[currentStep].example[ageGroup]}"
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  {currentStep > 0 && (
                    <Button variant="outline" size="lg" onClick={handleBack} className="h-14 px-8 border-2 font-bold">Back</Button>
                  )}
                  <Button size="lg" onClick={handleNext} className="flex-1 h-14 text-xl font-black rounded-2xl shadow-xl shadow-primary/20 gap-2 group">
                    Next <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-none shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="bg-primary p-8 text-white text-center">
                <Zap className="h-12 w-12 mx-auto mb-4 text-accent" />
                <h2 className="text-3xl font-black">Final Quiz</h2>
                <p className="text-primary-foreground/80">Confirm your knowledge to earn {lesson.cards.reduce((acc, c) => acc + c.xpReward, 0)} XP!</p>
              </div>
              <CardContent className="p-8 md:p-12 space-y-8">
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                  {lesson.quizCard.question}
                </h3>

                <div className="grid gap-3">
                  {lesson.quizCard.options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuizSelect(i)}
                      disabled={showQuizResult}
                      className={cn(
                        "w-full p-5 text-left rounded-xl border-2 transition-all flex items-center justify-between",
                        !showQuizResult 
                          ? "hover:border-primary hover:bg-primary/5 border-slate-100" 
                          : i === lesson.quizCard.correctIndex 
                            ? "bg-[#E8F5EE] border-[#2E7D5A] text-[#1A1F2E]"
                            : selectedQuizIndex === i 
                              ? "bg-rose-50 border-rose-500 text-rose-900" 
                              : "opacity-40"
                      )}
                    >
                      <span className="font-bold">{opt}</span>
                      {showQuizResult && i === lesson.quizCard.correctIndex && <CheckCircle2 className="h-5 w-5 text-primary" />}
                    </button>
                  ))}
                </div>

                {showQuizResult && (
                  <div className="animate-in slide-in-from-top-4 duration-500 space-y-6">
                    <div className="p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-start gap-4">
                      <div className="h-10 w-10 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
                        <Info className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-600 leading-relaxed">
                          {lesson.quizCard.explanation}
                        </p>
                        <LearnMoreLink href="/learn" label="Explore more lessons" variant="chip" />
                      </div>
                    </div>
                    <Button onClick={handleFinish} className="w-full h-16 text-2xl font-black rounded-2xl gap-2">
                      Complete Lesson <ArrowRight className="h-6 w-6" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
