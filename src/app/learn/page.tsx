"use client"

import { useState } from 'react';
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

export default function LearnHub() {
  const { user } = useAuthContext();
  const { tasks, ageGroup } = useUser();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const availableLessons = lessons.filter(l => l.ageGroups.includes((ageGroup || 'junior') as any));
  const completedCount = lessons.filter(l => tasks.find(t => t.id === `lesson-${l.id}`)?.completed).length;
  const overallProgress = (completedCount / lessons.length) * 100;

  const handleLessonFinish = async (lessonId: string) => {
    setActiveLesson(null);
    if (user && completedCount + 1 === lessons.length) {
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
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Level Up Your Knowledge</h2>
                <p className="text-slate-500 text-lg font-medium">Complete lessons to earn XP and master financial strategies.</p>
              </div>
              <div className="w-full md:w-80 p-6 bg-white rounded-2xl shadow-xl space-y-4 border">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-black uppercase text-slate-400">Academy Completion</span>
                  <span className="text-xl font-black text-primary">{completedCount}/{lessons.length}</span>
                </div>
                <Progress value={overallProgress} className="h-2" />
                {completedCount === lessons.length ? (
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-tighter">
                    <Star className="h-4 w-4 fill-current" /> Finance Scholar Badge Earned!
                  </div>
                ) : (
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Complete all {lessons.length} to earn Scholar Badge</p>
                )}
              </div>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => {
              const isCompleted = tasks.find(t => t.id === `lesson-${lesson.id}`)?.completed;
              const xpReward = lesson.cards.reduce((acc, c) => acc + c.xpReward, 0);
              const isAgeAppropriate = availableLessons.find(l => l.id === lesson.id);
              
              return (
                <Card 
                  key={lesson.id} 
                  className={cn(
                    "group hover:shadow-2xl transition-all cursor-pointer border-none bg-white overflow-hidden flex flex-col",
                    isCompleted && "ring-2 ring-emerald-500/20",
                    !isAgeAppropriate && "opacity-50 grayscale"
                  )}
                  onClick={() => isAgeAppropriate && setActiveLesson(lesson)}
                >
                  <div className={cn(
                    "h-2",
                    lesson.topic === 'budgeting' ? "bg-blue-500" :
                    lesson.topic === 'investing' ? "bg-indigo-500" :
                    lesson.topic === 'saving' ? "bg-emerald-500" :
                    lesson.topic === 'credit' ? "bg-amber-500" :
                    lesson.topic === 'taxes' ? "bg-rose-500" : "bg-teal-500"
                  )} />
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <BookOpen className="h-6 w-6" />
                      </div>
                      {isCompleted ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none gap-1 font-black">
                          <CheckCircle2 className="h-3 w-3" /> DONE
                        </Badge>
                      ) : !isAgeAppropriate ? (
                        <Badge variant="outline" className="text-[10px] uppercase font-black">LOCKED</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-50 text-slate-500 border-none font-black">
                          +{xpReward} XP
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl font-black group-hover:text-primary transition-colors">
                      {lesson.title}
                    </CardTitle>
                    <CardDescription className="font-medium">
                      {!isAgeAppropriate ? `Available for ${lesson.ageGroups.join('/')} level` : `Master the basics of ${lesson.topic}.`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4 space-y-4">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <div className="flex items-center gap-1"><Clock className="h-3 w-3" /> {lesson.estimatedMinutes}m read</div>
                      <div className="flex items-center gap-1"><Trophy className="h-3 w-3" /> Strategy</div>
                    </div>
                    <button 
                      className={cn(
                        "w-full h-12 flex items-center justify-center gap-2 font-black rounded-xl border-2 transition-all",
                        isCompleted ? "border-slate-200 text-slate-500" : "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                      )}
                      disabled={!isAgeAppropriate}
                      suppressHydrationWarning
                    >
                      {isCompleted ? 'Review Lesson' : 'Start Learning'} <ArrowRight className="h-4 w-4" />
                    </button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {activeLesson && (
            <LessonViewer 
              lesson={activeLesson} 
              onClose={() => handleLessonFinish(activeLesson.id)} 
            />
          )}
        </div>
      </main>
    </div>
  );
}
