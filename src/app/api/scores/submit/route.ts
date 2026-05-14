import { NextRequest, NextResponse } from 'next/server';
import { validateScore, validateXP } from '@/lib/validation';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function initAdmin() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');
  if (!serviceAccount.project_id) return null;
  const existing = getApps().find((a) => a.name === 'admin');
  if (existing) return existing;
  return initializeApp({ credential: cert(serviceAccount) }, 'admin');
}

export async function POST(request: NextRequest) {
  try {
    const adminApp = initAdmin();
    if (!adminApp) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
    }

    const adminAuth = getAuth(adminApp);
    const adminDb = getFirestore(adminApp);

    // ── Authenticate ──────────────────────────────────────────────────────────
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    let uid: string;
    try {
      const decoded = await adminAuth.verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse & validate ──────────────────────────────────────────────────────
    const { gameName, score, xpEarned } = await request.json();

    const scoreVal = validateScore(gameName, score);
    const xpVal = validateXP(xpEarned);

    if (!scoreVal.valid || !xpVal.valid) {
      return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const gameScoreRef = userRef.collection('gameScores').doc(gameName);
    const progressionRef = userRef.collection('progression').doc('stats');
    const activityRef = userRef.collection('activityLog').doc();

    // ── Transaction: properly compute high score ──────────────────────────────
    await adminDb.runTransaction(async (tx) => {
      const gameSnap = await tx.get(gameScoreRef);
      const existing = gameSnap.data();
      const currentHigh: number = existing?.highScore ?? 0;
      const gamesPlayed: number = (existing?.gamesPlayed ?? 0) + 1;
      const newHigh = Math.max(currentHigh, score);
      const scoreHistory: number[] = [...(existing?.scoreHistory ?? []), score].slice(-20);

      // Game score document
      tx.set(
        gameScoreRef,
        {
          lastScore: score,
          highScore: newHigh,
          gamesPlayed,
          scoreHistory,
          lastPlayedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Progression stats
      tx.set(
        progressionRef,
        {
          totalXP: FieldValue.increment(xpEarned),
          gamesPlayed: FieldValue.increment(1),
          lastActivityAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      // Top-level XP for leaderboard queries
      tx.set(userRef, { xp: FieldValue.increment(xpEarned) }, { merge: true });

      // Activity log entry — shown on parent dashboard
      tx.set(activityRef, {
        gameName,
        score,
        xpEarned,
        highScore: newHigh,
        playedAt: FieldValue.serverTimestamp(),
      });
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('[API Error] Score submission failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
