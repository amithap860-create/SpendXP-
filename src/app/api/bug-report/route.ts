import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

function initAdmin() {
  const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY || '{}');
  if (!serviceAccount.project_id) return null;
  const existing = getApps().find((a) => a.name === 'admin');
  if (existing) return existing;
  return initializeApp({ credential: cert(serviceAccount) }, 'admin');
}

export async function POST(request: NextRequest) {
  try {
    const adminApp = initAdmin();

    // ── Auth: try to identify the reporter (optional — still accept anon) ────
    let uid: string | null = null;
    if (adminApp) {
      const adminAuth = getAuth(adminApp);
      const authHeader = request.headers.get('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        try {
          const decoded = await adminAuth.verifyIdToken(authHeader.split(' ')[1]);
          uid = decoded.uid;
        } catch {
          // Invalid token — treat as anonymous
        }
      }
    }

    // ── Parse + sanitise body ────────────────────────────────────────────────
    const body = await request.json();
    const title = String(body.title || '').trim().slice(0, 200);
    const description = String(body.description || '').trim().slice(0, 2000);
    const email = String(body.email || '').trim().slice(0, 200);

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // ── Persist to Firestore ─────────────────────────────────────────────────
    const reportId = crypto.randomUUID();
    if (adminApp) {
      const db = getFirestore(adminApp);
      await db.collection('bugReports').doc(reportId).set({
        title,
        description,
        email: email || null,
        uid: uid || null,
        userAgent: request.headers.get('user-agent') || null,
        // IP address deliberately NOT stored — PII with no explicit user consent
        createdAt: FieldValue.serverTimestamp(),
        status: 'open',
      });
    } else {
      // Admin SDK not configured (missing env var) — log title only, no PII
      console.error('[BugReport] Admin SDK not available. Report title:', title);
    }

    return NextResponse.json({
      success: true,
      message: 'Bug report received. Thank you for helping improve SpendXP!',
      id: reportId,
    });
  } catch (error) {
    console.error('[BugReport] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
