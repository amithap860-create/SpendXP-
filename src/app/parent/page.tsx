'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { MainNav } from '@/components/layout/main-nav';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { WeeklyReport } from '@/components/parent/WeeklyReport';
import { getConceptStrengths, ConceptStrengths } from '@/lib/progressionService';
import { 
  Zap, 
  Gamepad2, 
  Trophy, 
  Clock, 
  FileText, 
  ShieldCheck,
  Activity,
  Users,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ParentDashboard() {
  const { user } = useAuthContext();
  const db = useFirestore();
  
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [strengths, setStrengths] = useState<ConceptStrengths | null>(null);

  // Fetch linked children
  const childrenQuery = useMemoFirebase(() => {
    return user ? query(collection(db, 'users'), where('parentUid', '==', user.uid)) : null;
  }, [db, user]);
  const { data: children, isLoading: isChildrenLoading } = useCollection(childrenQuery);

  useEffect(() => {
    if (children && children.length > 0 && !selectedChildId) {
      setSelectedChildId(children[0].id);
    }
  }, [children, selectedChildId]);

  const selectedChild = useMemo(() => children?.find(c => c.id === selectedChildId), [children, selectedChildId]);

  // Fetch Activity Log
  const activityQuery = useMemoFirebase(() => {
    return selectedChildId ? query(
      collection(db, 'users', selectedChildId, 'activityLog'), 
      orderBy('playedAt', 'desc'), 
      limit(10)
    ) : null;
  }, [db, selectedChildId]);
  const { data: activityLog } = useCollection(activityQuery);

  // Fetch Game Scores for Trend
  const [gameScores, setGameScores] = useState<any[]>([]);
  useEffect(() => {
    if (!selectedChildId) return;
    const unsubscribe = onSnapshot(collection(db, 'users', selectedChildId, 'gameScores'), (snap) => {
      setGameScores(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, [db, selectedChildId]);

  // Fetch Live Strengths
  useEffect(() => {
    if (!selectedChildId || !db) return;
    getConceptStrengths(db, selectedChildId).then(setStrengths);
  }, [selectedChildId, db, activityLog]);

  if (isChildrenLoading) return <div className="flex h-screen items-center justify-center"><Activity className="animate-spin text-primary" /></div>;

  if (!children || children.length === 0) {
    return (
      <div className="flex min-h-screen bg-background items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-8 border-none shadow-xl">
          <div className="h-20 w-20 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Users className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-black mb-2">No Linked Accounts</CardTitle>
          <p className="text-slate-500 mb-8">You haven't added any children to your dashboard yet.</p>
          <Button onClick={() => window.location.href = '/parent/setup'} className="w-full h-14 text-lg font-black">
            Add a Child
          </Button>
        </Card>
      </div>
    );
  }

  // Radar Chart Calculation
  const radarItems = strengths ? [
    { label: 'Budgeting', score: strengths.budgeting },
    { label: 'Saving', score: strengths.saving },
    { label: 'Investing', score: strengths.investing },
    { label: 'Credit', score: strengths.credit },
    { label: 'Taxes', score: strengths.taxes },
    { label: 'Spending', score: strengths.spending },
  ] : [];

  const getRadarPoints = (data: any[], size: number) => {
    const center = size / 2;
    const radius = size * 0.4;
    return data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
      const x = center + radius * (d.score / 100) * Math.cos(angle);
      const y = center + radius * (d.score / 100) * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  const getBackgroundHex = (size: number) => {
    const center = size / 2;
    const radius = size * 0.4;
    return Array.from({ length: 6 }).map((_, i) => {
      const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto">
        <header className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Parent Portal</h2>
            <Button variant="outline" onClick={() => setShowReport(true)} className="gap-2 font-bold border-2">
              <FileText className="h-4 w-4" /> Weekly Report
            </Button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={cn(
                  "flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all shrink-0",
                  selectedChildId === child.id 
                    ? "bg-white border-primary shadow-lg ring-4 ring-primary/5" 
                    : "bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100"
                )}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                  {child.displayName?.[0]?.toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="font-black text-sm">{child.displayName}</div>
                  <div className="text-[10px] font-bold uppercase opacity-60">Level {child.level || 1}</div>
                </div>
              </button>
            ))}
            <button 
              onClick={() => window.location.href = '/parent/setup'}
              className="px-6 py-3 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500 transition-all flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" /> Add Child
            </button>
          </div>
        </header>

        {selectedChild && (
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-12 grid gap-6 md:grid-cols-3">
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Zap className="h-6 w-6" /></div>
                  <div><div className="text-[10px] font-bold text-slate-400 uppercase">Total XP Earned</div><div className="text-2xl font-black">{selectedChild.xp?.toLocaleString() || 0}</div></div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600"><Trophy className="h-6 w-6" /></div>
                  <div><div className="text-[10px] font-bold text-slate-400 uppercase">Current Rank</div><div className="text-2xl font-black">Level {selectedChild.level || 1}</div></div>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-white">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600"><Gamepad2 className="h-6 w-6" /></div>
                  <div><div className="text-[10px] font-bold text-slate-400 uppercase">Latest Session</div><div className="text-2xl font-black">{activityLog?.[0]?.gameName || 'None'}</div></div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-8 space-y-8">
              {/* Concept Radar */}
              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b">
                  <CardTitle className="text-xl font-black flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-primary" /> Concept Proficiency
                  </CardTitle>
                  <CardDescription>Knowledge profile updated in real-time.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 flex flex-col md:flex-row items-center justify-around gap-8">
                  {strengths ? (
                    <>
                      <div className="relative">
                        <svg viewBox="0 0 100 100" className="w-64 h-64">
                          <polygon points={getBackgroundHex(100)} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth="0.5" />
                          <circle cx="50" cy="50" r="20" fill="none" stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="2 2" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                          <polygon points={getRadarPoints(radarItems, 100)} fill="rgba(45, 114, 219, 0.2)" stroke="#2e72db" strokeWidth="2" />
                          {radarItems.map((d, i) => {
                            const angle = (Math.PI * 2 * i) / radarItems.length - Math.PI / 2;
                            const x = 50 + 40 * (d.score / 100) * Math.cos(angle);
                            const y = 50 + 40 * (d.score / 100) * Math.sin(angle);
                            return <circle key={i} cx={x} cy={y} r="2" fill="#2e72db" />;
                          })}
                        </svg>
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                        {radarItems.map((d, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-primary" />
                            <span className="text-xs font-bold text-slate-600 uppercase">{d.label}</span>
                            <span className="text-xs font-black ml-auto">{d.score}%</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center w-full text-muted-foreground italic">Calculating strengths...</div>
                  )}
                </CardContent>
              </Card>

              {/* Game Scores */}
              <div className="grid gap-6 md:grid-cols-2">
                {gameScores.map((game) => (
                  <Card key={game.id} className="border-none shadow-md hover:shadow-lg transition-shadow bg-white overflow-hidden">
                    <div className="h-1.5 bg-primary/20" />
                    <CardContent className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-black text-slate-900 capitalize">{game.id.replace(/([A-Z])/g, ' $1').trim()}</h4>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Played {game.gamesPlayed || 0} times</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-400 uppercase">Best</div>
                          <div className="font-black text-primary">{game.highScore}</div>
                        </div>
                      </div>
                      <div className="flex items-end gap-1 h-8">
                        {(game.scoreHistory || [0,0,0,0,0]).slice(-5).map((s: number, i: number) => {
                          const max = Math.max(...(game.scoreHistory || [1]), 1);
                          const h = (s / max) * 100;
                          return (
                            <div key={i} className="flex-1 bg-slate-100 rounded-t-sm relative group overflow-hidden" style={{ height: `${Math.max(h, 10)}%` }}>
                              <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-40 transition-opacity" />
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <Card className="border-none shadow-xl bg-white">
                <CardHeader><CardTitle className="text-xl font-black flex items-center gap-2"><Clock className="h-5 w-5 text-accent" /> Play Usage</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-end"><span className="text-xs font-bold uppercase text-slate-400">Minutes Used Today</span><span className="text-lg font-black text-slate-900">22 / 60</span></div>
                    <Progress value={36} className="h-2" />
                  </div>
                  <Button variant="outline" className="w-full font-bold border-2">Edit Limits</Button>
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-xl font-black flex items-center gap-2"><Activity className="h-5 w-5 text-emerald-500" /> Recent Activity</CardTitle></CardHeader>
                <div className="divide-y">
                  {activityLog?.map((act) => (
                    <div key={act.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"><Gamepad2 className="h-4 w-4" /></div>
                        <div>
                          <div className="text-xs font-black text-slate-900 capitalize">{act.gameName.replace(/([A-Z])/g, ' $1').trim()}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase">{act.playedAt?.toDate().toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right"><div className="text-xs font-black text-primary">+{act.xpEarned} XP</div><div className="text-[10px] font-bold text-slate-400">SCORE {act.score}</div></div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {showReport && selectedChild && <WeeklyReport child={selectedChild} onClose={() => setShowReport(false)} />}
      </main>
    </div>
  );
}
