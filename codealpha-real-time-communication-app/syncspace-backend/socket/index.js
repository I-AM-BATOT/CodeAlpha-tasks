const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const contentService = require('../services/contentService');
const meetingService = require('../services/meetingService');
const notificationService = require('../services/notificationService');

// Active rooms map: roomId → Set of socket ids
const rooms = new Map();
// Socket → { userId, roomId, displayName }
const socketMeta = new Map();

const initSocket = (io) => {
  // ─── JWT Auth Middleware ─────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const [rows] = await pool.execute(
        'SELECT id, username, display_name, avatar_url FROM users WHERE id = ?',
        [decoded.id]
      );
      if (!rows.length) return next(new Error('User not found'));
      socket.user = rows[0];
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] Connected: ${socket.user.display_name} (${socket.id})`);

    // ─── Room / Meeting Events ───────────────────────────────────────────
    socket.on('room:join', async ({ roomId }) => {
      try {
        socket.join(roomId);
        socketMeta.set(socket.id, { userId: socket.user.id, roomId, displayName: socket.user.display_name });

        if (!rooms.has(roomId)) rooms.set(roomId, new Set());
        rooms.get(roomId).add(socket.id);

        // Announce to room
        socket.to(roomId).emit('room:user_joined', {
          userId: socket.user.id,
          displayName: socket.user.display_name,
          avatarUrl: socket.user.avatar_url,
          socketId: socket.id,
        });

        // Send current participant list to joiner
        const participants = await meetingService.getParticipants(
          await getRoomMeetingId(roomId)
        ).catch(() => []);
        socket.emit('room:participants', participants);

        // Notify all in room of updated count
        io.to(roomId).emit('room:user_count', rooms.get(roomId).size);

        // Load whiteboard for joiner
        const meeting = await getMeetingByRoom(roomId);
        if (meeting) {
          const wb = await contentService.getWhiteboardData(meeting.id).catch(() => null);
          if (wb?.canvas_data) socket.emit('whiteboard:state', { canvas_data: wb.canvas_data });
        }

        console.log(`[Socket] ${socket.user.display_name} joined room ${roomId}`);
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('room:leave', ({ roomId }) => {
      handleLeave(socket, roomId, io);
    });

    // ─── WebRTC Signaling ────────────────────────────────────────────────
    socket.on('webrtc:offer', ({ to, offer }) => {
      io.to(to).emit('webrtc:offer', { from: socket.id, offer, user: socket.user });
    });

    socket.on('webrtc:answer', ({ to, answer }) => {
      io.to(to).emit('webrtc:answer', { from: socket.id, answer });
    });

    socket.on('webrtc:ice_candidate', ({ to, candidate }) => {
      io.to(to).emit('webrtc:ice_candidate', { from: socket.id, candidate });
    });

    // ─── Media State ─────────────────────────────────────────────────────
    socket.on('media:mute', ({ roomId, is_muted }) => {
      socket.to(roomId).emit('media:user_muted', { socketId: socket.id, userId: socket.user.id, is_muted });
    });

    socket.on('media:video', ({ roomId, is_video_off }) => {
      socket.to(roomId).emit('media:user_video', { socketId: socket.id, userId: socket.user.id, is_video_off });
    });

    socket.on('media:screen_share', ({ roomId, is_sharing }) => {
      socket.to(roomId).emit('media:screen_share', { socketId: socket.id, userId: socket.user.id, is_sharing });
    });

    socket.on('media:speaking', ({ roomId, isSpeaking }) => {
      socket.to(roomId).emit('media:speaking', { socketId: socket.id, isSpeaking });
    });

    // ─── Chat ────────────────────────────────────────────────────────────
    socket.on('chat:message', async ({ roomId, content, type = 'text' }) => {
      try {
        const meeting = await getMeetingByRoom(roomId);
        if (!meeting) return;

        const message = await contentService.saveMessage({
          meeting_id: meeting.id,
          sender_id: socket.user.id,
          content,
          type,
        });

        io.to(roomId).emit('chat:message', message);
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('chat:typing', ({ roomId, isTyping }) => {
      socket.to(roomId).emit('chat:typing', {
        userId: socket.user.id,
        displayName: socket.user.display_name,
        isTyping,
      });
    });

    socket.on('chat:delete', async ({ messageId }) => {
      try {
        await contentService.deleteMessage(messageId, socket.user.id);
        const meta = socketMeta.get(socket.id);
        if (meta) io.to(meta.roomId).emit('chat:message_deleted', { messageId });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Whiteboard ──────────────────────────────────────────────────────
    socket.on('whiteboard:draw', async ({ roomId, action }) => {
      // Broadcast to everyone else in room immediately (low latency)
      socket.to(roomId).emit('whiteboard:draw', { action, userId: socket.user.id });
    });

    socket.on('whiteboard:save', async ({ roomId, canvas_data }) => {
      try {
        const meeting = await getMeetingByRoom(roomId);
        if (!meeting) return;
        await contentService.saveWhiteboardData(meeting.id, canvas_data, socket.user.id);
        socket.to(roomId).emit('whiteboard:state', { canvas_data });
      } catch (err) {
        socket.emit('error', { message: 'Failed to save whiteboard' });
      }
    });

    socket.on('whiteboard:clear', ({ roomId }) => {
      io.to(roomId).emit('whiteboard:cleared', { by: socket.user.display_name });
    });

    socket.on('whiteboard:cursor', ({ roomId, x, y }) => {
      socket.to(roomId).emit('whiteboard:cursor', {
        userId: socket.user.id,
        displayName: socket.user.display_name,
        x, y,
      });
    });

    // ─── File Sharing ─────────────────────────────────────────────────────
    socket.on('file:shared', ({ roomId, file }) => {
      // Notify room when a file is uploaded via REST
      socket.to(roomId).emit('file:new', { file, sharedBy: socket.user.display_name });
    });

    // ─── Notifications ─────────────────────────────────────────────────
    socket.on('notification:meeting_invite', async ({ targetUserId, meetingId, roomId }) => {
      try {
        const notif = await notificationService.createNotification(
          targetUserId,
          'meeting_invite',
          `${socket.user.display_name} invited you to a meeting`,
          null,
          { meetingId, roomId, invitedBy: socket.user.id }
        );
        // Send to target user's sockets if they're online
        io.to(`user:${targetUserId}`).emit('notification:new', notif);
      } catch (err) {
        console.error('[Socket] Notification error:', err.message);
      }
    });

    // ─── Presence ─────────────────────────────────────────────────────────
    socket.on('presence:ping', () => {
      socket.emit('presence:pong', { timestamp: Date.now() });
    });

    // ─── Disconnect ────────────────────────────────────────────────────────
    socket.on('disconnecting', () => {
      const meta = socketMeta.get(socket.id);
      if (meta?.roomId) handleLeave(socket, meta.roomId, io);
    });

    socket.on('disconnect', () => {
      socketMeta.delete(socket.id);
      pool.execute('UPDATE users SET is_online = FALSE, last_seen = NOW() WHERE id = ?', [socket.user.id])
        .catch(() => {});
      console.log(`[Socket] Disconnected: ${socket.user.display_name} (${socket.id})`);
    });

    // Join personal room for direct notifications
    socket.join(`user:${socket.user.id}`);
    pool.execute('UPDATE users SET is_online = TRUE WHERE id = ?', [socket.user.id]).catch(() => {});
  });
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const handleLeave = (socket, roomId, io) => {
  socket.leave(roomId);
  if (rooms.has(roomId)) {
    rooms.get(roomId).delete(socket.id);
    if (rooms.get(roomId).size === 0) rooms.delete(roomId);
    else io.to(roomId).emit('room:user_count', rooms.get(roomId).size);
  }
  io.to(roomId).emit('room:user_left', {
    socketId: socket.id,
    userId: socket.user.id,
    displayName: socket.user.display_name,
  });
  socketMeta.delete(socket.id);
};

const getMeetingByRoom = async (roomId) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM meetings WHERE room_id = ?', [roomId]);
    return rows[0] || null;
  } catch { return null; }
};

const getRoomMeetingId = async (roomId) => {
  const m = await getMeetingByRoom(roomId);
  return m?.id;
};

module.exports = { initSocket };
