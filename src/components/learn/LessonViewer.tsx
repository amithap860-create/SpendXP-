'use client';

/**
 * Lesson player (rewritten 2026-10-15).
 *
 * The old viewer was a card pager: a title, a wall of text, one static chart,
 * an example box, "Next". Testers asked for something more fun and less
 * card-like, so each lesson card is now a SCENE that unfolds beat by beat:
 *   coach bubble(s) → an animated (sometimes interactive) visual → a
 *   "real life" bubble, advanced with one big Continue button.
 * After the scenes: swipe-through fun facts → quiz (pop / shake feedback) →
 * a reward screen with an XP count-up.
 *
 * Data model is unchanged: every existing Lesson renders as-is (the beats are
 * derived from each card's body / visual / example). XP rules are identical to
 * the old viewer (card XP always, +20 only for a correct quiz answer).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lesson, LessonCard } from '@/data/lessons';
import { useAgeAdapt } from '@/lib/ageAdaptProvider';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ArrowRight, CheckCircle2, XCircle, Info, Lightbulb, Sparkles, Trophy, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUser } from '@/lib/store';
import { LearnMoreLink } from '@/components/LearnMoreLink';
import { useAuthContext } from '@/context/AuthContext';
import { db, safeUpdateDoc } from '@/firebase';
import { doc, increment } from 'firebase/firestore';
import { useCurrency } from '@/hooks/useCurrency';
import { LessonVisual, useCountUp, usePrefersReducedMotion } from './LessonVisuals';
import { playCorrect, playWrong, playLevelUp } from '@/lib/sounds';
import { fireConfettiCorrectAnswer, fireConfettiQuestComplete } from '@/lib/confetti';

interface LessonViewerProps {
  lesson: Lesson;
  /** `completed` is true only when the learner reached the reward screen and
   *  tapped Finish (XP was awarded); false when they just backed out. */
  onClose: (completed?: boolean) => void;
}

type Beat = { kind: 'text' | 'visual' | 'example'; text?: string };
type Stage = 'scenes' | 'facts' | 'quiz' | 'reward';

const QUIZ_BONUS_XP = 20;

