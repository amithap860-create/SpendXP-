import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { requireUid, rateLimit } from '@/lib/serverSecurity';

export const dynamic = 'force-dynamic';

/**
 * POST /api/account/delete   (Authorization: Bearer <Firebase ID token>)
 *
 * Deletes the caller's account and personal data (Google Play "account deletion"
 * requirement; also DPDP/COPPA). Added 2026-10-21 — the old client-side delete
 * removed only users/{uid} and the Auth user, leaving every subcollection
 * (progression, quests, scores, activity log…) orphaned in Firestore.
 *
 * Removed: users/{uid} and ALL its subcollections, leaderboard entry, daily
 * challenge scores, chat threads, support/bug reports, invites and link records,
 * the parent<->child links on the other side, then the Firebase Auth user.
 * Retained on purpose: payments/* (tax & fraud records; no profile data).
 */
export async function POST(req: NextRequest) {
  const authed = await requireUid(req);
  if (authed instanceof NextResponse) return authed;
  const uid = authed.uid;

  const limited = await rateLimit(`account-delete:${uid}`, 5, 3600);
  if (limited) return limited;

  try {
    const { db, auth } = getFirebaseAdmin();
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();
    const u = userSnap.exists ? (userSnap.data() as any) : {};
    const email: string | undefined = authed.email || u.email;

    // 1. Unlink the other side of any parent<->child relationship.
    if (u.parentUid) {
      await db.collection('users').doc(u.parentUid).set(
        { linkedChildren: FieldValue.arrayRemove(uid) }, { merge: true }).catch(() => {});
    }
    const children: string[] = Array.isArray(u.linkedChildren) ? u.linkedChildren : [];
    for (const childUid of children) {
      await db.collection('users').doc(childUid).set(
        { parentLinked: false, parentUid: FieldValue.delete() }, { merge: true }).catch(() => {});
    }

    // 2. Top-level documents that belong to this user.
    const byField: Array<[string, string]> = [
      ['chatThreads', 'uid'], ['bugReports', 'uid'], ['supportTickets', 'uid'],
      ['pendingParentInvites', 'childUid'], ['pendingChildInvites', 'parentUid'],
      ['linkRequests', 'childUid'], ['linkRequests', 'parentUid'],
    ];
    for (const [col, field] of byField) {
      const snap = await db.collection(col).where(field, '==', uid).get().catch(() => null);
      if (!snap) continue;
      for (const d of snap.docs) await db.recursiveDelete(d.ref);
    }
    const directDocs = [
      db.collection('leaderboard').doc(uid),
      db.collection('consentRequests').doc(uid),
      db.collection('securityLog').doc(uid),
      db.collection('savingsGoals').doc(`${uid}_first`),
    ];
    for (const ref of directDocs) await db.recursiveDelete(ref).catch(() => {});
    if (email) {
      await db.collection('authAttempts').doc(email.toLowerCase()).delete().catch(() => {});
      await db.collection('pendingConsent').where('email', '==', email).get()
        .then(s => Promise.all(s.docs.map(d => d.ref.delete()))).catch(() => {});
    }

    // 3. Daily-challenge scores (dailyChallenges/{date}/scores/{uid}) and per-user day docs.
    const days = await db.collection('dailyChallenges').listDocuments().catch(() => []);
    await Promise.all(days.map(async (dayRef) => {
      if (dayRef.id.startsWith(`${uid}_`)) { await dayRef.delete().catch(() => {}); return; }
      await dayRef.collection('scores').doc(uid).delete().catch(() => {});
    }));

    // 4. The user document and every subcollection under it.
    await db.recursiveDelete(userRef);

    // 5. The Firebase Auth account itself.
    await auth.deleteUser(uid).catch((e: any) => {
      if (e?.code !== 'auth/user-not-found') throw e;
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[account/delete] failed for', uid, err);
    return NextResponse.json({ error: 'Could not delete the account. Please try again.' }, { status: 500 });
  }
}
