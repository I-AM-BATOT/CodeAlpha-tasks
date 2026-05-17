const db = require('../config/db');

exports.toggleFollow = async (req, res, next) => {
  try {
    const followingId = parseInt(req.params.userId);
    const followerId  = req.user.id;

    if (followerId === followingId)
      return res.status(400).json({ message: "You can't follow yourself." });

    const [existing] = await db.query(
      'SELECT id FROM followers WHERE follower_id = ? AND following_id = ?',
      [followerId, followingId]);

    if (existing.length) {
      await db.query(
        'DELETE FROM followers WHERE follower_id = ? AND following_id = ?',
        [followerId, followingId]);
    } else {
      await db.query(
        'INSERT INTO followers (follower_id, following_id) VALUES (?, ?)',
        [followerId, followingId]);
    }

    const [fc] = await db.query(
      'SELECT COUNT(*) AS cnt FROM followers WHERE following_id = ?', [followingId]);
    res.json({ following: !existing.length, followers_count: fc[0].cnt });
  } catch (err) { next(err); }
};

exports.followStatus = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id FROM followers WHERE follower_id = ? AND following_id = ?',
      [req.user.id, req.params.userId]);
    res.json({ following: rows.length > 0 });
  } catch (err) { next(err); }
};