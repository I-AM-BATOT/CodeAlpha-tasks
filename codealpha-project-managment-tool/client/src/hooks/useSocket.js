
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import {
  socketTaskCreated,
  socketTaskUpdated,
  socketTaskMoved,
  socketTaskDeleted,
  fetchBoards,
} from '../store/slices/tasksSlice';
import { addNotification, fetchNotifications } from '../store/slices/notificationsSlice';

// Single global socket shared across the whole app
let globalSocket   = null;
let currentProject = null;

export const initGlobalSocket = (token, dispatch) => {
  // If already connected, reuse it
  if (globalSocket?.connected) return globalSocket;

  // If exists but disconnected, clean it up first
  if (globalSocket) {
    globalSocket.disconnect();
    globalSocket = null;
  }

  const socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 20,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    transports: ['websocket', 'polling'],
  });

  // ── Connection events ──────────────────────────────────────────

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    // After any connect/reconnect, re-join the project room
    if (currentProject) {
      socket.emit('join_project', currentProject);
      console.log('🔄 Re-joined project room:', currentProject);
    }
    // Refresh notifications on connect
    dispatch(fetchNotifications());
  });

  socket.on('reconnect', (attempt) => {
    console.log(`🔄 Reconnected after ${attempt} attempt(s)`);
    // Full board sync after reconnect — catches any events missed while offline
    if (currentProject) {
      dispatch(fetchBoards(currentProject));
      dispatch(fetchNotifications());
    }
  });

  socket.on('reconnect_attempt', (attempt) => {
    console.log(`🔁 Reconnect attempt #${attempt}...`);
  });

  socket.on('reconnect_error', (err) => {
    console.warn('⚠️ Reconnect error:', err.message);
  });

  socket.on('reconnect_failed', () => {
    console.error('❌ All reconnect attempts failed. Please refresh the page.');
  });

  socket.on('connect_error', (err) => {
    console.warn('❌ Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.warn('⚠️ Socket disconnected. Reason:', reason);
    // If the SERVER closed the connection, manually reconnect
    // (socket.io won't auto-reconnect in this case by default)
    if (reason === 'io server disconnect') {
      console.log('🔁 Server disconnected us — reconnecting manually...');
      socket.connect();
    }
    // For all other reasons (e.g. transport error, timeout),
    // socket.io handles reconnection automatically
  });

  // ── Task real-time events ──────────────────────────────────────

  socket.on('task:created', (data) => {
    console.log('📦 task:created —', data?.title);
    dispatch(socketTaskCreated(data));
  });

  socket.on('task:updated', (data) => {
    console.log('✏️ task:updated —', data?.title);
    dispatch(socketTaskUpdated(data));
  });

  socket.on('task:moved', (data) => {
    console.log('🔀 task:moved — taskId:', data?.taskId, '→ boardId:', data?.boardId);
    dispatch(socketTaskMoved(data));
  });

  socket.on('task:deleted', (data) => {
    console.log('🗑️ task:deleted — taskId:', data?.taskId);
    dispatch(socketTaskDeleted(data));
  });

  // ── Notification events ────────────────────────────────────────

  socket.on('notification', (data) => {
    console.log('🔔 notification received:', data?.text);
    dispatch(addNotification(data));
  });

  globalSocket = socket;
  return socket;
};

// Hook used inside BoardPage to join/leave a specific project room
export const useSocket = (projectId) => {
  const dispatch = useDispatch();
  const prevProject = useRef(null);

  useEffect(() => {
    if (!globalSocket) return;

    const joinRoom = () => {
      if (projectId) {
        globalSocket.emit('join_project', projectId);
        currentProject = projectId;
        console.log('🏠 Joined project room:', projectId);
      }
    };

    // Leave the previous project room if switching projects
    if (prevProject.current && prevProject.current !== projectId) {
      globalSocket.emit('leave_project', prevProject.current);
      console.log('👋 Left project room:', prevProject.current);
    }

    // Join immediately if connected, or wait for connect event
    if (globalSocket.connected) {
      joinRoom();
    } else {
      globalSocket.once('connect', joinRoom);
    }

    prevProject.current = projectId;

    return () => {
      if (projectId && globalSocket) {
        globalSocket.emit('leave_project', projectId);
        currentProject = null;
        console.log('👋 Left project room on cleanup:', projectId);
      }
    };
  }, [projectId]);
};

