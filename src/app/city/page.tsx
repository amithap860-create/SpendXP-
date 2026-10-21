'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Lock, Sparkles, Compass, ShieldCheck, Eye } from 'lucide-react';
import { useCityProgress } from '@/hooks/useCityProgress';
import { lessons } from '@/data/lessons';
import { quests } from '@/data/quests';
import { RANKS, getFogEnemy } from '@/config/narrative';
import { POWERS, type ResolvedArea } from '@/config/cityMap';
import { Button } from '@/components/ui/button';
import { EducationalDisclaimer } from '@/components/EducationalDisclaimer';
import { SceneReader } from '@/components/story/SceneReader';
import { AREA_SCENES, LEVEL_SCENES, CLEARED_SCENES } from '@/config/cityStory';
import type { SceneBeat } from '@/config/characters';
import { Play } from 'lucide-react';
import { AreaIcon } from '@/components/city/AreaGlyph';
import { CityTerrainMap } from '@/components/city/CityTerrainMap';

/**
 * SpendCity map (2026-10-19). See src/config/cityMap.ts for the rules.
 * Completion comes from existing data only: lessons from the user's tasks
 * (`lesson-<id>`), quests from users/{uid}/questProgress. Nothing new is stored
 * server-side; the "already celebrated" list is a per-device convenience.
 */
