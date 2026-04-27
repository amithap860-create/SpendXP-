import { NextRequest } from 'next/server';
import AuthController from '@/controllers/authController';

export async function POST(request: NextRequest) {
  return await AuthController.signup(request);
}

export async function GET() {
  return Response.json({
    message: 'Signup endpoint - POST required',
    fields: ['email', 'age', 'password', 'confirmPassword']
  }, { status: 200 });
}
