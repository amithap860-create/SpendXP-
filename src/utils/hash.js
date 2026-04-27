const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class HashUtils {
  // Hash password using bcrypt
  static async hashPassword(password) {
    return new Promise((resolve, reject) => {
      bcrypt.hash(password, 12, (err, hash) => {
        if (err) {
          reject(err);
        } else {
          resolve(hash);
        }
      });
    });
  }

  // Compare password using bcrypt
  static async comparePassword(password, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, hash, (err, isValid) => {
        if (err) {
          reject(err);
        } else {
          resolve(isValid);
        }
      });
    });
  }

  // Generate JWT token
  static generateToken(payload) {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    return jwt.sign(payload, secret, { expiresIn: '7d' });
  }

  // Verify JWT token
  static verifyToken(token) {
    const secret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      return null;
    }
  }
}

module.exports = HashUtils;