export default function CityMapPage() {
  const {
    user, authLoading, ready, xp, rank, rankIndex, hasPathfinder, hasClearance,
    areas, availableLessons, cleared, clearedCount, nextAreaIdx, nextLevel,
    lessonDone, questDone, levelDone, areaOpen,
  } = useCityProgress();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<ResolvedArea | null>(null);
  const router = useRouter();

  // ── story scenes (2026-10-19) ──
  // Seen-list is per device (localStorage); a new device replays the scenes once.
  const seenKey = user?.uid ? `spendxp_story_seen_${user.uid}` : null;
  const [seen, setSeen] = useState<string[]>([]);
  const [seenLoaded, setSeenLoaded] = useState(false);
  const [scene, setScene] = useState<{ title: string; kicker: string; beats: SceneBeat[]; doneLabel?: string; after?: () => void } | null>(null);

  useEffect(() => {
    if (!seenKey) return;
    try { setSeen(JSON.parse(localStorage.getItem(seenKey) || '[]')); } catch { setSeen([]); }
    setSeenLoaded(true);
  }, [seenKey]);

  const markSeen = (k: string) => {
    setSeen(prev => {
      if (prev.includes(k)) return prev;
      const next = [...prev, k];
      if (seenKey) { try { localStorage.setItem(seenKey, JSON.stringify(next)); } catch { /* storage unavailable */ } }
      return next;
    });
  };
  const playScene = (key: string, title: string, kicker: string, beats: SceneBeat[] | undefined, after?: () => void, doneLabel?: string) => {
    markSeen(key);
    if (!beats?.length) { after?.(); return; }
    setScene({ title, kicker, beats, after, doneLabel });
  };
  const endScene = () => { const a = scene?.after; setScene(null); a?.(); };
  // Opening a level (tapping its lesson or case file) plays the level's story
  // first, once; then goes where the player was headed.
  const openLevel = (e: React.MouseEvent, levelId: string, title: string, areaName: string, k: number, done: boolean, href: string) => {
    const key = `level:${levelId}`;
    if (done || seen.includes(key) || !LEVEL_SCENES[levelId]) return;
    e.preventDefault();
    playScene(key, title, `${areaName} · Level ${k + 1}`, LEVEL_SCENES[levelId], () => router.push(href), 'Begin the level');
  };

  useEffect(() => { document.title = 'City Map | SpendXP'; }, []);

  // Default selection: the area you should work on next
  useEffect(() => {
    if (ready && !selectedId && areas.length) setSelectedId(areas[Math.max(0, nextAreaIdx)].id);
  }, [ready, selectedId, areas, nextAreaIdx]);

  // Celebrate newly cleared areas (never on the very first visit)
  useEffect(() => {
    if (!ready || !user?.uid || !areas.length) return;
    const key = `spendxp_city_cleared_${user.uid}`;
    try {
      const raw = localStorage.getItem(key);
      const prev: string[] | null = raw ? JSON.parse(raw) : null;
      const now = areas.filter((_, i) => cleared[i]).map(a => a.id);
      if (prev) {
        const fresh = areas.find((a, i) => cleared[i] && !prev.includes(a.id));
        if (fresh) playScene(`cleared:${fresh.id}`, fresh.name, 'Crime-free', CLEARED_SCENES[fresh.id], () => setCelebrate(fresh), 'Claim your reward');
      }
      localStorage.setItem(key, JSON.stringify(now));
    } catch { /* storage unavailable */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.uid, clearedCount]);

  const selectedIdx = areas.findIndex(a => a.id === selectedId);
  const selected = selectedIdx >= 0 ? areas[selectedIdx] : null;

  // First time an OPEN, not-yet-cleared area is shown -> its intro scene.
  // Areas the player has already cleared are marked seen silently (no replay spam
  // for existing players).
  useEffect(() => {
    if (!ready || !seenLoaded || !selected || scene || celebrate) return;
    const key = `area:${selected.id}`;
    if (seen.includes(key)) return;
    if (cleared[selectedIdx]) { markSeen(key); return; }
    if (!areaOpen(selectedIdx)) return;
    playScene(key, selected.name, selected.topic, AREA_SCENES[selected.id]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, seenLoaded, selectedId, seen.length]);

  if (authLoading || !ready) return <div className="p-8 text-muted-foreground">Loading the city…</div>;
  if (!user) return <div className="p-8"><Link href="/login?next=/city" className="underline">Sign in</Link> to see your city.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-28 md:pb-10 space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to HQ
      </Link>

      <header className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">SpendCity</h1>
        <p className="text-base text-muted-foreground">Clear each area of its villain. Finish every level — one lesson and one case file — and the area is crime-free.</p>
        <div className="rounded-2xl border bg-card p-4 space-y-2">
          <div className="flex items-center justify-between text-sm font-black uppercase tracking-widest">
            <span className="text-primary">{rank.name} · {xp.toLocaleString()} XP</span>
            <span className="text-muted-foreground">{clearedCount}/{areas.length} areas crime-free</span>
          </div>
          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-gold transition-all duration-700" style={{ width: `${areas.length ? (clearedCount / areas.length) * 100 : 0}%` }} />
          </div>
          <div className="flex flex-wrap gap-2 pt-1">
            {POWERS.map(p => {
              const on = rankIndex >= p.rankIndex;
              const Icon = p.id === 'fog_sight' ? Eye : p.id === 'pathfinder' ? Compass : ShieldCheck;
              return (
                <span key={p.id} title={p.desc} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${on ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border text-muted-foreground opacity-70'}`}>
                  {on ? <Icon className="h-4 w-4" /> : <Lock className="h-3.5 w-3.5" />} {p.name}{!on && ` · ${p.rankName}`}
                </span>
              );
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            {hasClearance
              ? 'Rank Clearance: areas open by rank, even if the one before them isn\'t cleared yet. Lessons still unlock in order on the Learn tab.'
              : 'More XP means more power. At Agent rank you can open areas out of order (Rank Clearance).'}
          </p>
        </div>
      </header>

      {/* ── MAP ── */}
      <div className="rounded-3xl border bg-card p-2">
        <CityTerrainMap
          areas={areas} cleared={cleared} areaOpen={areaOpen} nextAreaIdx={nextAreaIdx} showNext={hasPathfinder}
          selectedId={selectedId ?? undefined} onSelect={setSelectedId}
          progress={i => cleared[i] ? 'Crime-free' : `${areas[i].levels.filter(levelDone).length}/${areas[i].levels.length} levels`}
        />
      </div>

      {/* ── SELECTED AREA ── */}
      {selected && (() => {
        const i = selectedIdx;
        const open = areaOpen(i);
        const fog = getFogEnemy(selected.fogId);
        const prev = areas[i - 1];
        return (
          <section className="rounded-3xl border bg-card p-5 space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-primary">{selected.topic}</p>
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2"><AreaIcon id={selected.id} className="h-7 w-7 text-primary" /> {selected.name}</h2>
            </div>

            <div className="rounded-2xl bg-secondary p-4 space-y-1">
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Villain · {fog.name}</p>
              <p className="text-base text-foreground">{fog.description}</p>
              <p className="text-sm text-muted-foreground"><span className="font-black text-foreground">Weakness:</span> {fog.weakness}</p>
            </div>

            {!open ? (
              <p className="text-base text-muted-foreground">
                Locked. Clear <strong className="text-foreground">{prev?.name}</strong>
                {rankIndex < 2 ? ' first — or reach Agent rank to unlock areas by rank (Rank Clearance).' : `, or reach rank ${RANKS[selected.tier]?.name ?? 'higher'}.`}
              </p>
            ) : (
              <ul className="space-y-3">
                {selected.levels.map((lv, k) => {
                  const done = levelDone(lv);
                  const isNextLv = hasPathfinder && nextLevel?.id === lv.id && i === nextAreaIdx;
                  const lesson = lv.lessonId ? lessons.find(l => l.id === lv.lessonId) : undefined;
                  const quest = lv.questId ? quests.find(q => q.id === lv.questId) : undefined;
                  const lDone = lesson ? lessonDone(lesson.id) : false;
                  const seq = lesson ? availableLessons.findIndex(l => l.id === lesson.id) : -1;
                  const prevLesson = seq > 0 ? availableLessons[seq - 1] : null;
                  const lessonLocked = !!lesson && !lDone && !!prevLesson && !lessonDone(prevLesson.id);
                  const qDone = quest ? questDone(quest.id) : false;
                  const needQ = quest?.unlockRequirement?.completedQuestId;
                  const questLocked = !!quest && !qDone && !!needQ && !questDone(needQ);
                  return (
                    <li key={lv.id} className={`rounded-2xl border p-4 space-y-3 ${done ? 'border-gold/60 bg-gold/5' : isNextLv ? 'border-primary' : ''}`}>
                      <div className="flex items-center gap-3">
                        <span className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-base font-black ${done ? 'bg-gold text-gold-foreground' : 'bg-muted text-muted-foreground'}`}>
                          {done ? <Check className="h-5 w-5" /> : k + 1}
                        </span>
                        <p className="text-lg font-black text-foreground leading-snug flex-1">{lv.title}</p>
                        {isNextLv && <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-sm font-black uppercase tracking-widest">Next</span>}
                        {LEVEL_SCENES[lv.id] && (
                          <button type="button" onClick={() => playScene(`level:${lv.id}`, lv.title, `${selected.name} · Level ${k + 1}`, LEVEL_SCENES[lv.id])}
                            className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-black uppercase tracking-widest ${!seen.includes(`level:${lv.id}`) && !done ? 'border-gold text-gold animate-pulse' : 'border-border text-muted-foreground'}`}
                            aria-label={`Play the story for ${lv.title}`}>
                            <Play className="h-3.5 w-3.5" /> Story
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {lesson && (
                          <Link href="/learn" onClick={(e) => openLevel(e, lv.id, lv.title, selected.name, k, done, '/learn')} className={`flex-1 min-w-[150px] rounded-xl border px-3 py-2 text-sm font-bold ${lDone ? 'text-muted-foreground' : lessonLocked ? 'text-muted-foreground opacity-80' : 'text-primary border-primary/40 bg-primary/5'}`}>
                            <span className="block text-xs font-black uppercase tracking-widest opacity-70">Lesson {lDone ? '· done' : lessonLocked ? '· locked' : ''}</span>
                            {lesson.title}
                            {lessonLocked && prevLesson && <span className="block text-xs font-medium">Finish “{prevLesson.title}” first</span>}
                          </Link>
                        )}
                        {quest && (
                          <Link href="/quests" onClick={(e) => openLevel(e, lv.id, lv.title, selected.name, k, done, '/quests')} className={`flex-1 min-w-[150px] rounded-xl border px-3 py-2 text-sm font-bold ${qDone ? 'text-muted-foreground' : questLocked ? 'text-muted-foreground opacity-80' : 'text-primary border-primary/40 bg-primary/5'}`}>
                            <span className="block text-xs font-black uppercase tracking-widest opacity-70">Case file {qDone ? '· closed' : questLocked ? '· locked' : ''}</span>
                            {quest.title}
                            {questLocked && needQ && <span className="block text-xs font-medium">Close “{quests.find(q => q.id === needQ)?.title}” first</span>}
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })()}

      <EducationalDisclaimer />

      {scene && (
        <SceneReader title={scene.title} kicker={scene.kicker} beats={scene.beats} doneLabel={scene.doneLabel} onDone={endScene} />
      )}

      {/* ── CRIME-FREE MOMENT ── */}
      {celebrate && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center p-6" role="dialog" aria-modal="true">
          <div className="lesson-pop max-w-sm w-full rounded-3xl bg-card border-2 border-gold p-7 text-center space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-gold" />
            <p className="text-xs font-black uppercase tracking-widest text-gold">Crime-free</p>
            <h2 className="text-3xl font-black text-foreground">{celebrate.name}</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{celebrate.clearedLine}</p>
            <Button onClick={() => { const i = areas.findIndex(a => a.id === celebrate.id); const n = areas[i + 1]; if (n) setSelectedId(n.id); setCelebrate(null); }} className="w-full h-12 text-lg font-black rounded-2xl">
              {areas.findIndex(a => a.id === celebrate.id) < areas.length - 1 ? 'On to the next area' : 'Back to the map'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
