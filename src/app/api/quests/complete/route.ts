/**
 * POST /api/quests/complete
 *
 * Server-side quest completion handler. Enforces:
 *  • Daily quest limit: free users → 3 quests per calendar day (IST)
 *  • Streak: increment if completed within 24 h of lastActivityDate, reset otherwise
 *  • XP award (validated, capped)
 *  • Quest progress record (idempotent — re-submitting same questId is a no-op)
 *
 * Request body:
 *   { questId: string, xpEarned: number, optimalRate: number, healthDelta: number }
 *
 * Response:
 *   200 { success: true, xpAwarded, streak, questsToday, dailyLimitReached }
 *   403 { error: 'daily_limit_reached' }
 *   401 { error: 'Unauthorized' }
 */

import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

const FREE_DAILY_QUEST_LIMIT = 3;
const MAX_XP_PER_QUEST = 500;

/** Returns the current date in IST as "YYYY-MM-DD" */
function getISTDateKey(): string {
  const now = new Date();
  // IST = UTC + 5:30
  const istMs = now.getTime() + 5.5 * 60 * 60 * 1000;
  return new Date(istMs).toISOString().split('T')[0];
}

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

    // ── Parse & validate body ─────────────────────────────────────────────────
    const body = await request.json();
    const questId: string = String(body.questId || '').trim();
    const rawXP: number = Number(body.xpEarned) || 0;
    const optimalRate: number = Math.min(1, Math.max(0, Number(body.optimalRate) || 0));
    const healthDelta: number = Math.min(30, Math.max(-30, Number(body.healthDelta) || 0));

    if (!questId) {
      return NextResponse.json({ error: 'Missing questId' }, { status: 400 });
    }
    // Perfect-run bonus: +50 XP if every single choice was optimal
    const perfectBonus = optimalRate >= 1.0 ? 50 : 0;
    // Cap XP to prevent inflation
    const xpToAward = Math.min(MAX_XP_PER_QUEST, Math.max(0, Math.round(rawXP) + perfectBonus));

    const todayKey = getISTDateKey();

    // ── Firestore refs ────────────────────────────────────────────────────────
    const userRef = adminDb.collection('users').doc(uid);
    const statsRef = userRef.collection('progression').doc('stats');
    const questProgressRef = userRef.collection('questProgress').doc(questId);
    const dailyRef = userRef.collection('dailyActivity').doc(todayKey);

    // ── Run in a transaction for atomicity ────────────────────────────────────
    const result = await adminDb.runTransaction(async (tx) => {
      const [userSnap, statsSnap, questSnap, dailySnap] = await Promise.all([
        tx.get(userRef),
        tx.get(statsRef),
        tx.get(questProgressRef),
        tx.get(dailyRef),
      ]);

      const userData = userSnap.data() || {};
      const statsData = statsSnap.data() || {};
      const isPremium: boolean = Boolean(userData.isPremium);

      // ── Idempotency: quest already completed ──────────────────────────────
      if (questSnap.exists) {
        const existing = questSnap.data()!;
        const questsToday: number = dailySnap.data()?.questsCompleted ?? 0;
        return {
          success: true,
          alreadyCompleted: true,
          xpAwarded: existing.xpEarned ?? 0,
          streak: statsData.currentStreak ?? 0,
          questsToday,
          // Correctly reflect limit state even on idempotency path
          dailyLimitReached: !isPremium && questsToday >= FREE_DAILY_QUEST_LIMIT,
        };
      }

      // ── Daily limit check ─────────────────────────────────────────────────
      const questsToday: number = dailySnap.data()?.questsCompleted ?? 0;
      if (!isPremium && questsToday >= FREE_DAILY_QUEST_LIMIT) {
        return { limitReached: true, questsToday };
      }

      // ── Streak calculation ────────────────────────────────────────────────
      const now = new Date();
      const lastActivityTs: Timestamp | null = statsData.lastActivityDate ?? null;
      let currentStreak: number = statsData.currentStreak ?? 0;
      let longestStreak: number = statsData.longestStreak ?? 0;

      if (lastActivityTs) {
        const lastDate = lastActivityTs.toDate();
        const lastKey = (() => {
          const ms = lastDate.getTime() + 5.5 * 60 * 60 * 1000;
          return new Date(ms).toISOString().split('T')[0];
        })();

        if (lastKey === todayKey) {
          // Same day — streak unchanged
        } else {
          // Calculate gap in IST calendar days
          const [ly, lm, ld] = lastKey.split('-').map(Number);
          const [ty, tm, td] = todayKey.split('-').map(Number);
          const lastMidnight = Date.UTC(ly, lm - 1, ld);
          const todayMidnight = Date.UTC(ty, tm - 1, td);
          const dayGap = Math.round((todayMidnight - lastMidnight) / 86400000);

          if (dayGap === 1) {
            // Consecutive day
            currentStreak += 1;
          } else {
            // Gap > 1 day — streak reset
            currentStreak = 1;
          }
        }
      } else {
        // First activity ever
        currentStreak = 1;
      }

      longestStreak = Math.max(longestStreak, currentStreak);

      // ── Financial health (clamp 0–100) ────────────────────────────────────
      const currentHealth: number = statsData.financialHealth ?? 50;
      const newHealth = Math.min(100, Math.max(0, currentHealth + healthDelta));

      // ── Write quest progress ──────────────────────────────────────────────
      tx.set(questProgressRef, {
        completed: true,
        completedAt: FieldValue.serverTimestamp(),
        score: Math.round(optimalRate * 100),
        xpEarned: xpToAward,
        optimalRate,
        healthDelta,
      });

      // ── Update stats ──────────────────────────────────────────────────────
      tx.set(
        statsRef,
        {
          totalXP: FieldValue.increment(xpToAward),
          questsCompleted: FieldValue.increment(1),
          currentStreak,
          longestStreak,
          lastActivityDate: FieldValue.serverTimestamp(),
          financialHealth: newHealth,
        },
        { merge: true }
      );

      // ── Increment top-level XP for leaderboard ───────────────────────────
      tx.set(userRef, { xp: FieldValue.increment(xpToAward) }, { merge: true });

      // ── Daily activity counter ────────────────────────────────────────────
      const newQuestsToday = questsToday + 1;
      tx.set(
        dailyRef,
        {
          questsCompleted: newQuestsToday,
          date: todayKey,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      return {
        success: true,
        alreadyCompleted: false,
        xpAwarded: xpToAward,
        streak: currentStreak,
        questsToday: newQuestsToday,
        dailyLimitReached: !isPremium && newQuestsToday >= FREE_DAILY_QUEST_LIMIT,
      };
    });

    // ── Limit reached (returned from transaction) ─────────────────────────────
    if ('limitReached' in result && result.limitReached) {
      return NextResponse.json(
        {
          error: 'daily_limit_reached',
          questsToday: result.questsToday,
          limit: FREE_DAILY_QUEST_LIMIT,
          message: `You've completed ${FREE_DAILY_QUEST_LIMIT} quests today. Upgrade to Premium for unlimited quests.`,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API] /api/quests/complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/** GET /api/quests/daily-status — returns today's quest count for the authed user */
export async function GET(request: NextRequest) {
  try {
    const adminApp = initAdmin();
    if (!adminApp) {
      return NextResponse.json({ error: 'Service not configured' }, { status: 503 });
    }

    const adminAuth = getAuth(adminApp);
    const adminDb = getFirestore(adminApp);

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

    const todayKey = getISTDateKey();
    const userRef = adminDb.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const isPremium = Boolean(userSnap.data()?.isPremium);

    const dailySnap = await userRef.collection('dailyActivity').doc(todayKey).get();
    const questsToday: number = dailySnap.data()?.questsCompleted ?? 0;

    return NextResponse.json({
      questsToday,
      limit: FREE_DAILY_QUEST_LIMIT,
      remaining: isPremium ? null : Math.max(0, FREE_DAILY_QUEST_LIMIT - questsToday),
      isPremium,
      dailyLimitReached: !isPremium && questsToday >= FREE_DAILY_QUEST_LIMIT,
    });
  } catch (error: any) {
    console.error('[API] GET /api/quests/complete error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
