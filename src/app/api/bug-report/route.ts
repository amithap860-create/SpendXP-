import { NextResponse } from 'next/server';

// DELETED (2026-09-21): this route wrote bug reports with a different
// Firestore schema (title/description/email, status:'open') than the one
// the live app actually uses (BugReportButton.tsx writes description/
// screen/screenshot/userEmail, status:'new' — read by /admin/bug-reports).
// Nothing in the app calls this route anymore. Left as a 410 rather than
// removed outright because this tooling can edit files but not delete them
// — safe to delete this whole api/bug-report folder from File Explorer.
export async function POST() {
  return NextResponse.json({ error: 'This endpoint has been removed.' }, { status: 410 });
}
