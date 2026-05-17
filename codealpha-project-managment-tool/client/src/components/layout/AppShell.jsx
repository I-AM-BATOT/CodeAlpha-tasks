
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications } from '../../store/slices/notificationsSlice';
import { initGlobalSocket } from '../../hooks/useSocket';
import TopBar from './TopBar';

export default function AppShell() {
  const dispatch      = useDispatch();
  const { token }     = useSelector(s => s.auth);

  useEffect(() => {
    if (!token) return;

    // Initialize the ONE global socket for the entire app
    // This runs once when the user logs in
    initGlobalSocket(token, dispatch);

    // Fetch notifications immediately on load
    dispatch(fetchNotifications());

    // Poll every 15 seconds as a safety net
    // (catches anything the socket might have missed)
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 15000);

    return () => clearInterval(interval);
  }, [token]);

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <main className="flex-1 overflow-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
}

