const db = require('../config/db');

// GET /api/users/:id
exports.getProfile = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.username, u.email, u.bio, u.profile_pic, u.created_at,
        (SELECT COUNT(*) FROM followers WHERE following_id = u.id) AS followers_count,
        (SELECT COUNT(*) FROM followers WHERE follower_id  = u.id) AS following_count
       FROM users u WHERE u.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'User not found.' });
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { bio, username } = req.body;
    const profile_pic = req.file ? `/uploads/avatars/${req.file.filename}` : undefined;

    const fields = [];
    const vals   = [];
    if (username)    { fields.push('username = ?');    vals.push(username); }
    if (bio !== undefined) { fields.push('bio = ?');   vals.push(bio); }
    if (profile_pic) { fields.push('profile_pic = ?'); vals.push(profile_pic); }

    if (!fields.length) return res.status(400).json({ message: 'Nothing to update.' });

    vals.push(req.user.id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, vals);

    const [rows] = await db.query(
      'SELECT id, username, email, bio, profile_pic FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (err) { next(err); }
};

// GET /api/users/search?q=
exports.searchUsers = async (req, res, next) => {
  try {
    const q = `%${req.query.q || ''}%`;
    const [rows] = await db.query(
      'SELECT id, username, bio, profile_pic FROM users WHERE username LIKE ? OR bio LIKE ? LIMIT 20',
      [q, q]);
    res.json(rows);
  } catch (err) { next(err); }
};