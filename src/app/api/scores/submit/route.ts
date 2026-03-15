import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { validateScore, validateXP } from '@/lib/validation';
import { withSecurity } from '@/lib/apiSecurity';
import * as admin from 'firebase-admin';

/**
 * Server-side score verification and submission endpoint.
 */
async function handler(request: NextRequest) {
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
    // The validateScore helper already handles theoretical maxes per game

    const batch = adminDb.batch();
    const userRef = adminDb.collection('users').doc(uid);
    const gameScoreRef = userRef.collection('gameScores').doc(gameName);
    const progressionRef = userRef.collection('progression').doc('stats');
    const activityLogRef = userRef.collection('activityLog').doc();

    // PRIVACY: stores score, xp, and timestamp. No IP or device IDs.
    batch.set(gameScoreRef, {
      lastScore: score,
      highScore: admin.firestore.FieldValue.increment(0), // Logic handled by check if needed, but increment(0) is placeholder
      xpEarned: admin.firestore.FieldValue.increment(xpEarned),
      gamesPlayed: admin.firestore.FieldValue.increment(1),
      lastPlayedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    batch.set(progressionRef, {
      totalXP: admin.firestore.FieldValue.increment(xpEarned),
      totalGamesPlayed: admin.firestore.FieldValue.increment(1),
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

export const POST = withSecurity(handler);
