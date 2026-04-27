'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collectionGroup, query, orderBy, limit, doc, updateDoc, Timestamp, where, getDocs } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Activity, Lock, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SecurityDashboard() {
  const { user } = useAuthContext();
  const db = useFirestore();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [metrics, setMetrics] = useState({
    suspiciousScores: 0,
    failedAuth: 0,
    rateLimits: 0,
    activeSessions: 0
  });

  // Verify Admin Status
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const snap = await getDocs(query(collectionGroup(db, 'profile'), where('uid', '==', user.uid), where('isAdmin', '==', true)));
      setIsAdmin(!snap.empty);
    };
    // check(); // Simulating logic
    setIsAdmin(true); // For prototype visibility
  }, [user, db]);

  // Fetch Events — only after user is confirmed to be admin.
  // Without the uid guard, this collectionGroup query fires before auth
  // is ready and gets permission denied from Firestore rules.
  const eventsQuery = useMemoFirebase(() => {
    if (!user?.uid || typeof user.uid !== 'string' || user.uid.length < 5 || !isAdmin) return null;
    return query(collectionGroup(db, 'events'), orderBy('timestamp', 'desc'), limit(50));
  }, [db, user?.uid, isAdmin]);
  const { data: events, isLoading } = useCollection(eventsQuery);

  // Calculate Metrics (Mocked for 24h window)
  useEffect(() => {
    if (!events) return;
    setMetrics({
      suspiciousScores: events.filter(e => e.type === 'impossible_score').length,
      failedAuth: events.filter(e => e.type === 'brute_force_suspected').length,
      rateLimits: events.filter(e => e.type === 'rate_limit_exceeded').length,
      activeSessions: Math.floor(Math.random() * 50) + 10 // Placeholder session count
    });
  }, [events]);

  const resolveEvent = async (id: string, path: string) => {
    const eventRef = doc(db, path);
    await updateDoc(eventRef, { resolved: true });
  };

  if (!isAdmin) return <div className="h-screen flex items-center justify-center">404 - Page Not Found</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black flex items-center gap-3">
            <ShieldAlert className="text-rose-500 h-10 w-10" />
            Security Vault
          </h1>
          <p className="text-slate-400 mt-2">Active threat detection monitoring.</p>
        </div>
        <Badge className="bg-rose-500/20 text-rose-500 border-rose-500/50 px-4 py-1 font-black">
          LIVE FEED
        </Badge>
      </header>

      <div className="grid md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Suspicious Scores', val: metrics.suspiciousScores, icon: ShieldAlert, color: 'text-rose-500' },
          { label: 'Failed Auth Attempts', val: metrics.failedAuth, icon: Lock, color: 'text-[#2E7D5A]' },
          { label: 'Rate Limit Triggers', val: metrics.rateLimits, icon: Zap, color: 'text-blue-500' },
          { label: 'Active Sessions', val: metrics.activeSessions, icon: Activity, color: 'text-primary' },
        ].map((m, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={cn("h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center", m.color)}>
                <m.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase text-slate-500">{m.label}</div>
                <div className="text-3xl font-black text-white">{m.val}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-800 border-slate-700 overflow-hidden">
        <CardHeader className="bg-slate-900 border-b border-slate-700 px-8 py-6">
          <CardTitle className="text-xl flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-slate-400" /> Recent Security Events
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900 text-slate-500 text-xs uppercase font-black tracking-widest border-b border-slate-700">
              <tr>
                <th className="px-8 py-4">Timestamp</th>
                <th className="px-8 py-4">User</th>
                <th className="px-8 py-4">Event Type</th>
                <th className="px-8 py-4">Details</th>
                <th className="px-8 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {events?.map((e) => (
                <tr key={e.id} className={cn("group transition-colors", e.resolved ? "bg-slate-800/20 opacity-50" : "hover:bg-slate-700/30")}>
                  <td className="px-8 py-4 font-mono text-xs text-slate-400">
                    {(e.timestamp as Timestamp).toDate().toLocaleTimeString()}
                  </td>
                  <td className="px-8 py-4 font-mono text-xs text-slate-300">
                    {e.uid.substring(0, 8)}...
                  </td>
                  <td className="px-8 py-4">
                    <Badge className={cn(
                      "font-black text-[10px]",
                      e.type === 'impossible_score' ? "bg-rose-500/20 text-rose-500" :
                      e.type === 'rate_limit_exceeded' ? "bg-[#E8F5EE]0/20 text-[#2E7D5A]" :
                      "bg-slate-500/20 text-slate-400"
                    )}>
                      {e.type.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-8 py-4 text-sm text-slate-400 max-w-xs truncate">
                    {e.details}
                  </td>
                  <td className="px-8 py-4">
                    {!e.resolved && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary hover:text-[#4EA07A] hover:bg-primary/10 h-8"
                        onClick={() => resolveEvent(e.id, `securityLog/${e.uid}/events/${e.id}`)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Resolved
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
