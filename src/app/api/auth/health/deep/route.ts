import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const checks: Record<string, { status: string; message: string }> = {};

    try {
      const testDoc = doc(db, 'health', 'test');
      await setDoc(testDoc, { test: true, timestamp: serverTimestamp() });
      const verifyDoc = await getDoc(testDoc);
      checks.database = verifyDoc.exists()
        ? { status: 'pass', message: 'Database connection successful' }
        : { status: 'fail', message: 'Database write/read test failed' };
    } catch (err: unknown) {
      checks.database = { status: 'fail', message: `Database error: ${err instanceof Error ? err.message : String(err)}` };
    }

    const failedCount = Object.values(checks).filter(c => c.status === 'fail').length;

    return NextResponse.json(
      {
        timestamp: new Date().toISOString(),
        status: failedCount === 0 ? 'OK' : 'DEGRADED',
        summary: failedCount === 0 ? 'All systems operational' : `${failedCount} system(s) failing`,
        checks,
      },
      { status: 200, headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' } }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { status: 'ERROR', timestamp: new Date().toISOString(), error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
