import { useState, useEffect, useCallback } from 'react';
import { notificationsAPI } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await notificationsAPI.getAll();
      setNotifications(data.data.notifications || []);
      setUnreadCount(data.data.unread_count || 0);
    } catch {}
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const handler = (n) => { setNotifications(p => [n,...p]); setUnreadCount(c => c+1); };
    socket.on('notification:new', handler);
    return () => socket.off('notification:new', handler);
  }, []);

  const markRead = async (id) => {
    await notificationsAPI.markRead(id);
    setNotifications(p => p.map(n => n.id===id ? {...n,is_read:true} : n));
    setUnreadCount(c => Math.max(0, c-1));
  };

  const markAllRead = async () => {
    await notificationsAPI.markAllRead();
    setNotifications(p => p.map(n => ({...n,is_read:true})));
    setUnreadCount(0);
  };

  return { notifications, unreadCount, markRead, markAllRead, reload: load };
};
