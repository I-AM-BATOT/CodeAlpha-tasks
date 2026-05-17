const db = require('../config/db');

// GET /api/comments/:postId
exports.getComments = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.content, c.created_at,
         u.id AS user_id, u.username, u.profile_pic
       FROM comments c JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ? ORDER BY c.created_at ASC`,
      [req.params.postId]);
    res.json(rows);
  } catch (err) { next(err); }
};

// POST /api/comments/:postId
exports.addComment = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Comment text is required.' });
    const [result] = await db.query(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.postId, req.user.id, content]);
    const [rows] = await db.query(
      `SELECT c.id, c.content, c.created_at,
         u.id AS user_id, u.username, u.profile_pic
       FROM comments c JOIN users u ON c.user_id = u.id WHERE c.id = ?`,
      [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
};

// DELETE /api/comments/:id
exports.deleteComment = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM comments WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Comment not found.' });
    if (rows[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden.' });
    await db.query('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Comment deleted.' });
  } catch (err) { next(err); }
};