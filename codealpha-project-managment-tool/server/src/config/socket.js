
const { Server } = require('socket.io');
const jwt        = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin:  process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Keep connections alive
    pingTimeout:  60000,
    pingInterval: 25000,
    // Allow upgrade from polling to websocket
    allowUpgrades: true,
  });

  // ── Auth middleware — runs before every connection ─────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token provided'));
    try {
      socket.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch {
      next(new Error('Invalid or expired token'));
    }
  });

  // ── Connection handler ─────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    console.log(`✅ Socket connected: user ${userId} (socketId: ${socket.id})`);

    // IMPORTANT: Every user joins their own private room immediately
    // This is how personal notifications are delivered
    socket.join(`user:${userId}`);
    console.log(`🏠 User ${userId} joined personal room: user:${userId}`);

    // ── Project room events ──────────────────────────────────────

    socket.on('join_project', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`🏠 User ${userId} joined project:${projectId}`);
    });

    socket.on('leave_project', (projectId) => {
      socket.leave(`project:${projectId}`);
      console.log(`👋 User ${userId} left project:${projectId}`);
    });

    // ── Disconnect ───────────────────────────────────────────────

    socket.on('disconnect', (reason) => {
      console.log(`❌ User ${userId} disconnected — reason: ${reason}`);
      // Possible reasons:
      // 'transport close'    — network drop
      // 'transport error'    — connection error
      // 'ping timeout'       — client lost connection silently
      // 'io server disconnect' — server called socket.disconnect()
      // 'io client disconnect' — client called socket.disconnect()
    });

    socket.on('error', (err) => {
      console.error(`Socket error for user ${userId}:`, err.message);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized — call initSocket first');
  return io;
};

module.exports = { initSocket, getIO };
