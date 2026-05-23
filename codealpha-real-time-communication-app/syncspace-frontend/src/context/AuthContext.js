import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(() => { try { return JSON.parse(localStorage.getItem('ss_user')); } catch { return null; } });
  const [token, setToken]     = useState(() => localStorage.getItem('ss_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      if (token) {
        try {
          const { data } = await authAPI.profile();
          setUser(data.data);
          localStorage.setItem('ss_user', JSON.stringify(data.data));
          initSocket(token);
        } catch { logout(); }
      }
      setLoading(false);
    };
    verify();
  }, []); // eslint-disable-line

  const login = useCallback(async (credentials) => {
    const { data } = await authAPI.login(credentials);
    const { user: u, token: t } = data.data;
    setUser(u); setToken(t);
    localStorage.setItem('ss_token', t);
    localStorage.setItem('ss_user', JSON.stringify(u));
    initSocket(t);
    return u;
  }, []);

  const register = useCallback(async (info) => {
    const { data } = await authAPI.register(info);
    const { user: u, token: t } = data.data;
    setUser(u); setToken(t);
    localStorage.setItem('ss_token', t);
    localStorage.setItem('ss_user', JSON.stringify(u));
    initSocket(t);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try { await authAPI.logout(); } catch {}
    setUser(null); setToken(null);
    localStorage.removeItem('ss_token');
    localStorage.removeItem('ss_user');
    disconnectSocket();
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => { const n = {...prev,...updates}; localStorage.setItem('ss_user', JSON.stringify(n)); return n; });
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be inside AuthProvider'); return ctx; };
export default AuthContext;
