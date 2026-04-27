import { NextRequest } from 'next/server';
import AuthController from '@/controllers/authController';

export async function POST(request: NextRequest) {
  return await AuthController.login(request);
}

export async function GET() {
  return Response.json({
    message: 'Login endpoint - POST required',
    fields: ['email', 'password']
  }, { status: 200 });
}
