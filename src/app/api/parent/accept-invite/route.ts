import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { rateLimit, clientIp } from '@/lib/serverSecurity';

// SECURITY (2026-10-20): invite codes are now 12 chars. Old 6-char codes are
// rejected outright — they were brute-forceable, and any still pending expire
// within 7 days anyway (users just generate a new one).
const CODE_RE = /^[A-Z2-9]{12}$/;

export const dynamic = 'force-dynamic';

/**
 * POST /api/parent/accept-invite
 *
 * Called after the parent signs in/up via the /join page.
 * Validates the invite code, links the parent to the child in Firestore.
 *
 * Auth: Bearer <Firebase ID token> (the parent)
 * Body: { inviteCode: string }
 * Returns: { ok: true, childName: string }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let parentUid: string;
  let parentEmail: string | undefined;
  let parentName: string | undefined;

  try {
    const { auth } = await getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    parentUid = decoded.uid;
    parentEmail = decoded.email;
    parentName = decoded.name;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const limitedUid = await rateLimit(`parent-invite-accept:uid:${parentUid}`, 10, 3600);
  if (limitedUid) return limitedUid;
  const limitedIp = await rateLimit(`parent-invite-accept:ip:${clientIp(req)}`, 30, 3600);
  if (limitedIp) return limitedIp;

  const body = await req.json().catch(() => ({}));
  const inviteCode = typeof body.inviteCode === 'string' ? body.inviteCode.trim().toUpperCase() : '';
  if (!CODE_RE.test(inviteCode)) {
    return NextResponse.json({ error: 'Invalid invite code.' }, { status: 400 });
  }

  const { db } = await getFirebaseAdmin();

  // ── Fetch invite ───────────────────────────────────────────────────────────
  const inviteSnap = await db.collection('pendingParentInvites').doc(inviteCode).get();

  if (!inviteSnap.exists) {
    return NextResponse.json({ error: 'Invite code not found or already used.' }, { status: 404 });
  }

  const invite = inviteSnap.data()!;

  if (invite.status !== 'pending') {
    return NextResponse.json({ error: 'This invite has already been used.' }, { status: 409 });
  }

  if (new Date() > new Date(invite.expiresAt)) {
    await inviteSnap.ref.delete();
    return NextResponse.json({ error: 'This invite link has expired. Ask your child to generate a new one.' }, { status: 410 });
  }

  const childUid: string = invite.childUid;

  // ── Prevent self-linking ───────────────────────────────────────────────────
  if (parentUid === childUid) {
    return NextResponse.json({ error: 'You cannot link to your own account.' }, { status: 400 });
  }

  // ── Check child not already linked ────────────────────────────────────────
  const childSnap = await db.collection('users').doc(childUid).get();
  const childData = childSnap.data() || {};

  if (childData.parentLinked) {
    return NextResponse.json({ error: "This child's account is already linked to a parent." }, { status: 409 });
  }

  // ── Ensure parent user doc exists ─────────────────────────────────────────
  const parentSnap = await db.collection('users').doc(parentUid).get();
  if (!parentSnap.exists) {
    // Create minimal parent doc if onboarding hasn't run yet
    await db.collection('users').doc(parentUid).set({
      uid: parentUid,
      email: parentEmail || '',
      displayName: parentName || '',
      isParent: true,
      role: 'parent',
      linkedChildren: [],
      setupComplete: false,
      createdAt: new Date().toISOString(),
    });
  }

  // ── Atomic batch: link both sides ─────────────────────────────────────────
  const batch = db.batch();
  const now = new Date().toISOString();

  // Update child doc
  batch.update(db.collection('users').doc(childUid), {
    parentLinked: true,
    parentUid: parentUid,
    parentEmail: parentEmail || '',
    pendingParentEmail: null,
    parentLinkedAt: now,
  });

  // Update parent doc
  batch.update(db.collection('users').doc(parentUid), {
    isParent: true,
    linkedChildren: (parentSnap.data()?.linkedChildren || []).includes(childUid)
      ? parentSnap.data()?.linkedChildren
      : [...(parentSnap.data()?.linkedChildren || []), childUid],
    setupComplete: true,
    parentLinkedAt: now,
  });

  // Create link record
  const linkRef = db.collection('linkRequests').doc(`${childUid}_${parentUid}`);
  batch.set(linkRef, {
    parentUid,
    childUid,
    parentEmail: parentEmail || '',
    childEmail: childData.email || invite.childEmail || '',
    status: 'accepted',
    createdAt: now,
  });

  // Mark invite as used
  // Precondition: fails the whole batch if someone else accepted this invite
  // between our read and this write (prevents a double-accept race).
  batch.update(inviteSnap.ref, { status: 'accepted', acceptedAt: now, acceptedByUid: parentUid }, { lastUpdateTime: inviteSnap.updateTime! });

  await batch.commit();

  return NextResponse.json({
    ok: true,
    childName: invite.childName || childData.displayName || 'your child',
    childUid,
  });
}

/**
 * GET /api/parent/accept-invite?code=XXX
 *
 * Fetch invite details so the /join page can show who the parent is connecting with.
 * Returns only non-sensitive info.
 */
export async function GET(req: NextRequest) {
  const limited = await rateLimit(`parent-invite-lookup:ip:${clientIp(req)}`, 30, 3600);
  if (limited) return limited;

  const code = (req.nextUrl.searchParams.get('code') || '').trim().toUpperCase();
  if (!CODE_RE.test(code)) {
    return NextResponse.json({ error: 'Invalid code.' }, { status: 400 });
  }

  const { db } = await getFirebaseAdmin();
  const inviteSnap = await db.collection('pendingParentInvites').doc(code).get();

  if (!inviteSnap.exists) {
    return NextResponse.json({ error: 'Invite not found or already used.' }, { status: 404 });
  }

  const invite = inviteSnap.data()!;

  if (invite.status !== 'pending') {
    return NextResponse.json({ error: 'This invite has already been accepted.' }, { status: 409 });
  }

  if (new Date() > new Date(invite.expiresAt)) {
    return NextResponse.json({ error: 'This invite has expired.' }, { status: 410 });
  }

  return NextResponse.json({
    childName: invite.childName,
    // Masked — the page only needs enough to recognise the account.
    childEmail: maskEmail(invite.childEmail),
    expiresAt: invite.expiresAt,
    inviteCode: invite.inviteCode,
  });
}

function maskEmail(email: unknown): string {
  if (typeof email !== 'string' || !email.includes('@')) return '';
  const [local, domain] = email.split('@');
  return `${local.slice(0, 2)}${'*'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}
