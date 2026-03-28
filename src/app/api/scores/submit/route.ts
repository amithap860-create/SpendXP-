import { NextRequest, NextResponse } from 'next/server';
import { validateScore, validateXP } from '@/lib/validation';
import * as admin from 'firebase-admin';
import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Initialize Firebase Admin dynamically
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');
    
    if (!serviceAccount.project_id) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
    }

    const adminApp = getApps().find(app => app.name === 'admin') || 
      initializeApp({
        credential: cert(serviceAccount),
      }, 'admin');

    const adminAuth = getAuth(adminApp);
    const adminDb = getFirestore(adminApp);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const { gameName, score, xpEarned } = await request.json();

    const scoreVal = validateScore(gameName, score);
    const xpVal = validateXP(xpEarned);

    if (!scoreVal.valid || !xpVal.valid) {
      return NextResponse.json({ error: 'Invalid submission data' }, { status: 400 });
    }

    const userRef = adminDb.collection('users').doc(uid);
    const gameScoreRef = userRef.collection('gameScores').doc(gameName);
    const progressionRef = userRef.collection('progression').doc('stats');

    const batch = adminDb.batch();

    batch.set(gameScoreRef, {
      lastScore: score,
      highScore: admin.firestore.FieldValue.increment(0),
      lastPlayedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    batch.set(progressionRef, {
      totalXP: admin.firestore.FieldValue.increment(xpEarned),
      lastActivityAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

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
