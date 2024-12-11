import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';

export class AuthService {
  static async validateUser(username, password) {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !await bcrypt.compare(password, user.password)) {
      return null;
    }

    return user;
  }

  static generateToken(user) {
    return jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-super-secret-key-change-this-in-production',
      { expiresIn: '24h' }
    );
  }

  static async getUserById(id) {
    const result = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }
}