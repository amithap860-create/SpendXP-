import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/stripe/verify-session
 *
 * Polled by /upgrade/success after checkout to confirm isPremium = true in Firestore.
 * The Stripe webhook sets this — this endpoint just reads it.
 *
 * Body: { sessionId: string }
 * Auth: Bearer <Firebase ID token>
 * Returns: { isPremium: boolean }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let uid: string;
  try {
    const { auth } = await getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { db } = await getFirebaseAdmin();
  const userSnap = await db.collection('users').doc(uid).get();
  const isPremium = userSnap.data()?.isPremium === true;

  return NextResponse.json({ isPremium });
}
