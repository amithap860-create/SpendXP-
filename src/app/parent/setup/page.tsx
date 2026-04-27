'use client';

import { useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useFirestore } from '@/firebase';
import { doc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Clock, 
  Bell, 
  ChevronRight, 
  UserPlus, 
  Mail,
  CheckCircle2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { safeUpdateDoc } from '@/lib/firestoreSafe';

export default function ParentSetup() {
  const { user } = useAuthContext();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [childEmail, setChildEmail] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [timeLimit, setTimeLimit] = useState([60]);
  const [notifs, setNotificationPrefs] = useState({ report: true, badges: true });

  const handleLinkChild = async () => {
    if (!user || !childEmail) return;
    setIsSearching(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', childEmail.toLowerCase()));
      const snap = await getDocs(q);
      
      if (snap.empty) {
        toast({ title: "Child not found", description: "No SpendXP account exists with this email.", variant: "destructive" });
      } else {
        const childDoc = snap.docs[0];
        await addDoc(collection(db, 'users', childDoc.id, 'linkRequests'), {
          parentUid: user.uid,
          parentName: user.displayName || 'Your Parent',
          status: 'pending',
          createdAt: serverTimestamp()
        });
        toast({ title: "Request Sent!", description: `We've sent a link request to ${childEmail}.` });
        setStep(2);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    try {
      const parentRef = doc(db, 'users', user.uid);
      const success = await safeUpdateDoc(parentRef, {
        notificationPrefs: notifs,
        setupComplete: true
      });
      if (success) router.push('/parent');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full space-y-8">
        <div className="flex justify-between items-center px-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center font-bold transition-colors", step >= i ? "bg-primary text-white" : "bg-slate-100 text-slate-400")}>
                {step > i ? <CheckCircle2 className="h-5 w-5" /> : i}
              </div>
              {i < 3 && <div className={cn("h-1 w-12 md:w-20 rounded-full", step > i ? "bg-primary" : "bg-slate-100")} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card className="border-none shadow-2xl">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                <Users className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-black">Add Your Child</CardTitle>
              <CardDescription>Connect to their existing account or start a fresh one.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="p-4 rounded-xl border-2 border-primary/20 bg-primary/5 space-y-3">
                  <h4 className="font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Existing Account</h4>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="child@school.com" 
                      value={childEmail}
                      onChange={(e) => setChildEmail(e.target.value)}
                      className="bg-white"
                    />
                    <Button onClick={handleLinkChild} disabled={isSearching}>
                      {isSearching ? "..." : "Link"}
                    </Button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground">or</span></div>
                </div>

                <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/40 transition-colors cursor-pointer group" onClick={() => setStep(2)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary">
                        <UserPlus className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold">Create New Child Account</h4>
                        <p className="text-xs text-muted-foreground">We'll generate a login for them.</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-300" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-none shadow-2xl">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 text-accent">
                <Clock className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-black">Screen Time Limits</CardTitle>
              <CardDescription>Healthy habits start with balanced play time.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <Label className="text-lg font-bold">Daily Play Limit</Label>
                  <span className="text-2xl font-black text-primary">{timeLimit[0] === 120 ? 'Unlimited' : `${timeLimit[0]} mins`}</span>
                </div>
                <Slider 
                  value={timeLimit} 
                  max={120} 
                  step={15} 
                  onValueChange={setTimeLimit}
                  className="py-4"
                />
                <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">
                  <span>15m</span>
                  <span>30m</span>
                  <span>45m</span>
                  <span>60m</span>
                  <span>Unlimited</span>
                </div>
              </div>
              <Button onClick={() => setStep(3)} className="w-full h-14 text-lg font-black">Next Step <ChevronRight className="ml-2" /></Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-none shadow-2xl">
            <CardHeader className="text-center">
              <div className="h-16 w-16 bg-[#C8E8D8] rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
                <Bell className="h-8 w-8" />
              </div>
              <CardTitle className="text-3xl font-black">Notification Prefs</CardTitle>
              <CardDescription>Stay updated on their learning journey.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">Weekly Progress Report</Label>
                    <p className="text-xs text-muted-foreground">A summary of concepts learned and XP earned.</p>
                  </div>
                  <Switch checked={notifs.report} onCheckedChange={(v) => setNotificationPrefs(p => ({...p, report: v}))} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
                  <div className="space-y-0.5">
                    <Label className="text-base font-bold">New Badge Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get notified when they master a new skill.</p>
                  </div>
                  <Switch checked={notifs.badges} onCheckedChange={(v) => setNotificationPrefs(p => ({...p, badges: v}))} />
                </div>
              </div>
              <Button onClick={handleComplete} className="w-full h-14 text-lg font-black bg-primary hover:bg-[#3A9068] shadow-xl shadow-[#A8D5BC]">Go to Dashboard</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
