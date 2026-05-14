import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

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

  const { inviteCode } = await req.json();
  if (!inviteCode || typeof inviteCode !== 'string') {
    return NextResponse.json({ error: 'Invite code is required.' }, { status: 400 });
  }

  const { db } = await getFirebaseAdmin();

  // ── Fetch invite ───────────────────────────────────────────────────────────
  const inviteSnap = await db.collection('pendingParentInvites').doc(inviteCode.toUpperCase()).get();

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
  batch.update(inviteSnap.ref, { status: 'accepted', acceptedAt: now, acceptedByUid: parentUid });

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
  const code = req.nextUrl.searchParams.get('code');
  if (!code || code.trim().length < 4) {
    return NextResponse.json({ error: 'Invalid code.' }, { status: 400 });
  }

  const { db } = await getFirebaseAdmin();
  const inviteSnap = await db.collection('pendingParentInvites').doc(code.toUpperCase()).get();

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
    childEmail: invite.childEmail,
    expiresAt: invite.expiresAt,
    inviteCode: invite.inviteCode,
  });
}
