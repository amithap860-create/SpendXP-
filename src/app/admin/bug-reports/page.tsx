'use client';

import { useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { db } from '@/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, Timestamp } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Bug, CheckCircle2, Clock, Monitor, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface BugReport {
  id: string;
  description: string;
  screen: string;
  screenshot: string | null;
  uid: string;
  userEmail: string | null;
  userAgent: string | null;
  status: 'new' | 'resolved';
  createdAt: Timestamp | null;
}

export default function BugReportsAdminPage() {
  const { user } = useAuthContext();
  const router = useRouter();
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [resolving, setResolving] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    // Verify admin status via Firestore, then subscribe to reports
    let unsub: (() => void) | undefined;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (!snap.exists() || !snap.data()?.isAdmin) {
        router.replace('/dashboard');
        return;
      }
      const q = query(collection(db, 'bugReports'), orderBy('createdAt', 'desc'));
      unsub = onSnapshot(q, s => {
        setReports(s.docs.map(d => ({ id: d.id, ...d.data() } as BugReport)));
        setLoading(false);
      }, () => setLoading(false));
    });

    return () => unsub?.();
  }, [user, router]);

  const markResolved = async (id: string) => {
    setResolving(id);
    await updateDoc(doc(db, 'bugReports', id), { status: 'resolved' });
    setResolving(null);
  };

  const newCount = reports.filter(r => r.status === 'new').length;

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bug className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-black text-slate-900">Bug Reports</h1>
            <p className="text-sm text-slate-500">{newCount} new · {reports.length} total</p>
          </div>
        </div>
        {newCount > 0 && (
          <Badge className="bg-rose-100 text-rose-700 border-none font-black px-3 py-1">
            {newCount} unresolved
          </Badge>
        )}
      </div>

      {reports.length === 0 && (
        <Card className="border-none shadow-md">
          <CardContent className="py-16 text-center text-slate-400">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-[#4EA07A]" />
            <p className="font-bold">No bug reports yet.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {reports.map(report => {
          const isNew = report.status === 'new';
          const date = report.createdAt?.toDate();
          const dateStr = date ? date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown time';
          const isOpen = expanded === report.id;

          return (
            <Card key={report.id} className={cn('border-none shadow-md overflow-hidden transition-all', isNew ? 'ring-1 ring-rose-200' : 'opacity-70')}>
              <CardHeader
                className="cursor-pointer select-none py-4 px-5"
                onClick={() => setExpanded(isOpen ? null : report.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={cn('mt-0.5 h-2.5 w-2.5 rounded-full shrink-0', isNew ? 'bg-rose-500' : 'bg-[#4EA07A]')} />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-sm leading-snug truncate">{report.description}</p>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Monitor className="h-3 w-3" />{report.screen}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Clock className="h-3 w-3" />{dateStr}
                        </span>
                        {report.userEmail && (
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <User className="h-3 w-3" />{report.userEmail}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge className={cn('shrink-0 border-none font-black text-xs', isNew ? 'bg-rose-100 text-rose-700' : 'bg-[#C8E8D8] text-primary')}>
                    {isNew ? 'New' : 'Resolved'}
                  </Badge>
                </div>
              </CardHeader>

              {isOpen && (
                <CardContent className="px-5 pb-5 pt-0 space-y-4 border-t border-slate-100">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">Full description</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{report.description}</p>
                  </div>

                  {report.userAgent && (
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">User agent</p>
                      <p className="text-xs text-slate-500 break-all font-mono bg-slate-50 rounded-lg p-2">{report.userAgent}</p>
                    </div>
                  )}

                  {report.uid && (
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1">User ID</p>
                      <p className="text-xs text-slate-500 font-mono">{report.uid}</p>
                    </div>
                  )}

                  {report.screenshot && (
                    <div>
                      <p className="text-xs font-black uppercase text-slate-400 tracking-widest mb-2">Screenshot</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={report.screenshot} alt="Bug screenshot" className="max-w-full rounded-xl border border-slate-200 max-h-80 object-contain" />
                    </div>
                  )}

                  {isNew && (
                    <Button
                      onClick={() => markResolved(report.id)}
                      disabled={resolving === report.id}
                      className="gap-2"
                      variant="outline"
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {resolving === report.id ? 'Marking…' : 'Mark as Resolved'}
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
