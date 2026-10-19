import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Stock contest leaderboard (2026-10-18). Admin-only: caller must send a valid
 * Firebase ID token for a user whose users/{uid}.isAdmin === true.
 *
 * Reads ALL gameScores docs via a collection-group query (no index needed for
 * an unfiltered group query) and filters in memory — fine at this scale.
 * Handles the retired v1 doc shape (single attempt: finalValue/returnPct).
 */
export async function GET(request: NextRequest) {
  try {
    const { auth, db } = getFirebaseAdmin();

    const header = request.headers.get('Authorization');
    if (!header?.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    let uid: string;
    try {
      uid = (await auth.verifyIdToken(header.split(' ')[1])).uid;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const me = await db.doc(`users/${uid}`).get();
    if (!me.exists || me.data()?.isAdmin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const snap = await db.collectionGroup('gameScores').get();
    const rows: any[] = [];
    for (const d of snap.docs) {
      if (d.id !== 'stockContest_stock1') continue;
      const x = d.data();
      const playerUid = d.ref.parent.parent?.id ?? '';
      const attempts = x.attempts ?? {};
      const finished = Object.entries(attempts)
        .filter(([, a]: any) => a?.finished)
        .map(([n, a]: any) => ({ n: Number(n), returnPct: a.returnPct, finalValue: a.finalValue }));
      // Legacy v1 shape
      const legacy = x.finished === true && typeof x.returnPct === 'number';
      const bestPct = typeof x.bestReturnPct === 'number' ? x.bestReturnPct : legacy ? x.returnPct : null;
      const bestVal = typeof x.bestFinalValue === 'number' ? x.bestFinalValue : legacy ? x.finalValue : null;
      const u = await db.doc(`users/${playerUid}`).get();
      rows.push({
        uid: playerUid,
        name: u.data()?.displayName ?? null,
        email: u.data()?.email ?? null,
        attemptsStarted: x.attemptsStarted ?? (legacy ? 1 : 0),
        finishedAttempts: finished.sort((a, b) => a.n - b.n),
        bestReturnPct: bestPct,
        bestFinalValue: bestVal,
        legacy,
      });
    }
    rows.sort((a, b) => (b.bestReturnPct ?? -1e9) - (a.bestReturnPct ?? -1e9));
    return NextResponse.json({ rows });
  } catch (e) {
    console.error('[contest-admin]', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
