import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { meetingsAPI } from '../services/api';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export default function MeetingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');

  const load = useCallback(async () => {
    try { const { data } = await meetingsAPI.getAll(); setMeetings(data.data||[]); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = meetings.filter(m => {
    if (filter==='active') return m.is_active;
    if (filter==='hosted') return m.host_id===user?.id;
    return true;
  });

  return (
    <div style={{ padding:32 }}>
      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#F8FAFC', margin:'0 0 4px' }}>Meetings</h1>
        <p style={{ color:'#64748b', fontFamily:'DM Sans,sans-serif', fontSize:14, margin:0 }}>All your meetings in one place</p>
      </motion.div>

      {/* Filters */}
      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        {['all','active','hosted'].map(f => (
          <motion.button key={f} whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }} onClick={()=>setFilter(f)}
            style={{ padding:'7px 16px', borderRadius:999, border:`1px solid ${filter===f?'#6C63FF':'rgba(255,255,255,0.1)'}`, background: filter===f?'rgba(108,99,255,0.15)':'rgba(255,255,255,0.04)', color: filter===f?'#a49cf9':'#64748b', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:500, cursor:'pointer', textTransform:'capitalize' }}>
            {f}
          </motion.button>
        ))}
      </div>

      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size={36} /></div> :
        filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:60, background:'#111827', borderRadius:20, border:'1px dashed rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize:40, marginBottom:12 }}>📭</p>
            <p style={{ color:'#94a3b8', fontFamily:'DM Sans,sans-serif', fontSize:15 }}>No meetings found</p>
          </div>
        ) : (
          <motion.div variants={{ show:{ transition:{ staggerChildren:0.05 }} }} initial="hidden" animate="show"
            style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:16 }}>
            {filtered.map(m => (
              <motion.div key={m.id} variants={{ hidden:{opacity:0,y:16}, show:{opacity:1,y:0} }}
                whileHover={{ y:-3, borderColor:'rgba(108,99,255,0.3)', boxShadow:'0 8px 30px rgba(0,0,0,0.3)' }}
                onClick={() => navigate(`/meeting/${m.room_id}`)}
                style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, cursor:'pointer', transition:'all .2s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <h3 style={{ margin:'0 0 4px', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:17, color:'#F8FAFC' }}>{m.title}</h3>
                    {m.description && <p style={{ margin:'0 0 6px', fontSize:13, color:'#64748b', fontFamily:'DM Sans,sans-serif', lineHeight:1.4 }}>{m.description}</p>}
                  </div>
                  <Badge color={m.is_active?'green':'yellow'}>{m.is_active?'Live':'Ended'}</Badge>
                </div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p style={{ margin:0, fontFamily:'JetBrains Mono,monospace', fontSize:12, color:'#6C63FF', background:'rgba(108,99,255,0.1)', padding:'3px 8px', borderRadius:6 }}>{m.room_id}</p>
                  <span style={{ fontSize:12, color:'#475569', fontFamily:'DM Sans,sans-serif' }}>{format(new Date(m.created_at),'MMM d, yyyy')}</span>
                </div>
                <div style={{ marginTop:10, display:'flex', gap:12, fontSize:12, color:'#64748b', fontFamily:'DM Sans,sans-serif' }}>
                  <span>◉ {m.participant_count||0} joined</span>
                  {m.host_id===user?.id && <span style={{ color:'#a49cf9' }}>★ You're the host</span>}
                  {m.has_password && <span>🔒 Password protected</span>}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )
      }
    </div>
  );
}
