'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

/**
 * Stock contest leaderboard — admin only (checked server-side by
 * /api/admin/contest). Lives outside /admin because middleware 404s /admin
 * without a cookie nothing sets.
 */
type Row = {
  uid: string; name: string | null; email: string | null; attemptsStarted: number;
  finishedAttempts: { n: number; returnPct: number; finalValue: number }[];
  bestReturnPct: number | null; bestFinalValue: number | null; legacy: boolean;
};

export default function ContestAdminPage() {
  const { user, loading: authLoading } = useAuthContext();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setBusy(true); setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch('/api/admin/contest', { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 403) { setError('Not an admin account. Set isAdmin: true on your users document in Firebase.'); setRows(null); }
      else if (!res.ok) { setError(`Request failed (${res.status}).`); setRows(null); }
      else setRows((await res.json()).rows);
    } catch { setError('Could not load.'); }
    setBusy(false);
  }, []);

  useEffect(() => { if (user) load(); }, [user, load]);

  if (authLoading) return <div className="p-8">Loading…</div>;
  if (!user) return <div className="p-8">Sign in first.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Stock contest leaderboard</h1>
        <Button onClick={load} disabled={busy} variant="outline">{busy ? 'Loading…' : 'Refresh'}</Button>
      </div>
      <p className="text-sm text-muted-foreground">Ranked by best % return across finished attempts. Unfinished or abandoned attempts still count toward the 3-attempt limit.</p>
      {error && <Card className="p-4 text-sm text-rose-700">{error}</Card>}
      {rows && (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b"><th className="p-3">#</th><th className="p-3">Player</th><th className="p-3">Best return</th><th className="p-3">Best value</th><th className="p-3">Attempts</th><th className="p-3">Each finished</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.uid} className="border-b last:border-0 align-top">
                  <td className="p-3 font-black">{r.bestReturnPct === null ? '–' : i + 1}</td>
                  <td className="p-3"><div className="font-bold">{r.name || '(no name)'}</div><div className="text-xs text-muted-foreground">{r.email}</div><div className="text-[10px] text-muted-foreground">{r.uid.slice(0, 8)}</div></td>
                  <td className="p-3 font-black">{r.bestReturnPct === null ? 'none finished' : `${r.bestReturnPct > 0 ? '+' : ''}${r.bestReturnPct}%`}</td>
                  <td className="p-3">{r.bestFinalValue === null ? '–' : `$${r.bestFinalValue.toFixed(2)}`}</td>
                  <td className="p-3">{r.attemptsStarted}/3{r.legacy ? ' (old build)' : ''}</td>
                  <td className="p-3 text-xs">{r.finishedAttempts.map(a => `#${a.n}: ${a.returnPct}%`).join(' · ') || '–'}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="p-4 text-muted-foreground" colSpan={6}>No entries yet.</td></tr>}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
