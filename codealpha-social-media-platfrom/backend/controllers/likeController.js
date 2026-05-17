
// ── Save as: backend/controllers/likeController.js ──
const db = require('../config/db');

exports.toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const uid = req.user.id;
    const [existing] = await db.query(
      'SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [uid, postId]);
    if (existing.length) {
      await db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [uid, postId]);
    } else {
      await db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [uid, postId]);
    }
    const [count] = await db.query(
      'SELECT COUNT(*) AS likes_count FROM likes WHERE post_id = ?', [postId]);
    res.json({ liked: !existing.length, likes_count: count[0].likes_count });
  } catch (err) { next(err); }
};
