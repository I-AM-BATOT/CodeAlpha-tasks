import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
let socket = null;

export const initSocket = (token) => {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  socket.on('connect', () => console.log('[Socket] Connected:', socket.id));
  socket.on('disconnect', (r) => console.log('[Socket] Disconnected:', r));
  socket.on('connect_error', (e) => console.error('[Socket] Error:', e.message));
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

const socketService = { initSocket, getSocket, disconnectSocket };
export default socketService;
