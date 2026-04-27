const { NextResponse } = require('next/server');
const HashUtils = require('../utils/hash');

class AuthMiddleware {
  // Extract token from Authorization header
  static extractToken(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    return null;
  }

  // Verify JWT token and attach user to request
  static async authenticate(request) {
    try {
      const token = this.extractToken(request);
      
      if (!token) {
        return NextResponse.json(
          { error: 'No token provided' },
          { status: 401 }
        );
      }

      const decoded = HashUtils.verifyToken(token);
      if (!decoded) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }

      // Attach user info to request
      request.user = decoded;
      return null; // Continue to next middleware
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }
  }
}

module.exports = AuthMiddleware;
