import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';
import { format } from 'date-fns';

const icons = { meeting_invite:'📩', user_joined:'👋', user_left:'🚪', file_shared:'📁', message:'💬' };

export default function NotificationsPage() {
  const { notifications, markRead, markAllRead } = useNotifications();
  return (
    <div style={{ padding:32, maxWidth:680 }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:32 }}>
        <div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#F8FAFC', margin:'0 0 4px' }}>Notifications</h1>
          <p style={{ color:'#64748b', fontFamily:'DM Sans,sans-serif', fontSize:14, margin:0 }}>{notifications.filter(n=>!n.is_read).length} unread</p>
        </div>
        {notifications.some(n=>!n.is_read) && (
          <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={markAllRead}
            style={{ padding:'8px 16px', background:'rgba(108,99,255,0.1)', border:'1px solid rgba(108,99,255,0.2)', borderRadius:10, color:'#a49cf9', fontFamily:'DM Sans,sans-serif', fontSize:13, cursor:'pointer' }}>
            ✓ Mark all read
          </motion.button>
        )}
      </motion.div>

      {notifications.length === 0 ? (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:'center', padding:60, background:'#111827', borderRadius:20, border:'1px dashed rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize:40, marginBottom:12 }}>🔔</p>
          <p style={{ color:'#94a3b8', fontFamily:'DM Sans,sans-serif', fontSize:16 }}>No notifications yet</p>
        </motion.div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
          <AnimatePresence>
            {notifications.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity:0, x:-16 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}
                whileHover={{ x:4, background:'rgba(255,255,255,0.05)' }}
                onClick={()=>!n.is_read&&markRead(n.id)}
                style={{ display:'flex', gap:14, padding:'14px 16px', background: n.is_read?'#111827':'rgba(108,99,255,0.06)', border:`1px solid ${n.is_read?'rgba(255,255,255,0.06)':'rgba(108,99,255,0.15)'}`, borderRadius:14, cursor: n.is_read?'default':'pointer', transition:'all .2s' }}>
                <span style={{ fontSize:22, flexShrink:0 }}>{icons[n.type]||'🔔'}</span>
                <div style={{ flex:1 }}>
                  <p style={{ margin:'0 0 3px', fontFamily:'DM Sans,sans-serif', fontWeight: n.is_read?400:600, fontSize:14, color: n.is_read?'#94a3b8':'#F8FAFC' }}>{n.title}</p>
                  {n.body && <p style={{ margin:'0 0 4px', fontSize:13, color:'#64748b', fontFamily:'DM Sans,sans-serif' }}>{n.body}</p>}
                  <p style={{ margin:0, fontSize:11, color:'#475569', fontFamily:'DM Sans,sans-serif' }}>{format(new Date(n.created_at),'MMM d, h:mm a')}</p>
                </div>
                {!n.is_read && <div style={{ width:8, height:8, borderRadius:'50%', background:'#6C63FF', flexShrink:0, alignSelf:'center', boxShadow:'0 0 8px #6C63FF' }} />}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
