import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * GET /api/parent/accept-child-invite?code=XXX
 *
 * Fetch parent invite details for the /join page (child-facing side).
 * Returns only non-sensitive info: parent name, parent email, expiry.
 */
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code || code.trim().length < 4) {
    return NextResponse.json({ error: 'Invalid code.' }, { status: 400 });
  }

  const { db } = await getFirebaseAdmin();
  const inviteSnap = await db
    .collection('pendingChildInvites')
    .doc(code.toUpperCase())
    .get();

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
    parentName: invite.parentName,
    parentEmail: invite.parentEmail,
    expiresAt: invite.expiresAt,
    inviteCode: invite.inviteCode,
  });
}

/**
 * POST /api/parent/accept-child-invite
 *
 * Called when the child accepts a parent-initiated invite on /join?parentCode=xxx.
 * Links both accounts atomically in Firestore.
 *
 * Auth: Bearer <Firebase ID token> (the child)
 * Body: { inviteCode: string }
 * Returns: { ok: true, parentName: string }
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let childUid: string;
  let childEmail: string | undefined;
  let childName: string | undefined;

  try {
    const { auth } = await getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(authHeader.slice(7));
    childUid = decoded.uid;
    childEmail = decoded.email;
    childName = decoded.name;
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { inviteCode } = body;

  if (!inviteCode || typeof inviteCode !== 'string') {
    return NextResponse.json({ error: 'Invite code is required.' }, { status: 400 });
  }

  const { db } = await getFirebaseAdmin();

  // ── Fetch invite ───────────────────────────────────────────────────────────
  const inviteSnap = await db
    .collection('pendingChildInvites')
    .doc(inviteCode.toUpperCase())
    .get();

  if (!inviteSnap.exists) {
    return NextResponse.json({ error: 'Invite code not found or already used.' }, { status: 404 });
  }

  const invite = inviteSnap.data()!;

  if (invite.status !== 'pending') {
    return NextResponse.json({ error: 'This invite has already been used.' }, { status: 409 });
  }

  if (new Date() > new Date(invite.expiresAt)) {
    await inviteSnap.ref.delete();
    return NextResponse.json(
      { error: 'This invite link has expired. Ask your parent to generate a new one.' },
      { status: 410 }
    );
  }

  const parentUid: string = invite.parentUid;

  // ── Prevent self-linking ───────────────────────────────────────────────────
  if (childUid === parentUid) {
    return NextResponse.json({ error: 'You cannot link to your own account.' }, { status: 400 });
  }

  // ── Check child not already linked ────────────────────────────────────────
  const childSnap = await db.collection('users').doc(childUid).get();
  const childData = childSnap.data() || {};

  if (childData.parentLinked) {
    return NextResponse.json(
      { error: 'Your account is already linked to a parent.' },
      { status: 409 }
    );
  }

  // ── Ensure parent user doc exists ─────────────────────────────────────────
  const parentSnap = await db.collection('users').doc(parentUid).get();
  if (!parentSnap.exists) {
    await db.collection('users').doc(parentUid).set({
      uid: parentUid,
      email: invite.parentEmail || '',
      displayName: invite.parentName || '',
      isParent: true,
      role: 'parent',
      linkedChildren: [],
      setupComplete: false,
      createdAt: new Date().toISOString(),
    });
  }

  const parentData = (await db.collection('users').doc(parentUid).get()).data() || {};

  // ── Atomic batch: link both sides ─────────────────────────────────────────
  const batch = db.batch();
  const now = new Date().toISOString();

  // Update child doc
  batch.update(db.collection('users').doc(childUid), {
    parentLinked: true,
    parentUid,
    parentEmail: invite.parentEmail || '',
    parentLinkedAt: now,
  });

  // Update parent doc — add child to linkedChildren array
  const existingChildren: string[] = parentData.linkedChildren || [];
  batch.update(db.collection('users').doc(parentUid), {
    isParent: true,
    linkedChildren: existingChildren.includes(childUid)
      ? existingChildren
      : [...existingChildren, childUid],
    setupComplete: true,
    parentLinkedAt: now,
  });

  // Create link record
  const linkRef = db.collection('linkRequests').doc(`${childUid}_${parentUid}`);
  batch.set(linkRef, {
    parentUid,
    childUid,
    parentEmail: invite.parentEmail || '',
    childEmail: childEmail || childData.email || '',
    status: 'accepted',
    direction: 'parent-initiated',
    createdAt: now,
  });

  // Mark invite as used
  batch.update(inviteSnap.ref, {
    status: 'accepted',
    acceptedAt: now,
    acceptedByUid: childUid,
  });

  await batch.commit();

  return NextResponse.json({
    ok: true,
    parentName: invite.parentName || parentData.displayName || 'your parent',
    parentUid,
  });
}
