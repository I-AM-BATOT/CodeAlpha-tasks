const db = require('../config/db');

const postQuery = (where, extra = '') =>
  `SELECT p.id, p.content, p.image, p.created_at,
     u.id AS user_id, u.username, u.profile_pic,
     (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS likes_count,
     (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comments_count
   FROM posts p JOIN users u ON p.user_id = u.id
   ${where} ORDER BY p.created_at DESC ${extra}`;

// GET /api/posts  – all posts (feed)
exports.getFeed = async (req, res, next) => {
  try {
    const uid = req.user.id;
    // Attach whether current user liked each post
    const [rows] = await db.query(
      `${postQuery('')}`,  []);
    const [liked] = await db.query(
      'SELECT post_id FROM likes WHERE user_id = ?', [uid]);
    const likedSet = new Set(liked.map(l => l.post_id));
    res.json(rows.map(p => ({ ...p, liked_by_me: likedSet.has(p.id) })));
  } catch (err) { next(err); }
};

// GET /api/posts/following  – posts from followed users
exports.getFollowingFeed = async (req, res, next) => {
  try {
    const uid = req.user.id;
    const [rows] = await db.query(
      postQuery(`WHERE p.user_id IN (SELECT following_id FROM followers WHERE follower_id = ${uid})`));
    const [liked] = await db.query('SELECT post_id FROM likes WHERE user_id = ?', [uid]);
    const likedSet = new Set(liked.map(l => l.post_id));
    res.json(rows.map(p => ({ ...p, liked_by_me: likedSet.has(p.id) })));
  } catch (err) { next(err); }
};

// GET /api/posts/user/:userId
exports.getUserPosts = async (req, res, next) => {
  try {
    const [rows] = await db.query(postQuery(`WHERE p.user_id = ?`), [req.params.userId]);
    const [liked] = await db.query('SELECT post_id FROM likes WHERE user_id = ?', [req.user.id]);
    const likedSet = new Set(liked.map(l => l.post_id));
    res.json(rows.map(p => ({ ...p, liked_by_me: likedSet.has(p.id) })));
  } catch (err) { next(err); }
};

// POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required.' });
    const image = req.file ? `/uploads/posts/${req.file.filename}` : null;
    const [result] = await db.query(
      'INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)',
      [req.user.id, content, image]);
    const [rows] = await db.query(postQuery('WHERE p.id = ?'), [result.insertId]);
    res.status(201).json({ ...rows[0], liked_by_me: false });
  } catch (err) { next(err); }
};

// PUT /api/posts/:id
exports.updatePost = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Post not found.' });
    if (rows[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden.' });
    const { content } = req.body;
    await db.query('UPDATE posts SET content = ? WHERE id = ?', [content, req.params.id]);
    const [updated] = await db.query(postQuery('WHERE p.id = ?'), [req.params.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Post not found.' });
    if (rows[0].user_id !== req.user.id)
      return res.status(403).json({ message: 'Forbidden.' });
    await db.query('DELETE FROM posts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Post deleted.' });
  } catch (err) { next(err); }
};