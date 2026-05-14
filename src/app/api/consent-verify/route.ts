import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { emailService } from '@/lib/email';

/**
 * POST /api/consent-verify
 *
 * Called when a parent clicks "Approve Account" in the consent email.
 * Validates the token, creates the Firebase Auth account + Firestore user doc,
 * marks consent as given, cleans up the pendingConsent record.
 *
 * Body: { token }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    if (!token || typeof token !== 'string' || token.length < 32) {
      return NextResponse.json({ error: 'Invalid or missing token.' }, { status: 400 });
    }

    const { auth, db } = await getFirebaseAdmin();

    // ── Fetch pending consent doc ──────────────────────────────────────────
    const pendingRef = db.collection('pendingConsent').doc(token);
    const pendingSnap = await pendingRef.get();

    if (!pendingSnap.exists) {
      return NextResponse.json(
        { error: 'This approval link is invalid or has already been used.' },
        { status: 404 }
      );
    }

    const pending = pendingSnap.data()!;

    // ── Check not already approved ─────────────────────────────────────────
    if (pending.status === 'approved') {
      return NextResponse.json(
        { error: 'This account has already been approved. The child can now sign in.' },
        { status: 409 }
      );
    }

    // ── Check expiry ───────────────────────────────────────────────────────
    if (new Date() > new Date(pending.expiresAt)) {
      await pendingRef.delete();
      return NextResponse.json(
        { error: 'This approval link has expired. Please ask your child to sign up again.' },
        { status: 410 }
      );
    }

    const now = new Date().toISOString();

    // ── Handle existing account (edge case from /consent page) ────────────
    if (pending.existingUid) {
      await db.collection('users').doc(pending.existingUid).update({
        consentGiven: true,
        consentedAt: now,
        parentEmail: pending.parentEmail,
        coppaConsented: true,
        coppaConsentedAt: now,
      });
      await pendingRef.delete();

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';
      await emailService.sendAccountReady({
        childEmail: pending.email,
        childName: pending.displayName,
        loginUrl: `${appUrl}/login`,
      });

      return NextResponse.json({ ok: true, email: pending.email });
    }

    // ── Check email not already registered (race condition guard) ──────────
    try {
      await auth.getUserByEmail(pending.email);
      // Account already exists — clean up pending doc and return ok
      await pendingRef.delete();
      return NextResponse.json({ ok: true, email: pending.email });
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') throw e;
      // Good — email is available
    }

    // ── Create Firebase Auth account ───────────────────────────────────────
    const userRecord = await auth.createUser({
      email: pending.email,
      password: pending.password,
      displayName: pending.displayName,
      emailVerified: false,
    });

    const uid = userRecord.uid;

    // ── Create Firestore user document ─────────────────────────────────────
    await db.collection('users').doc(uid).set({
      uid,
      email: pending.email,
      displayName: pending.displayName,
      birthYear: pending.birthYear,
      isParent: false,
      role: 'child',
      ageGroup: 'tween', // under-13
      xp: 0,
      coins: 0,
      level: 1,
      streak: 0,
      consentGiven: true,
      consentedAt: now,
      parentEmail: pending.parentEmail,
      parentLinked: false,
      coppaConsented: true,
      coppaConsentedAt: now,
      createdAt: now,
      setupComplete: false,
    });

    // ── Mark pending doc as approved (then delete) ─────────────────────────
    await pendingRef.update({ status: 'approved', approvedAt: now });
    // Delete the pending record (including the stored password)
    await pendingRef.delete();

    // ── Notify child that account is ready ─────────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';
    await emailService.sendAccountReady({
      childEmail: pending.email,
      childName: pending.displayName,
      loginUrl: `${appUrl}/login`,
    });

    return NextResponse.json({ ok: true, email: pending.email });
  } catch (err) {
    console.error('[consent-verify] Error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

/**
 * GET /api/consent-verify?token=xxx
 *
 * Used by the parent verify page to fetch the pending consent details
 * so the parent knows whose account they're approving.
 */
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token || token.length < 32) {
      return NextResponse.json({ error: 'Invalid token.' }, { status: 400 });
    }

    const { db } = await getFirebaseAdmin();
    const pendingSnap = await db.collection('pendingConsent').doc(token).get();

    if (!pendingSnap.exists) {
      return NextResponse.json({ error: 'This link is invalid or has already been used.' }, { status: 404 });
    }

    const data = pendingSnap.data()!;

    if (new Date() > new Date(data.expiresAt)) {
      return NextResponse.json({ error: 'This approval link has expired.' }, { status: 410 });
    }

    if (data.status === 'approved') {
      return NextResponse.json({ error: 'This account has already been approved.' }, { status: 409 });
    }

    // Return only what the parent needs to see — never return the password
    return NextResponse.json({
      childName: data.displayName,
      childEmail: data.email,
      birthYear: data.birthYear,
      parentEmail: data.parentEmail,
      expiresAt: data.expiresAt,
    });
  } catch (err) {
    console.error('[consent-verify GET] Error:', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
