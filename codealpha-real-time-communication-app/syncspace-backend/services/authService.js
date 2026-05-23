const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const register = async ({ username, email, password, display_name }) => {
  const [existing] = await pool.execute(
    'SELECT id FROM users WHERE email = ? OR username = ?',
    [email, username]
  );
  if (existing.length) {
    throw Object.assign(new Error('Email or username already in use'), { status: 409 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const id = uuidv4();

  await pool.execute(
    'INSERT INTO users (id, username, email, password, display_name) VALUES (?, ?, ?, ?, ?)',
    [id, username, email, hashed, display_name || username]
  );

  const [rows] = await pool.execute(
    'SELECT id, username, email, display_name, avatar_url, role FROM users WHERE id = ?',
    [id]
  );

  const user = rows[0];
  return { user, token: generateToken(user) };
};

const login = async ({ email, password }) => {
  const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
  if (!rows.length) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  const user = rows[0];
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Object.assign(new Error('Invalid credentials'), { status: 401 });
  }

  await pool.execute('UPDATE users SET is_online = TRUE, last_seen = NOW() WHERE id = ?', [user.id]);

  const { password: _, ...safeUser } = user;
  return { user: safeUser, token: generateToken(safeUser) };
};

const logout = async (userId) => {
  await pool.execute('UPDATE users SET is_online = FALSE, last_seen = NOW() WHERE id = ?', [userId]);
};

const getProfile = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT id, username, email, display_name, avatar_url, role, is_online, last_seen, created_at FROM users WHERE id = ?',
    [userId]
  );
  if (!rows.length) throw Object.assign(new Error('User not found'), { status: 404 });
  return rows[0];
};

const updateProfile = async (userId, { display_name, avatar_url }) => {
  await pool.execute(
    'UPDATE users SET display_name = COALESCE(?, display_name), avatar_url = COALESCE(?, avatar_url) WHERE id = ?',
    [display_name || null, avatar_url || null, userId]
  );
  return getProfile(userId);
};

const changePassword = async (userId, { current_password, new_password }) => {
  const [rows] = await pool.execute('SELECT password FROM users WHERE id = ?', [userId]);
  if (!rows.length) throw Object.assign(new Error('User not found'), { status: 404 });

  const match = await bcrypt.compare(current_password, rows[0].password);
  if (!match) throw Object.assign(new Error('Current password incorrect'), { status: 401 });

  const hashed = await bcrypt.hash(new_password, 12);
  await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, userId]);
};

module.exports = { register, login, logout, getProfile, updateProfile, changePassword };
