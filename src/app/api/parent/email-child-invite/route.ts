import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { emailService } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/parent/email-child-invite
 *
 * Called from the parent setup page (Step 1 Option B).
 * Generates an invite code and sends it directly to the child's email address.
 *
 * Auth: Bearer <Firebase ID token> (the parent)
 * Body: { childEmail: string }
 * Returns: { ok: true }
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

  const body = await req.json().catch(() => ({}));
  const childEmail = (body.childEmail || '').toLowerCase().trim();

  if (!childEmail || !childEmail.includes('@')) {
    return NextResponse.json({ error: 'A valid child email is required.' }, { status: 400 });
  }

  const { db } = await getFirebaseAdmin();

  // ── Fetch parent info for the email ───────────────────────────────────────
  const parentSnap = await db.collection('users').doc(parentUid).get();
  const parentData = parentSnap.data() || {};
  const resolvedName = parentName || parentData.displayName || 'A SpendXP parent';
  const resolvedEmail = parentEmail || parentData.email || '';

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
    targetChildEmail: childEmail,
    createdAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    status: 'pending',
  });

  await batch.commit();

  // ── Send email to child ────────────────────────────────────────────────────
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';
  const acceptUrl = `${appUrl}/join?parentCode=${inviteCode}`;

  const sent = await emailService.sendChildConnectionRequest({
    childEmail,
    parentName: resolvedName,
    parentEmail: resolvedEmail,
    acceptUrl,
    expiresInDays: 7,
  });

  if (!sent) {
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
