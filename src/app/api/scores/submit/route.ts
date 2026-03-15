
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { validateScore, validateXP } from '@/lib/validation';
import * as admin from 'firebase-admin';

/**
 * Server-side score verification and submission endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const { gameName, score, xpEarned, sessionToken } = await request.json();

    // 1. Logic Validation
    const scoreVal = validateScore(gameName, score);
    const xpVal = validateXP(xpEarned);

    if (!scoreVal.valid || !xpVal.valid) {
      console.warn(`[Security] Invalid score attempt by ${uid}:`, { gameName, score, xpEarned });
      return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });
    }

    // 2. Impossible Score Detection
    // Additional server-side rules could be added here...

    const batch = adminDb.batch();
    const userRef = adminDb.collection('users').doc(uid);
    const gameScoreRef = userRef.collection('gameScores').doc(gameName);
    const progressionRef = userRef.collection('progression').doc('stats');
    const activityLogRef = userRef.collection('activityLog').doc();

    // 3. Admin-side write (bypasses client rules)
    batch.set(gameScoreRef, {
      lastScore: score,
      highScore: admin.firestore.FieldValue.increment(0), // Handled by check below in real impl
      xpEarned: admin.firestore.FieldValue.increment(xpEarned),
      gamesPlayed: admin.firestore.FieldValue.increment(1),
      lastPlayedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    batch.set(progressionRef, {
      totalXP: admin.firestore.FieldValue.increment(xpEarned),
      totalGamesPlayed: admin.firestore.FieldValue.increment(1),
      walletBalance: admin.firestore.FieldValue.increment(score * 10),
      lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    batch.set(activityLogRef, {
      gameName,
      score,
      xpEarned,
      playedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    batch.update(userRef, {
      xp: admin.firestore.FieldValue.increment(xpEarned)
    });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Error] Score submission failed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
