const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');

// ─── Messages ────────────────────────────────────────────────────────────────
const saveMessage = async ({ meeting_id, sender_id, content, type = 'text' }) => {
  const id = uuidv4();
  await pool.execute(
    'INSERT INTO messages (id, meeting_id, sender_id, content, type) VALUES (?, ?, ?, ?, ?)',
    [id, meeting_id, sender_id, content, type]
  );

  const [rows] = await pool.execute(
    `SELECT m.*, u.display_name AS sender_name, u.avatar_url AS sender_avatar, u.username AS sender_username
     FROM messages m JOIN users u ON m.sender_id = u.id WHERE m.id = ?`,
    [id]
  );
  return rows[0];
};

const getMessages = async (meeting_id, limit = 100, offset = 0) => {
  const [rows] = await pool.execute(
    `SELECT m.*, u.display_name AS sender_name, u.avatar_url AS sender_avatar, u.username AS sender_username
     FROM messages m JOIN users u ON m.sender_id = u.id
     WHERE m.meeting_id = ? AND m.is_deleted = FALSE
     ORDER BY m.created_at ASC LIMIT ? OFFSET ?`,
    [meeting_id, limit, offset]
  );
  return rows;
};

const deleteMessage = async (messageId, userId) => {
  const [rows] = await pool.execute('SELECT sender_id FROM messages WHERE id = ?', [messageId]);
  if (!rows.length) throw Object.assign(new Error('Message not found'), { status: 404 });
  if (rows[0].sender_id !== userId) throw Object.assign(new Error('Not your message'), { status: 403 });
  await pool.execute('UPDATE messages SET is_deleted = TRUE WHERE id = ?', [messageId]);
};

// ─── Files ───────────────────────────────────────────────────────────────────
const saveFileRecord = async ({ meeting_id, uploader_id, originalname, filename, mimetype, size }) => {
  const id = uuidv4();
  const filePath = path.join(process.env.UPLOAD_DIR || 'uploads', filename);

  await pool.execute(
    `INSERT INTO shared_files (id, meeting_id, uploader_id, original_name, stored_name, file_path, mime_type, file_size)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, meeting_id, uploader_id, originalname, filename, filePath, mimetype, size]
  );

  const [rows] = await pool.execute(
    `SELECT f.*, u.display_name AS uploader_name FROM shared_files f
     JOIN users u ON f.uploader_id = u.id WHERE f.id = ?`,
    [id]
  );
  return rows[0];
};

const getMeetingFiles = async (meeting_id) => {
  const [rows] = await pool.execute(
    `SELECT f.*, u.display_name AS uploader_name FROM shared_files f
     JOIN users u ON f.uploader_id = u.id
     WHERE f.meeting_id = ? ORDER BY f.created_at DESC`,
    [meeting_id]
  );
  return rows;
};

const getFileById = async (fileId) => {
  const [rows] = await pool.execute('SELECT * FROM shared_files WHERE id = ?', [fileId]);
  if (!rows.length) throw Object.assign(new Error('File not found'), { status: 404 });
  return rows[0];
};

const incrementDownload = async (fileId) => {
  await pool.execute('UPDATE shared_files SET download_count = download_count + 1 WHERE id = ?', [fileId]);
};

// ─── Whiteboard ───────────────────────────────────────────────────────────────
const getWhiteboardData = async (meeting_id) => {
  const [rows] = await pool.execute('SELECT * FROM whiteboard_data WHERE meeting_id = ?', [meeting_id]);
  return rows[0] || null;
};

const saveWhiteboardData = async (meeting_id, canvas_data, user_id) => {
  const [existing] = await pool.execute('SELECT id FROM whiteboard_data WHERE meeting_id = ?', [meeting_id]);
  if (existing.length) {
    await pool.execute(
      'UPDATE whiteboard_data SET canvas_data = ?, last_updated_by = ? WHERE meeting_id = ?',
      [canvas_data, user_id, meeting_id]
    );
  } else {
    await pool.execute(
      'INSERT INTO whiteboard_data (id, meeting_id, canvas_data, last_updated_by) VALUES (?, ?, ?, ?)',
      [uuidv4(), meeting_id, canvas_data, user_id]
    );
  }
};

const clearWhiteboard = async (meeting_id) => {
  await pool.execute('UPDATE whiteboard_data SET canvas_data = NULL WHERE meeting_id = ?', [meeting_id]);
};

module.exports = {
  saveMessage, getMessages, deleteMessage,
  saveFileRecord, getMeetingFiles, getFileById, incrementDownload,
  getWhiteboardData, saveWhiteboardData, clearWhiteboard,
};
