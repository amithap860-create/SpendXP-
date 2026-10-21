import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { emailService } from '@/lib/email';
import crypto from 'crypto';
import { requireUid, rateLimit } from '@/lib/serverSecurity';

export const dynamic = 'force-dynamic';

/**
 * POST /api/consent-email
 *
 * Used by /consent page for users who already have a Firebase Auth account
 * (edge case: account created before COPPA gate was added) but haven't yet
 * received parental consent.
 *
 * Generates a consent token pointing to the existing uid and sends the
 * parental consent email.
 *
 * Body: { uid: string, parentEmail: string }
 */
export async function POST(req: NextRequest) {
  try {
    // SECURITY (2026-10-20): previously took `uid` from the request body with
    // no auth — anyone could pull a uid off the public leaderboard, enter their
    // own address as "parent", receive the child's name + email, and overwrite
    // the child's parentEmail/consent. The uid now comes ONLY from the verified
    // ID token, so you can only request consent for your own account.
    const authed = await requireUid(req);
    if (authed instanceof NextResponse) return authed;
    const uid = authed.uid;

    const limited = await rateLimit(`consent-email:${uid}`, 3, 86400);
    if (limited) return limited;

    const { parentEmail } = await req.json().catch(() => ({} as any));

    if (!parentEmail || typeof parentEmail !== 'string' || !parentEmail.includes('@')) {
      return NextResponse.json({ error: 'Invalid parent email.' }, { status: 400 });
    }

    const { db, auth } = await getFirebaseAdmin();

    // Fetch child user info
    const userRecord = await auth.getUser(uid);
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    if (!userRecord || !userDoc.exists) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // Consent already recorded — don't let it be re-pointed at a different "parent".
    if (userData?.coppaConsented === true || userData?.consentGiven === true) {
      return NextResponse.json({ error: 'Parental consent is already on file for this account.' }, { status: 409 });
    }

    const childEmail = userRecord.email || '';
    const childName = userRecord.displayName || userData?.displayName || 'your child';

    if (childEmail.toLowerCase() === parentEmail.toLowerCase()) {
      return NextResponse.json({ error: 'Parent email must be different from child email.' }, { status: 400 });
    }

    // Generate a consent token for this existing uid
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    // Store minimal pending record (uid-linked, no password needed since account exists)
    await db.collection('pendingConsent').doc(token).set({
      token,
      existingUid: uid, // account already exists — just needs consent flag set
      displayName: childName,
      email: childEmail,
      parentEmail: parentEmail.toLowerCase(),
      requestedAt: new Date().toISOString(),
      expiresAt,
      status: 'pending',
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';
    const approveUrl = `${appUrl}/consent/verify?token=${token}`;

    await emailService.sendParentalConsentRequest({
      parentEmail: parentEmail.toLowerCase(),
      childName,
      childEmail,
      approveUrl,
      expiresInHours: 48,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[consent-email] Error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
