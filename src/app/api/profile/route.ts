import { NextRequest } from 'next/server';
import AuthController from '@/controllers/authController';

// Simple middleware to extract user from token
function extractUser(request: NextRequest): any {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const [id, email] = decoded.split(':');
      return { id: parseInt(id), email };
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  const user = extractUser(request);
  if (!user) {
    return Response.json(
      { error: 'No token provided' },
      { status: 401 }
    );
  }

  // Attach user to request
  (request as any).user = user;

  // User is authenticated, proceed to get profile
  return await AuthController.getProfile(request as any);
}
