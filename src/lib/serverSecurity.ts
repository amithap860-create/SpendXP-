import 'server-only';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebaseAdmin';

/**
 * Server-side security helpers (added 2026-10-20 security pass).
 *
 * - requireUid():   verifies the Firebase ID token in "Authorization: Bearer …"
 * - rateLimit():    Firestore-backed fixed-window limiter. The old in-memory
 *                   limiter in lib/rateLimiting.ts does NOT work on Vercel —
 *                   every serverless instance has its own memory, so limits
 *                   reset constantly. This one is shared across instances.
 * - clientIp():     best-effort caller IP (Vercel sets x-forwarded-for).
 * - newInviteCode(): 12-char invite code from an unambiguous alphabet
 *                   (~59 bits; the old 6-hex code was ~24 bits = brute-forceable).
 *
 * The `rateLimits` collection has no match block in firestore.rules, so clients
 * can never read/write it — only the Admin SDK can.
 */

export async function requireUid(req: NextRequest): Promise<{ uid: string; email?: string; name?: string } | NextResponse> {
  const header = req.headers.get('authorization') || '';
  if (!header.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { auth } = getFirebaseAdmin();
    const decoded = await auth.verifyIdToken(header.slice(7));
    return { uid: decoded.uid, email: decoded.email, name: decoded.name };
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for') || '';
  return fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

/**
 * Returns null if allowed, or a 429 response if the limit is exceeded.
 * key: e.g. `chat:uid:${uid}` or `invite-lookup:ip:${ip}`.
 * Fails OPEN on Firestore errors so an outage doesn't take the app down —
 * but logs loudly.
 */
export async function rateLimit(key: string, max: number, windowSec: number): Promise<NextResponse | null> {
  try {
    const { db } = getFirebaseAdmin();
    const now = Date.now();
    const windowStart = Math.floor(now / (windowSec * 1000)) * windowSec * 1000;
    const id = crypto.createHash('sha256').update(`${key}|${windowStart}`).digest('hex').slice(0, 40);
    const ref = db.collection('rateLimits').doc(id);

    const count = await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const c = (snap.exists ? (snap.data()!.count as number) : 0) + 1;
      tx.set(ref, {
        count: c,
        // Set a Firestore TTL policy on rateLimits.expireAt (Console → Firestore → TTL)
        expireAt: new Date(windowStart + windowSec * 1000 * 2),
      });
      return c;
    });

    if (count > max) {
      const retryAfter = Math.ceil((windowStart + windowSec * 1000 - now) / 1000);
      return NextResponse.json(
        { error: 'Too many requests. Please slow down and try again shortly.' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      );
    }
    return null;
  } catch (err) {
    console.error('[rateLimit] limiter error (failing open):', key, err);
    return null;
  }
}

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I
export function newInviteCode(length = 12): string {
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

/** Valid shape for codes we issue (old 6-char codes still accepted until they expire). */
export function isPlausibleInviteCode(code: unknown): code is string {
  return typeof code === 'string' && /^[A-Z0-9]{6,16}$/.test(code.trim().toUpperCase());
}
