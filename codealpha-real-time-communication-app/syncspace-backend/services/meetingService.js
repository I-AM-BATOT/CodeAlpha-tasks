const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');

const generateRoomId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 10; i++) {
    if (i === 3 || i === 7) id += '-';
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id; // e.g. ABC-1234-XY
};

const createMeeting = async (hostId, { title, description, password, max_participants, scheduled_at }) => {
  const id = uuidv4();
  const room_id = generateRoomId();
  const hashedPwd = password ? await bcrypt.hash(password, 10) : null;

  await pool.execute(
    `INSERT INTO meetings (id, room_id, title, description, host_id, password, max_participants, scheduled_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, room_id, title, description || null, hostId, hashedPwd, max_participants || 50, scheduled_at || null]
  );

  // Add host as participant
  await pool.execute(
    'INSERT INTO participants (id, meeting_id, user_id, role) VALUES (?, ?, ?, ?)',
    [uuidv4(), id, hostId, 'host']
  );

  return getMeetingById(id);
};

const getMeetingById = async (id) => {
  const [rows] = await pool.execute(
    `SELECT m.*, u.display_name AS host_name, u.avatar_url AS host_avatar
     FROM meetings m JOIN users u ON m.host_id = u.id WHERE m.id = ?`,
    [id]
  );
  if (!rows.length) throw Object.assign(new Error('Meeting not found'), { status: 404 });
  const m = rows[0];
  m.has_password = !!m.password;
  delete m.password;
  return m;
};

const getMeetingByRoomId = async (room_id) => {
  const [rows] = await pool.execute(
    `SELECT m.*, u.display_name AS host_name FROM meetings m
     JOIN users u ON m.host_id = u.id WHERE m.room_id = ?`,
    [room_id]
  );
  if (!rows.length) throw Object.assign(new Error('Meeting not found'), { status: 404 });
  const m = rows[0];
  m.has_password = !!m.password;
  delete m.password;
  return m;
};

const joinMeeting = async (userId, room_id, password) => {
  const [rows] = await pool.execute('SELECT * FROM meetings WHERE room_id = ?', [room_id]);
  if (!rows.length) throw Object.assign(new Error('Meeting not found'), { status: 404 });

  const meeting = rows[0];
  if (!meeting.is_active) throw Object.assign(new Error('Meeting has ended'), { status: 410 });

  if (meeting.password) {
    if (!password) throw Object.assign(new Error('Password required'), { status: 401 });
    const match = await bcrypt.compare(password, meeting.password);
    if (!match) throw Object.assign(new Error('Incorrect meeting password'), { status: 401 });
  }

  // Count current participants
  const [countRows] = await pool.execute(
    "SELECT COUNT(*) AS cnt FROM participants WHERE meeting_id = ? AND left_at IS NULL",
    [meeting.id]
  );
  if (countRows[0].cnt >= meeting.max_participants) {
    throw Object.assign(new Error('Meeting is full'), { status: 403 });
  }

  // Upsert participant
  const [existing] = await pool.execute(
    'SELECT id FROM participants WHERE meeting_id = ? AND user_id = ?',
    [meeting.id, userId]
  );

  if (existing.length) {
    await pool.execute(
      'UPDATE participants SET left_at = NULL, joined_at = NOW() WHERE meeting_id = ? AND user_id = ?',
      [meeting.id, userId]
    );
  } else {
    await pool.execute(
      'INSERT INTO participants (id, meeting_id, user_id, role) VALUES (?, ?, ?, ?)',
      [uuidv4(), meeting.id, userId, 'participant']
    );
  }

  // Mark started
  if (!meeting.started_at) {
    await pool.execute('UPDATE meetings SET started_at = NOW() WHERE id = ?', [meeting.id]);
  }

  return getMeetingById(meeting.id);
};

const leaveMeeting = async (userId, meetingId) => {
  await pool.execute(
    'UPDATE participants SET left_at = NOW() WHERE meeting_id = ? AND user_id = ?',
    [meetingId, userId]
  );
};

const endMeeting = async (hostId, meetingId) => {
  const [rows] = await pool.execute('SELECT host_id FROM meetings WHERE id = ?', [meetingId]);
  if (!rows.length) throw Object.assign(new Error('Meeting not found'), { status: 404 });
  if (rows[0].host_id !== hostId) throw Object.assign(new Error('Only host can end meeting'), { status: 403 });

  await pool.execute(
    'UPDATE meetings SET is_active = FALSE, ended_at = NOW() WHERE id = ?',
    [meetingId]
  );
  await pool.execute(
    'UPDATE participants SET left_at = NOW() WHERE meeting_id = ? AND left_at IS NULL',
    [meetingId]
  );
};

const getParticipants = async (meetingId) => {
  const [rows] = await pool.execute(
    `SELECT p.*, u.display_name, u.avatar_url, u.username
     FROM participants p JOIN users u ON p.user_id = u.id
     WHERE p.meeting_id = ? AND p.left_at IS NULL`,
    [meetingId]
  );
  return rows;
};

const getUserMeetings = async (userId) => {
  const [rows] = await pool.execute(
    `SELECT m.*, u.display_name AS host_name,
       (SELECT COUNT(*) FROM participants p WHERE p.meeting_id = m.id AND p.left_at IS NULL) AS participant_count
     FROM meetings m
     JOIN users u ON m.host_id = u.id
     JOIN participants p2 ON p2.meeting_id = m.id AND p2.user_id = ?
     GROUP BY m.id
     ORDER BY m.created_at DESC LIMIT 50`,
    [userId]
  );
  return rows.map((m) => { const r = { ...m, has_password: !!m.password }; delete r.password; return r; });
};

const updateParticipantState = async (meetingId, userId, state) => {
  const fields = [];
  const values = [];
  if (state.is_muted !== undefined) { fields.push('is_muted = ?'); values.push(state.is_muted); }
  if (state.is_video_off !== undefined) { fields.push('is_video_off = ?'); values.push(state.is_video_off); }
  if (state.is_screen_sharing !== undefined) { fields.push('is_screen_sharing = ?'); values.push(state.is_screen_sharing); }
  if (!fields.length) return;
  values.push(meetingId, userId);
  await pool.execute(`UPDATE participants SET ${fields.join(', ')} WHERE meeting_id = ? AND user_id = ?`, values);
};

module.exports = {
  createMeeting, getMeetingById, getMeetingByRoomId,
  joinMeeting, leaveMeeting, endMeeting,
  getParticipants, getUserMeetings, updateParticipantState,
};
