import { NextResponse } from 'next/server';

// DISABLED (2026-10-20 security pass): this was a leftover prototype auth
// system (in-memory users, forgeable base64 "tokens"). Real auth is Firebase
// Auth; nothing in the app calls this. Safe to delete this folder.
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ error: 'This endpoint has been removed.' }, { status: 410 });
}
export async function POST() {
  return NextResponse.json({ error: 'This endpoint has been removed.' }, { status: 410 });
}