/** Splits prose into sentences without breaking on "p.a.", "e.g.", "vs." etc. */
function splitSentences(t: string): string[] {
  const out: string[] = [];
  let start = 0;
  const re = /[.!?]["')\]]*\s+/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(t))) {
    const end = m.index + m[0].length;
    const next = t[end];
    const before = t.slice(start, m.index + 1);
    const abbreviation = /\b(?:vs|e\.g|i\.e|approx|p\.a|etc|Rs|No|Mr|Mrs|Dr|St)\.$/.test(before) || /\b[A-Z]\.$/.test(before);
    if (next && /[A-Z"“'(₹0-9]/.test(next) && !abbreviation) {
      out.push(t.slice(start, end).trim());
      start = end;
    }
  }
  const rest = t.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}

/** Groups sentences into short bubbles (<= ~210 chars, max 3 bubbles). */
function groupSentences(sentences: string[]): string[] {
  const beats: string[] = [];
  let cur = '';
  for (const s of sentences) {
    if (cur && cur.length + s.length > 210) { beats.push(cur); cur = s; }
    else cur = cur ? `${cur} ${s}` : s;
  }
  if (cur) beats.push(cur);
  while (beats.length > 3) {
    const last = beats.pop()!;
    beats[beats.length - 1] += ` ${last}`;
  }
  return beats;
}

function buildBeats(card: LessonCard, ageGroup: 'junior' | 'teen' | 'senior'): Beat[] {
  const body = card.body[ageGroup] || card.body.teen || card.body.senior || card.body.junior || '';
  const example = card.example[ageGroup] || card.example.teen || card.example.senior || card.example.junior || '';
  const text = groupSentences(splitSentences(body));
  const beats: Beat[] = [];
  if (text.length) beats.push({ kind: 'text', text: text[0] });
  if (card.visual !== 'none') beats.push({ kind: 'visual' });
  for (const t of text.slice(1)) beats.push({ kind: 'text', text: t });
  if (example) beats.push({ kind: 'example', text: example });
  return beats;
}

function Coach() {
  return (
    <div className="h-9 w-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 shadow-md" aria-hidden>
      <Sparkles className="h-4 w-4" />
    </div>
  );
}

function vibrate(ms: number) {
  try { navigator.vibrate?.(ms); } catch { /* not supported */ }
}

export function LessonViewer({ lesson, onClose }: LessonViewerProps) {
  const { ageGroup } = useAgeAdapt();
  const { completeTask, tasks } = useUser();
  const { user } = useAuthContext();
  const { activeCurrency } = useCurrency();
  const reduced = usePrefersReducedMotion();

  const cards = lesson.cards;
  const hasFacts = !!lesson.briefs?.length;
  const beatsByScene = useMemo(() => cards.map(c => buildBeats(c, ageGroup)), [cards, ageGroup]);

  const [stage, setStage] = useState<Stage>('scenes');
  const [sceneIdx, setSceneIdx] = useState(0);
  const [beatIdx, setBeatIdx] = useState(0);
  const [briefIndex, setBriefIndex] = useState(0);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState(false);

  const mainRef = useRef<HTMLElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const totalCardXP = cards.reduce((acc, c) => acc + c.xpReward, 0);
  const answeredCorrectly = selectedQuizIndex === lesson.quizCard.correctIndex;
  // FIX (2026-10-15): finishing an already-completed lesson used to pay the
  // full XP again every time (infinite XP by re-running a lesson). Replays are
  // now practice only, matching how repeat quest completions already work.
  // Captured ONCE when the lesson opens (2026-10-16). Reading it live made the
  // reward screen flash "+0 XP" on Finish: completeTask() flips it to true
  // before the XP write finishes, which zeroed rewardXP mid-render.
  const [alreadyCompleted] = useState(() => !!tasks.find(t => t.id === `lesson-${lesson.id}`)?.completed);
  const rewardXP = alreadyCompleted ? 0 : totalCardXP + (answeredCorrectly ? QUIZ_BONUS_XP : 0);
  const xpSoFar = stage === 'scenes'
    ? cards.slice(0, sceneIdx).reduce((a, c) => a + c.xpReward, 0)
    : totalCardXP;

  // New scene / stage → scroll to top. New beat → scroll the newest bubble into view.
  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [sceneIdx, stage, briefIndex]);
  useEffect(() => {
    if (stage !== 'scenes' || beatIdx === 0) return;
    bottomRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'end' });
  }, [beatIdx, stage, reduced]);

  const scenes = beatsByScene[sceneIdx] ?? [];

  const advance = () => {
    if (stage === 'scenes') {
      if (beatIdx < scenes.length - 1) { setBeatIdx(i => i + 1); return; }
      if (sceneIdx < cards.length - 1) { setSceneIdx(i => i + 1); setBeatIdx(0); return; }
      setStage(hasFacts ? 'facts' : 'quiz');
      return;
    }
    if (stage === 'facts') {
      if (briefIndex < lesson.briefs.length - 1) setBriefIndex(i => i + 1);
      else setStage('quiz');
      return;
    }
    if (stage === 'quiz' && showQuizResult) {
      setStage('reward');
      if (answeredCorrectly) fireConfettiQuestComplete();
      playLevelUp();
    }
  };

  const goBack = () => {
    if (stage === 'scenes') {
      if (beatIdx > 0) setBeatIdx(i => i - 1);
      else if (sceneIdx > 0) { setSceneIdx(i => i - 1); setBeatIdx((beatsByScene[sceneIdx - 1]?.length ?? 1) - 1); }
    } else if (stage === 'facts') {
      if (briefIndex > 0) setBriefIndex(i => i - 1);
      else { setStage('scenes'); setSceneIdx(cards.length - 1); setBeatIdx((beatsByScene[cards.length - 1]?.length ?? 1) - 1); }
    } else if (stage === 'quiz' && !showQuizResult) {
      if (hasFacts) { setStage('facts'); setBriefIndex(lesson.briefs.length - 1); }
      else { setStage('scenes'); setSceneIdx(cards.length - 1); setBeatIdx((beatsByScene[cards.length - 1]?.length ?? 1) - 1); }
    }
  };

  const canGoBack =
    (stage === 'scenes' && (beatIdx > 0 || sceneIdx > 0)) ||
    stage === 'facts' ||
    (stage === 'quiz' && !showQuizResult);

  const handleQuizSelect = (index: number) => {
    if (showQuizResult) return;
    setSelectedQuizIndex(index);
    setShowQuizResult(true);
    if (index === lesson.quizCard.correctIndex) {
      playCorrect();
      vibrate(25);
      fireConfettiCorrectAnswer();
    } else {
      playWrong();
      vibrate(70);
    }
  };

  const handleFinish = async () => {
    // Pass the lesson's real topic (budgeting/saving/investing/credit/
    // taxes/spending) so it correctly feeds the Financial Knowledge radar
    // chart on the home page — see the fix note in store.tsx's completeTask.
    completeTask(`lesson-${lesson.id}`, lesson.topic);
    // Award card XP always; the +20 quiz bonus only fires if the quiz was
    // actually answered correctly — otherwise a wrong answer pays the same
    // as a right one, which defeats the point of asking (xpConfig.ts gap #1).
    if (user?.uid && rewardXP > 0) {
      await safeUpdateDoc(doc(db, 'users', user.uid, 'progression', 'stats'), {
        totalXP: increment(rewardXP),
        lastActivityAt: new Date(),
      });
    }
    onClose(true);
  };

  // ── progress segments: one per scene, one for facts, one for quiz/reward ──
  const segments = cards.length + (hasFacts ? 1 : 0) + 1;
  const currentSegment =
    stage === 'scenes' ? sceneIdx : stage === 'facts' ? cards.length : hasFacts ? cards.length + 1 : cards.length;
  const segmentFill = (i: number) => {
    if (stage === 'reward') return 100;
    if (i < currentSegment) return 100;
    if (i > currentSegment) return 0;
    if (stage === 'scenes') return ((beatIdx + 1) / Math.max(1, scenes.length)) * 100;
    if (stage === 'facts') return ((briefIndex + 1) / lesson.briefs.length) * 100;
    return showQuizResult ? 100 : 40;
  };

  const continueLabel = (() => {
    if (stage === 'scenes') {
      if (beatIdx < scenes.length - 1) return 'Continue';
      if (sceneIdx < cards.length - 1) return 'Next scene';
      return hasFacts ? 'Fun facts' : 'Start the quiz';
    }
    if (stage === 'facts') return briefIndex < lesson.briefs.length - 1 ? 'Next fact' : 'Start the quiz';
    if (stage === 'quiz') return 'See my reward';
    return 'Finish';
  })();

  const continueDisabled = stage === 'quiz' && !showQuizResult;
  const bodyText = ageGroup === 'junior' ? 'text-lg leading-relaxed' : 'text-base leading-relaxed';

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      <header className="px-3 pt-3 pb-2 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => onClose(false)} aria-label="Close lesson"><ChevronLeft className="h-6 w-6" /></Button>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground truncate mb-1.5">{lesson.title}</p>
            <div className="flex gap-1" role="progressbar" aria-valuemin={0} aria-valuemax={segments} aria-valuenow={Math.min(segments, currentSegment + 1)}>
              {Array.from({ length: segments }).map((_, i) => (
                <div key={i} className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gold rounded-full transition-[width] duration-500 ease-out" style={{ width: `${segmentFill(i)}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div key={xpSoFar} className="lesson-pop flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1.5 text-xs font-black tabular-nums">
            <Zap className="h-3.5 w-3.5" /> {xpSoFar} XP
          </div>
        </div>
      </header>

      {/* STOPGAP (2026-09): lesson content hardcodes rupee amounts and India-
          specific rules (tax brackets, deposit insurance, FOIR, EPF/PPF), so
          it does not convert to the user's currency. The banner says so
          explicitly instead of implying "just a number problem". */}
      {activeCurrency.code !== 'INR' && (
        <div className="px-4 py-2.5 bg-cat-want/10 border-b border-cat-want/30 text-cat-want text-xs font-bold text-center leading-relaxed">
          This lesson uses ₹ (INR) examples and describes India-specific rules — tax brackets, deposit insurance limits, lending guidelines, and similar — which may not match {activeCurrency.code} or the rules where you live. Treat it as an illustration of the concept, not local guidance for your country.
        </div>
      )}

      <main ref={mainRef} className="flex-1 overflow-y-auto" aria-live="polite">
        <div className="max-w-xl mx-auto w-full px-4 pt-6 pb-8">
          {/* ───────────── SCENES ───────────── */}
          {stage === 'scenes' && cards[sceneIdx] && (
            <div key={`scene-${sceneIdx}`} className="space-y-5">
              <div className="lesson-rise space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest text-primary/70">Scene {sceneIdx + 1} of {cards.length}</p>
                <h2 className="text-3xl font-black text-foreground leading-tight tracking-tight">{cards[sceneIdx].title}</h2>
              </div>

              {scenes.slice(0, beatIdx + 1).map((beat, i) => {
                const prev = scenes[i - 1];
                if (beat.kind === 'text') {
                  const showCoach = !prev || prev.kind !== 'text';
                  return (
                    <div key={i} className="lesson-rise flex items-start gap-3">
                      {showCoach ? <Coach /> : <div className="w-9 shrink-0" />}
                      <div className={cn('rounded-2xl rounded-tl-md bg-card border shadow-sm px-4 py-3 text-foreground', bodyText)}>
                        {beat.text}
                      </div>
                    </div>
                  );
                }
                if (beat.kind === 'visual') {
                  return (
                    <div key={i} className="lesson-rise rounded-3xl border bg-card shadow-sm p-4">
                      <LessonVisual card={cards[sceneIdx]} />
                    </div>
                  );
                }
                return (
                  <div key={i} className="lesson-rise flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0" aria-hidden>
                      <Lightbulb className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl rounded-tl-md bg-primary/10 border-2 border-primary/20 px-4 py-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">In real life</p>
                      <p className={cn('font-bold text-foreground italic', bodyText)}>{beat.text}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}

          {/* ───────────── FUN FACTS ───────────── */}
          {stage === 'facts' && (
            <div key={`fact-${briefIndex}`} className="lesson-rise text-center space-y-6 pt-8">
              <div className="lesson-pop lesson-glow mx-auto h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="h-10 w-10 text-primary" strokeWidth={2} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">
                Did you know? · {briefIndex + 1} of {lesson.briefs.length}
              </p>
              <p className="text-xl font-bold text-foreground leading-relaxed">{lesson.briefs[briefIndex].fact}</p>
            </div>
          )}

          {/* ───────────── QUIZ ───────────── */}
          {stage === 'quiz' && (
            <div className="space-y-6">
              <div className="lesson-rise text-center space-y-2">
                <div className="lesson-pop mx-auto h-16 w-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
                  <Zap className="h-8 w-8" />
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-primary">Final quiz · +{QUIZ_BONUS_XP} bonus XP</p>
              </div>
              <h3 className="lesson-rise text-2xl font-black text-foreground leading-snug text-center">{lesson.quizCard.question}</h3>

              <div className="grid gap-3">
                {lesson.quizCard.options.map((opt, i) => {
                  const isCorrect = i === lesson.quizCard.correctIndex;
                  const isPicked = selectedQuizIndex === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleQuizSelect(i)}
                      disabled={showQuizResult}
                      className={cn(
                        'lesson-rise w-full p-4 text-left rounded-2xl border-2 transition-colors flex items-center justify-between gap-3 active:scale-[0.98]',
                        !showQuizResult && 'border-border bg-card hover:border-primary hover:bg-primary/5',
                        showQuizResult && isCorrect && 'bg-[#E8F5EE] border-[#2E7D5A] text-[#1A1F2E] lesson-pop',
                        showQuizResult && !isCorrect && isPicked && 'bg-rose-50 border-rose-500 text-rose-900 lesson-shake',
                        showQuizResult && !isCorrect && !isPicked && 'opacity-40 border-border'
                      )}
                      style={{ animationDelay: `${i * 90}ms` }}
                    >
                      <span className="font-bold leading-snug">{opt}</span>
                      {showQuizResult && isCorrect && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                      {showQuizResult && !isCorrect && isPicked && <XCircle className="h-5 w-5 text-rose-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {showQuizResult && (
                <div className="lesson-rise rounded-2xl bg-muted border-2 border-border p-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-card shadow-sm flex items-center justify-center shrink-0">
                    <Info className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-black text-foreground">{answeredCorrectly ? 'Correct!' : 'Not quite — here’s why:'}</p>
                    <p className="text-sm font-medium text-muted-foreground leading-relaxed">{lesson.quizCard.explanation}</p>
                    <LearnMoreLink href="/learn" label="Explore more lessons" variant="chip" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ───────────── REWARD ───────────── */}
          {stage === 'reward' && <Reward xp={rewardXP} sceneXP={alreadyCompleted ? 0 : totalCardXP} bonus={!alreadyCompleted && answeredCorrectly ? QUIZ_BONUS_XP : 0} replay={alreadyCompleted} title={lesson.title} />}
        </div>
      </main>

      <footer className="border-t bg-card px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="max-w-xl mx-auto flex gap-3">
          {canGoBack && (
            <Button variant="outline" size="lg" onClick={goBack} className="h-14 px-5 border-2 font-bold" aria-label="Back">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Button
            size="lg"
            onClick={stage === 'reward' ? handleFinish : advance}
            disabled={continueDisabled}
            className="flex-1 h-14 text-lg font-black rounded-2xl shadow-lg shadow-primary/20 gap-2 group"
          >
            {continueLabel} <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

function Reward({ xp, sceneXP, bonus, title, replay }: { xp: number; sceneXP: number; bonus: number; title: string; replay: boolean }) {
  const shown = useCountUp(xp, 1200, 300);
  return (
    <div className="text-center space-y-6 pt-10">
      <div className="lesson-pop lesson-glow mx-auto h-28 w-28 rounded-full bg-primary text-white flex items-center justify-center shadow-xl">
        <Trophy className="h-14 w-14" />
      </div>
      <div className="lesson-rise space-y-1" style={{ animationDelay: '150ms' }}>
        <p className="text-xs font-black uppercase tracking-widest text-primary">Lesson complete</p>
        <h2 className="text-2xl font-black text-foreground leading-tight">{title}</h2>
      </div>
      <p className="lesson-rise text-6xl font-black text-primary tabular-nums" style={{ animationDelay: '300ms' }}>
        +{Math.round(shown)} <span className="text-2xl">XP</span>
      </p>
      <div className="lesson-rise inline-flex flex-col gap-1.5 text-sm font-bold text-muted-foreground" style={{ animationDelay: '500ms' }}>
        {replay ? (
          <span>Replay — XP is only earned the first time, but repetition locks it in.</span>
        ) : (
          <>
            <span>Scenes: +{sceneXP} XP</span>
            <span>{bonus > 0 ? `Quiz bonus: +${bonus} XP` : 'Quiz bonus: missed this time — revisit the lesson to lock it in'}</span>
          </>
        )}
      </div>
    </div>
  );
}
