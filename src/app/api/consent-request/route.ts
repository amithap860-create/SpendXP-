import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';
import { emailService } from '@/lib/email';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/consent-request
 *
 * COPPA compliant — called when an under-13 user signs up.
 * Does NOT create a Firebase Auth account yet.
 * Instead:
 *   1. Validates fields
 *   2. Checks the email isn't already registered
 *   3. Generates a secure 48-hour token
 *   4. Stores pending signup data in Firestore pendingConsent/{token}
 *   5. Sends parental consent email with approval link
 *
 * Body: { displayName, email, password, birthYear, parentEmail }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { displayName, email, password, birthYear, parentEmail } = body;

    // ── Validate inputs ────────────────────────────────────────────────────
    if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 1) {
      return NextResponse.json({ error: 'Display name is required.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    if (!birthYear || typeof birthYear !== 'number' || birthYear < 1900 || birthYear > new Date().getFullYear() - 4) {
      return NextResponse.json({ error: 'Invalid birth year.' }, { status: 400 });
    }
    if (!parentEmail || typeof parentEmail !== 'string' || !parentEmail.includes('@')) {
      return NextResponse.json({ error: "A valid parent email address is required." }, { status: 400 });
    }
    if (email.toLowerCase() === parentEmail.toLowerCase()) {
      return NextResponse.json({ error: "Parent email must be different from child email." }, { status: 400 });
    }

    // Confirm this is actually an under-13 request
    const age = new Date().getFullYear() - birthYear;
    if (age >= 13) {
      return NextResponse.json({ error: 'This endpoint is only for users under 13.' }, { status: 400 });
    }

    const { auth, db } = await getFirebaseAdmin();

    // ── Check email not already in use ─────────────────────────────────────
    try {
      await auth.getUserByEmail(email.toLowerCase());
      // If we get here, the email is already registered
      return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
    } catch (e: any) {
      // auth/user-not-found is expected — means email is available
      if (e.code !== 'auth/user-not-found') {
        throw e;
      }
    }

    // ── Generate secure token ──────────────────────────────────────────────
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    // ── Store pending consent record ───────────────────────────────────────
    // Note: password is stored temporarily (48hr TTL) solely to enable account
    // creation upon parent approval. Firestore data is encrypted at rest by Google.
    await db.collection('pendingConsent').doc(token).set({
      token,
      displayName: displayName.trim(),
      email: email.toLowerCase(),
      password, // temporary — deleted upon approval or expiry
      birthYear,
      parentEmail: parentEmail.toLowerCase(),
      requestedAt: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
    });

    // ── Send parental consent email ────────────────────────────────────────
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://spendxp.vercel.app';
    const approveUrl = `${appUrl}/consent/verify?token=${token}`;

    await emailService.sendParentalConsentRequest({
      parentEmail: parentEmail.toLowerCase(),
      childName: displayName.trim(),
      childEmail: email.toLowerCase(),
      approveUrl,
      expiresInHours: 48,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[consent-request] Error:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
