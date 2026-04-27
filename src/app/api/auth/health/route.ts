import { NextResponse } from 'next/server';

export async function GET() {
  // Immediate response - no database calls, no async operations
  return NextResponse.json({
    status: "OK",
    service: "auth",
    timestamp: new Date().toISOString()
  }, { status: 200 });
}
