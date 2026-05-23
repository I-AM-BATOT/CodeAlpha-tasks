import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const NAV = [
  { icon: '⬡', label: 'Dashboard', path: '/dashboard' },
  { icon: '▶', label: 'Meetings', path: '/meetings' },
  { icon: '◎', label: 'Whiteboard', path: '/whiteboard' },
  { icon: '◫', label: 'Files', path: '/files' },
  { icon: '◉', label: 'Notifications', path: '/notifications', badge: true },
  { icon: '◈', label: 'Profile', path: '/profile' },
];

export const Sidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const loc = useLocation();

  return (
    <motion.aside animate={{ width: collapsed ? 72 : 240 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ height: '100vh', background: '#111827', borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0, position: 'relative', zIndex: 10 }}>

      {/* Logo */}
      <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.div whileHover={{ scale: 1.05 }} style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 16px rgba(108,99,255,0.4)', cursor: 'pointer' }} onClick={onToggle}>
          <span style={{ fontSize: 18, color: '#fff', fontWeight: 800 }}>S</span>
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 18, color: '#F8FAFC', letterSpacing: 1, whiteSpace: 'nowrap' }}>
              SyncSpace
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => {
          const active = loc.pathname.startsWith(item.path);
          return (
            <motion.button key={item.path} whileHover={{ x: 2 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate(item.path)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 10, border: 'none', cursor: 'pointer', background: active ? 'rgba(108,99,255,0.15)' : 'transparent', color: active ? '#a49cf9' : '#64748b', transition: 'all .2s', position: 'relative', width: '100%' }}>
              <span style={{ fontSize: 18, flexShrink: 0, width: 24, textAlign: 'center' }}>{item.icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ fontSize: 14, fontFamily: 'DM Sans,sans-serif', fontWeight: 500, whiteSpace: 'nowrap' }}>{item.label}</motion.span>
                )}
              </AnimatePresence>
              {item.badge && unreadCount > 0 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ position: 'absolute', top: 6, left: collapsed ? 28 : 'auto', right: collapsed ? 'auto' : 12, background: '#6C63FF', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, minWidth: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
              {active && <motion.div layoutId="activeNav" style={{ position: 'absolute', right: 0, top: 4, bottom: 4, width: 3, borderRadius: 3, background: '#6C63FF' }} />}
            </motion.button>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#6C63FF,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Syne,sans-serif' }}>
          {user?.display_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, overflow: 'hidden' }}>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#F8FAFC', fontFamily: 'DM Sans,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.display_name}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#64748b', fontFamily: 'DM Sans,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!collapsed && (
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={logout} title="Logout"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', width: 30, height: 30, borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 14 }}>
              ⏻
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};
