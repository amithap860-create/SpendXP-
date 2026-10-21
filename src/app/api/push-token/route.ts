import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { requireUid, rateLimit } from '@/lib/serverSecurity';

export const dynamic = 'force-dynamic';

/**
 * POST /api/push-token
 * Saves an FCM push token to the user's Firestore document.
 * Called by the native app after push notification permission is granted.
 *
 * Body: { uid: string; token: string; platform: 'ios' | 'android' }
 */
export async function POST(req: NextRequest) {
  try {
    // SECURITY (2026-10-20): uid used to come from the body with no auth, so
    // anyone could overwrite/disable any user's push token. Token-derived now.
    const authed = await requireUid(req);
    if (authed instanceof NextResponse) return authed;
    const uid = authed.uid;
    const limited = await rateLimit(`push-token:${uid}`, 30, 3600);
    if (limited) return limited;

    const body = await req.json();
    const { token, platform } = body;

    if (!token || typeof token !== 'string' || token.length > 4096) {
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
    const authed = await requireUid(req);
    if (authed instanceof NextResponse) return authed;
    const uid = authed.uid;

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
