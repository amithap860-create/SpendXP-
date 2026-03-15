import { NextRequest, NextResponse } from 'next/server';

/**
 * @fileOverview Middleware wrapper for API route security.
 */

export function withSecurity(
  handler: (req: NextRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    // 1. Content-Type Check
    if (req.method === 'POST') {
      const contentType = req.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 });
      }
    }

    // 2. Origin/CSRF Check
    const origin = req.headers.get('origin');
    const host = req.headers.get('host');
    if (origin && host && !origin.includes(host)) {
      return NextResponse.json({ error: 'Forbidden Origin' }, { status: 403 });
    }

    // 3. Body Size Limit (10KB)
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > 10240) {
      return NextResponse.json({ error: 'Request Entity Too Large' }, { status: 413 });
    }

    const response = await handler(req);

    // 4. Add Security Headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Pragma', 'no-cache');

    return response;
  };
}
