import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/parent/generate-invite
 *
 * Called by the child from their Profile page.
 * Generates a short invite code, stores it in pendingParentInvites/{code},
 * and returns the shareable link.
 *
 * Auth: Bearer <Firebase ID token> (the child)
 * Returns: { inviteCode, inviteUrl, expiresAt }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let uid: string;
  let displayName: string | undefined;
  let email: string | undefined;

  try {
    const { auth } = await getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    uid = decoded.uid;
    displayName = decoded.name;
    email = decoded.email;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { db } = await getFirebaseAdmin();

  // ── Check if already linked ────────────────────────────────────────────────
  const userSnap = await db.collection('users').doc(uid).get();
  const userData = userSnap.data() || {};

  if (userData.parentLinked) {
    return NextResponse.json({ error: 'Your account is already linked to a parent.' }, { status: 409 });
  }

  // ── Cancel any existing pending invite for this child ─────────────────────
  const existing = await db
    .collection('pendingParentInvites')
    .where('childUid', '==', uid)
    .where('status', '==', 'pending')
    .get();

  const batch = db.batch();
  existing.docs.forEach((doc) => batch.delete(doc.ref));

  // ── Generate new invite code ───────────────────────────────────────────────
  // 6 alphanumeric uppercase chars — easy to read/type if needed
  const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const inviteRef = db.collection('pendingParentInvites').doc(inviteCode);
  batch.set(inviteRef, {
    inviteCode,
    childUid: uid,
    childName: displayName || userData.displayName || 'Your child',
    childEmail: email || userData.email || '',
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'pending',
  });

  await batch.commit();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';
  const inviteUrl = `${appUrl}/join?code=${inviteCode}`;

  return NextResponse.json({ inviteCode, inviteUrl, expiresAt: expiresAt.toISOString() });
}
