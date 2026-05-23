const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');

const createNotification = async (user_id, type, title, body, metadata = null) => {
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO notifications (id, user_id, type, title, body, metadata) VALUES (?, ?, ?, ?, ?, ?)',
    [id, user_id, type, title, body || null, metadata ? JSON.stringify(metadata) : null]
  );
  const [rows] = await pool.execute('SELECT * FROM notifications WHERE id = ?', [id]);
  return rows[0];
};

const getUserNotifications = async (userId, limit = 30) => {
  const [rows] = await pool.execute(
    'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
    [userId, limit]
  );
  return rows;
};

const markAsRead = async (notificationId, userId) => {
  await pool.execute(
    'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
    [notificationId, userId]
  );
};

const markAllAsRead = async (userId) => {
  await pool.execute('UPDATE notifications SET is_read = TRUE WHERE user_id = ?', [userId]);
};

const getUnreadCount = async (userId) => {
  const [rows] = await pool.execute(
    'SELECT COUNT(*) AS cnt FROM notifications WHERE user_id = ? AND is_read = FALSE',
    [userId]
  );
  return rows[0].cnt;
};

module.exports = { createNotification, getUserNotifications, markAsRead, markAllAsRead, getUnreadCount };
