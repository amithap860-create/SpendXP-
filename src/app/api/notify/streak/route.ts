/**
 * GET|POST /api/notify/streak
 *
 * Sends FCM push notifications to users who:
 *   1. Have a pushToken saved (opted in to notifications)
 *   2. Have NOT completed any activity today (IST calendar day)
 *   3. Have a current streak ≥ 0 (even new users get a nudge)
 *
 * Called automatically via Vercel Cron at 7:00 PM IST (13:30 UTC) daily.
 * Can also be triggered manually via POST with the same auth header.
 *
 * Authentication: Authorization: Bearer {NOTIFY_CRON_SECRET}
 * or x-cron-secret: {NOTIFY_CRON_SECRET} for manual POSTs.
 *
 * Setup:
 *   1. Add NOTIFY_CRON_SECRET to Vercel env vars (any long random string)
 *   2. Vercel Cron is already configured in vercel.json → crons[]
 *   3. Firebase Console → Authentication → Templates → Password Reset:
 *      set custom action URL to https://spendxp.vercel.app/reset-password
 */

import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { getMessaging } from 'firebase-admin/messaging';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ── Helpers ───────────────────────────────────────────────────────────────────

function getISTDateKey(): string {
  const now = new Date();
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().split('T')[0];
}

function checkAuth(request: NextRequest): boolean {
  const secret = process.env.NOTIFY_CRON_SECRET;
  if (!secret) return false;
  // Vercel Cron: Authorization: Bearer {CRON_SECRET}
  const authHeader = request.headers.get('Authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  // Manual trigger: x-cron-secret: {CRON_SECRET}
  if (request.headers.get('x-cron-secret') === secret) return true;
  return false;
}

// ── Core logic ────────────────────────────────────────────────────────────────

async function runStreakNotifications(): Promise<{
  sent: number;
  skipped: number;
  stale: number;
  date: string;
}> {
  const { app, db } = getFirebaseAdmin();
  const messaging = getMessaging(app);
  const todayKey = getISTDateKey();

  // Users with push notifications enabled
  const usersSnap = await db
    .collection('users')
    .where('pushEnabled', '==', true)
    .select('pushToken')
    .limit(500)
    .get();

  if (usersSnap.empty) {
    return { sent: 0, skipped: 0, stale: 0, date: todayKey };
  }

  let sent = 0, skipped = 0, stale = 0;
  const staleUids: string[] = [];

  for (const userDoc of usersSnap.docs) {
    const { pushToken } = userDoc.data();
    if (!pushToken || typeof pushToken !== 'string') { skipped++; continue; }

    const uid = userDoc.id;

    // Skip users who already did something today
    const dailySnap = await db
      .collection('users').doc(uid)
      .collection('dailyActivity').doc(todayKey)
      .get();
    if ((dailySnap.data()?.questsCompleted ?? 0) > 0) { skipped++; continue; }

    // Get their current streak
    const statsSnap = await db
      .collection('users').doc(uid)
      .collection('progression').doc('stats')
      .get();
    const currentStreak: number = statsSnap.data()?.currentStreak ?? 0;

    // Build the FCM message
    const isAtRisk = currentStreak > 1;
    try {
      await messaging.send({
        token: pushToken,
        notification: {
          title: isAtRisk
            ? `🔥 Don't break your ${currentStreak}-day streak!`
            : '⚡ Start your streak today',
          body: isAtRisk
            ? 'Complete a quest or game before midnight to keep it going.'
            : 'Jump in for 5 minutes — your first streak day is waiting.',
        },
        data: {
          screen: '/dashboard',
          type: 'streak_reminder',
          streak: String(currentStreak),
        },
        android: {
          priority: 'high',
          notification: { sound: 'default' },
        },
        apns: {
          payload: { aps: { badge: 1, sound: 'default' } },
        },
      });
      sent++;
    } catch (err: any) {
      // Token no longer valid → clean it up
      if (
        err.code === 'messaging/registration-token-not-registered' ||
        err.code === 'messaging/invalid-registration-token'
      ) {
        staleUids.push(uid);
        stale++;
      } else {
        skipped++;
      }
    }

    // Throttle: 100 msgs/sec, well under FCM's 600/min limit
    if ((sent + stale) % 100 === 0 && sent + stale > 0) {
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Clean up stale tokens
  if (staleUids.length > 0) {
    const batch = db.batch();
    for (const uid of staleUids) {
      batch.update(db.collection('users').doc(uid), {
        pushToken: null,
        pushEnabled: false,
      });
    }
    await batch.commit();
  }

  return { sent, skipped, stale, date: todayKey };
}

// ── Route handlers ────────────────────────────────────────────────────────────

/** GET — called by Vercel Cron at 7:00 PM IST (13:30 UTC) */
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runStreakNotifications();
    console.log('[notify/streak] Cron run:', result);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[notify/streak] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** POST — manual trigger (e.g. from admin dashboard) */
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await runStreakNotifications();
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error('[notify/streak] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
