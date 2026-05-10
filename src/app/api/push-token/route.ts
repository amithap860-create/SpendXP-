import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

/**
 * POST /api/push-token
 * Saves an FCM push token to the user's Firestore document.
 * Called by the native app after push notification permission is granted.
 *
 * Body: { uid: string; token: string; platform: 'ios' | 'android' }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, token, platform } = body;

    if (!uid || typeof uid !== 'string' || uid.trim().length < 5) {
      return NextResponse.json({ error: 'Invalid uid' }, { status: 400 });
    }
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 });
    }
    if (!['ios', 'android'].includes(platform)) {
      return NextResponse.json({ error: 'Invalid platform' }, { status: 400 });
    }

    const { db } = await getFirebaseAdmin();

    await db.collection('users').doc(uid).update({
      pushToken: token,
      pushPlatform: platform,
      pushTokenUpdatedAt: new Date().toISOString(),
      pushEnabled: true,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[push-token] Failed to save token:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

/**
 * DELETE /api/push-token
 * Removes the push token when the user disables notifications or signs out.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { uid } = await req.json();
    if (!uid || typeof uid !== 'string') {
      return NextResponse.json({ error: 'Invalid uid' }, { status: 400 });
    }

    const { db } = await getFirebaseAdmin();
    await db.collection('users').doc(uid).update({
      pushToken: null,
      pushEnabled: false,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[push-token] Failed to delete token:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
