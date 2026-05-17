import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { markAllRead, markOneRead, fetchNotifications } from '../../store/slices/notificationsSlice';
import { fmtDateTime } from '../../utils/helpers';

export default function NotificationsPanel({ onClose }) {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(s => s.notifications);
  const unread = list.filter(n => !n.read).length;

  useEffect(() => { dispatch(fetchNotifications()); }, []);

  return (
    <div className="animate-fadeIn" style={{
      position:'absolute', top:'calc(100% + 10px)', right:0,
      width:340, background:'#fff',
      border:'1.5px solid #E1E3E6', borderRadius:16,
      boxShadow:'0 12px 40px rgba(255,127,80,0.15)',
      overflow:'hidden', zIndex:200,
    }}>
      {/* Header */}
      <div style={{
        padding:'14px 16px', display:'flex',
        alignItems:'center', justifyContent:'space-between',
        background:'linear-gradient(135deg,#FF7F50,#E5623A)',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontWeight:700, fontSize:14, color:'#fff' }}>Notifications</span>
          {unread > 0 && (
            <span style={{
              background:'#fff', color:'#FF7F50',
              fontSize:10, fontWeight:800,
              borderRadius:99, padding:'1px 8px',
            }}>{unread} new</span>
          )}
        </div>
        {unread > 0 && (
          <button onClick={() => dispatch(markAllRead())} style={{
            fontSize:11, color:'rgba(255,255,255,0.9)',
            border:'1px solid rgba(255,255,255,0.3)',
            background:'rgba(255,255,255,0.15)',
            borderRadius:6, padding:'3px 8px',
            cursor:'pointer', fontWeight:600,
          }}>Mark all read</button>
        )}
      </div>

      {/* List */}
      <div style={{ maxHeight:380, overflowY:'auto' }}>
        {loading && <p style={{ textAlign:'center', padding:'24px 0', color:'#9CA3AF', fontSize:13 }}>Loading...</p>}
        {!loading && list.length === 0 && (
          <div style={{ textAlign:'center', padding:'32px 16px' }}>
            <div style={{ fontSize:36, marginBottom:8 }}>🔔</div>
            <p style={{ fontSize:13, color:'#9CA3AF', fontWeight:600 }}>All caught up!</p>
            <p style={{ fontSize:12, color:'#C4C7CC', marginTop:4 }}>No new notifications</p>
          </div>
        )}
        {!loading && list.map(n => (
          <div
            key={n.id}
            onClick={() => { if (!n.read) dispatch(markOneRead(n.id)); }}
            style={{
              display:'flex', gap:10, alignItems:'flex-start',
              padding:'12px 16px', borderBottom:'1px solid #F3F4F6',
              background: n.read ? '#fff' : '#FFF0EB',
              cursor:'pointer', transition:'background .12s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = n.read ? '#FFF8F5' : '#FFE8DC'}
            onMouseLeave={e => e.currentTarget.style.background = n.read ? '#fff' : '#FFF0EB'}
          >
            <div style={{
              width:34, height:34, borderRadius:10, flexShrink:0,
              background: n.read ? '#F3F4F6' : '#FFE8DC',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
            }}>{n.read ? '📋' : '🔔'}</div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontSize:12, color:'#3A3B3C', lineHeight:1.5, marginBottom:3 }}>{n.text}</p>
              <p style={{ fontSize:11, color:'#9CA3AF' }}>{fmtDateTime(n.createdAt)}</p>
            </div>
            {!n.read && (
              <div style={{ width:8, height:8, borderRadius:'50%', background:'#FF7F50', flexShrink:0, marginTop:4 }} />
            )}
          </div>
        ))}
      </div>

      <div style={{ padding:'8px 16px', borderTop:'1px solid #F3F4F6', textAlign:'center' }}>
        <button onClick={() => dispatch(fetchNotifications())} style={{ fontSize:11, color:'#9CA3AF', border:'none', background:'none', cursor:'pointer' }}>
          ↻ Refresh
        </button>
      </div>
    </div>
  );
}