const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
require('dotenv').config();

const signToken = (user) =>
  jwt.sign({ id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, bio } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: 'Username, email and password are required.' });

    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existing.length)
      return res.status(409).json({ message: 'Email or username already taken.' });

    const hashed = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (username, email, password, bio) VALUES (?, ?, ?, ?)',
      [username, email, hashed, bio || null]);

    const user = { id: result.insertId, username, email };
    res.status(201).json({ token: signToken(user), user });
  } catch (err) { next(err); }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (!rows.length)
      return res.status(401).json({ message: 'Invalid credentials.' });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials.' });

    delete user.password;
    res.json({ token: signToken(user), user });
  } catch (err) { next(err); }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, username, email, bio, profile_pic, created_at FROM users WHERE id = ?',
      [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};