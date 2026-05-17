import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../store/slices/authSlice';
import { fetchNotifications } from '../../store/slices/notificationsSlice';
import Avatar from '../common/Avatar';
import NotificationsPanel from '../notifications/NotificationsPanel';

export default function TopBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const notifs   = useSelector(s => s.notifications.list);
  const unread   = notifs.filter(n => !n.read).length;
  const [showNotifs,   setShowNotifs]   = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef  = useRef();
  const notifRef = useRef();

  useEffect(() => {
    dispatch(fetchNotifications());
    const iv = setInterval(() => dispatch(fetchNotifications()), 15000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (menuRef.current  && !menuRef.current.contains(e.target))  setShowUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const iconBtn = {
    width: 38, height: 38, borderRadius: 10,
    background: 'rgba(255,255,255,0.15)',
    border: '1.5px solid rgba(255,255,255,0.3)',
    cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 17, transition: 'all .15s', color: '#fff',
  };

  return (
    <header style={{
      height: 62,
      background: 'linear-gradient(135deg, #FF7F50 0%, #FF6B35 50%, #E5623A 100%)',
      display: 'flex', alignItems: 'center',
      padding: '0 20px', gap: 12, flexShrink: 0,
      boxShadow: '0 2px 16px rgba(255,127,80,0.4)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>

      {/* Logo + Name */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          border: 'none', background: 'none', cursor: 'pointer',
          padding: '4px 8px', borderRadius: 10, transition: 'background .15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
      >
        {/* Logo image */}
        <img
          src="/logo.png"
          alt="TaskFlow Pro"
          style={{
            width: 36, height: 36, borderRadius: 10,
            objectFit: 'cover',
            border: '2px solid rgba(255,255,255,0.4)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          }}
          onError={e => {
            // Fallback if image not found
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        {/* Fallback text logo */}
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(255,255,255,0.2)',
          display: 'none', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#fff',
          border: '2px solid rgba(255,255,255,0.4)',
        }}>TF</div>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: '#fff', letterSpacing: 0.3 }}>TaskFlow</span>
            <span style={{
              fontSize: 10, color: 'rgba(255,255,255,0.85)',
              fontWeight: 700, letterSpacing: 1.5,
              background: 'rgba(255,255,255,0.2)',
              padding: '1px 5px', borderRadius: 4,
            }}>PRO</span>
          </div>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', margin: 0, marginTop: -1 }}>Project Management</p>
        </div>
      </button>

      <div style={{ flex: 1 }} />

      {/* Right side controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Notifications bell */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowNotifs(v => !v); setShowUserMenu(false); }}
            style={{ ...iconBtn, position: 'relative' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            🔔
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                minWidth: 18, height: 18,
                background: '#3A3B3C',
                borderRadius: 99, fontSize: 10, fontWeight: 800,
                color: '#fff', display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '0 4px',
                border: '2px solid #FF7F50',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </button>
          {showNotifs && <NotificationsPanel onClose={() => setShowNotifs(false)} />}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 26, background: 'rgba(255,255,255,0.25)' }} />

        {/* User menu */}
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowUserMenu(v => !v); setShowNotifs(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: '1.5px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.15)',
              borderRadius: 10, padding: '4px 12px 4px 4px',
              cursor: 'pointer', transition: 'all .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <Avatar user={user} size={30} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name?.split(' ')[0]}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>▾</span>
          </button>

          {showUserMenu && (
            <div className="animate-fadeIn" style={{
              position: 'absolute', top: 'calc(100% + 8px)', right: 0,
              width: 210, background: '#fff',
              border: '1.5px solid #E1E3E6', borderRadius: 14,
              boxShadow: '0 8px 32px rgba(255,127,80,0.15)',
              overflow: 'hidden', zIndex: 200,
            }}>
              {/* User info */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid #F3F4F6',
                background: 'linear-gradient(135deg,#FFF0EB,#FFF8F5)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar user={user} size={36} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#3A3B3C' }}>{user?.name}</p>
                    <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{user?.email}</p>
                  </div>
                </div>
              </div>

              {[
                { icon: '👤', label: 'My profile',  action: () => { navigate('/profile'); setShowUserMenu(false); } },
                { icon: '🗂',  label: 'Dashboard',  action: () => { navigate('/');        setShowUserMenu(false); } },
              ].map(item => (
                <button key={item.label} onClick={item.action} style={{
                  width: '100%', textAlign: 'left', padding: '10px 16px',
                  fontSize: 13, color: '#3A3B3C', border: 'none',
                  background: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'background .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF8F5'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span>{item.icon}</span>{item.label}
                </button>
              ))}

              <div style={{ borderTop: '1px solid #F3F4F6' }}>
                <button onClick={async () => { await dispatch(logout()); navigate('/login'); }} style={{
                  width: '100%', textAlign: 'left', padding: '10px 16px',
                  fontSize: 13, color: '#E5623A', border: 'none',
                  background: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'background .12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#FFF0EB'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  🚪 Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}