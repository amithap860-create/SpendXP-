import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/parent/generate-invite-for-child
 *
 * Called by the parent from the setup page (Step 1 Option A).
 * Generates a short invite code the parent can share with their child.
 * When the child opens the link, they see the parent's info and can accept.
 *
 * Auth: Bearer <Firebase ID token> (the parent)
 * Returns: { inviteCode, inviteUrl, expiresAt }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parentUid: string;
  let parentName: string | undefined;
  let parentEmail: string | undefined;

  try {
    const { auth } = await getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    parentUid = decoded.uid;
    parentName = decoded.name;
    parentEmail = decoded.email;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { db } = await getFirebaseAdmin();

  // ── Fetch parent user doc for display name fallback ───────────────────────
  const parentSnap = await db.collection('users').doc(parentUid).get();
  const parentData = parentSnap.data() || {};
  const resolvedName = parentName || parentData.displayName || 'Your parent';
  const resolvedEmail = parentEmail || parentData.email || '';

  // ── Check if parent already has children linked ───────────────────────────
  // (Still allow generating invite — parent may want to link additional children)

  // ── Cancel any existing pending child invites for this parent ─────────────
  const existing = await db
    .collection('pendingChildInvites')
    .where('parentUid', '==', parentUid)
    .where('status', '==', 'pending')
    .get();

  const batch = db.batch();
  existing.docs.forEach((d) => batch.delete(d.ref));

  // ── Generate new invite code ───────────────────────────────────────────────
  const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 6);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const inviteRef = db.collection('pendingChildInvites').doc(inviteCode);
  batch.set(inviteRef, {
    inviteCode,
    parentUid,
    parentName: resolvedName,
    parentEmail: resolvedEmail,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'pending',
  });

  await batch.commit();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';
  const inviteUrl = `${appUrl}/join?parentCode=${inviteCode}`;

  return NextResponse.json({
    inviteCode,
    inviteUrl,
    expiresAt: expiresAt.toISOString(),
  });
}
