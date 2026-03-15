"use client"

import { useState, useEffect } from 'react';
import { MainNav } from '@/components/layout/main-nav';
import { useUser } from '@/lib/store';
import { useFirestore } from '@/firebase';
import { useAuthContext } from '@/context/AuthContext';
import { getConceptStrengths, ConceptStrengths } from '@/lib/progressionService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { User, LogOut, ShieldCheck, Sparkles, RefreshCw, Trophy, Gamepad2, Zap } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';

export default function Profile() {
  const { name, xp, level, tasks, portfolio } = useUser();
  const { user, signOut } = useAuthContext();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [strengths, setStrengths] = useState<ConceptStrengths | null>(null);
  const [newName, setNewName] = useState(name);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user && db) {
      getConceptStrengths(db, user.uid).then(setStrengths);
    }
  }, [user, db, tasks]);

  const handleUpdateName = async () => {
    if (!user || !newName || newName === name) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName: newName });
      toast({ title: "Name Updated", description: "Your strategist name has been changed." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to update name.", variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <MainNav />
      <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-4 border-white shadow-xl">
              <User className="h-12 w-12" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{name}</h2>
                <Badge className="bg-primary px-3 py-1 font-black">LVL {level}</Badge>
              </div>
              <p className="text-slate-500 font-medium text-lg italic">Master Strategist in Training</p>
            </div>
          </div>
          <Button variant="outline" onClick={signOut} className="h-14 px-8 gap-2 border-2 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-black rounded-2xl">
            <LogOut className="h-5 w-5" /> Sign Out
          </Button>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-8">
            <Card className="border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-xl font-black">Identity Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-4">
                  <Label className="text-xs font-black uppercase text-slate-400 tracking-widest">Strategist Name</Label>
                  <div className="flex gap-3">
                    <Input 
                      value={newName} 
                      onChange={(e) => setNewName(e.target.value)}
                      className="h-14 text-lg font-bold rounded-xl"
                    />
                    <Button onClick={handleUpdateName} disabled={isUpdating} className="h-14 px-8 rounded-xl font-black">
                      {isUpdating ? <RefreshCw className="animate-spin h-5 w-5" /> : "Update"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 border-none shadow-md bg-white flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4"><Zap className="h-6 w-6" /></div>
                <div className="text-3xl font-black text-slate-900">{xp.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total XP Earned</div>
              </Card>
              <Card className="p-6 border-none shadow-md bg-white flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4"><Gamepad2 className="h-6 w-6" /></div>
                <div className="text-3xl font-black text-slate-900">{portfolio.length}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Investments</div>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-5">
            <Card className="border-none shadow-xl bg-white overflow-hidden sticky top-8">
              <div className="bg-primary p-8 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl font-black">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                  Skill Mastery
                </CardTitle>
                <CardDescription className="text-primary-foreground/70">Knowledge profile updated in real-time.</CardDescription>
              </div>
              <CardContent className="p-8 space-y-6">
                {strengths ? (
                  Object.entries(strengths).map(([key, val]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-black uppercase text-slate-500 tracking-wider capitalize">{key}</span>
                        <span className="text-sm font-black text-primary">{val}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-1000" 
                          style={{ width: `${val}%` }} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center text-slate-400 italic">Calculating strengths...</div>
                )}

                <div className="mt-8 p-6 rounded-2xl bg-accent/5 border-2 border-accent/10 flex items-start gap-4">
                  <Sparkles className="h-6 w-6 text-accent shrink-0" />
                  <p className="text-sm font-medium text-slate-600 leading-relaxed">
                    <strong>Pro Tip:</strong> Complete Academy lessons to instantly boost your mastery scores by 20 points!
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={cn("px-2 py-0.5 rounded-full text-white text-[10px] font-bold", className)}>{children}</span>;
}
