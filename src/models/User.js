const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Database connection
const dbPath = path.join(process.cwd(), 'data', 'users.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          age INTEGER NOT NULL,
          password TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
        } else {
          console.log('Users table initialized successfully');
          resolve();
        }
      });
    });
  });
};

// User model methods
class User {
  static async create(userData) {
    return new Promise((resolve, reject) => {
      const { email, age, password } = userData;
      
      // Hash password
      bcrypt.hash(password, 12, (err, hashedPassword) => {
        if (err) {
          reject(err);
          return;
        }

        const stmt = db.prepare(`
          INSERT INTO users (email, age, password) 
          VALUES (?, ?, ?)
        `);

        stmt.run([email, age, hashedPassword], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({
              id: this.lastID,
              email,
              age,
              createdAt: new Date().toISOString()
            });
          }
        });

        stmt.finalize();
      });
    });
  }

  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT * FROM users WHERE email = ?
      `, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT id, email, age, createdAt, updatedAt 
        FROM users WHERE id = ?
      `, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(plainPassword, hashedPassword, (err, isValid) => {
        if (err) {
          reject(err);
        } else {
          resolve(isValid);
        }
      });
    });
  }
}

module.exports = {
  User,
  initializeDatabase,
  db
};
