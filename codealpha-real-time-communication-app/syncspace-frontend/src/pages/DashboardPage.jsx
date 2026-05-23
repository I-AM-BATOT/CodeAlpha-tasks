import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { meetingsAPI } from '../services/api';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const card = { hidden:{ opacity:0, y:20 }, show:{ opacity:1, y:0 } };

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin]     = useState(false);
  const [createForm, setCreateForm] = useState({ title:'', description:'', password:'' });
  const [joinForm, setJoinForm]     = useState({ room_id:'', password:'' });
  const [creating, setCreating]     = useState(false);
  const [joining, setJoining]       = useState(false);

  const load = useCallback(async () => {
    try { const { data } = await meetingsAPI.getAll(); setMeetings(data.data || []); }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault(); setCreating(true);
    try {
      const { data } = await meetingsAPI.create(createForm);
      toast.success('Meeting created!');
      setShowCreate(false);
      navigate(`/meeting/${data.data.room_id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setCreating(false); }
  };

  const handleJoin = async (e) => {
    e.preventDefault(); setJoining(true);
    try {
      await meetingsAPI.join(joinForm);
      navigate(`/meeting/${joinForm.room_id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to join'); }
    finally { setJoining(false); }
  };

  const stats = [
    { label:'Total Meetings', value: meetings.length, icon:'▶', color:'#6C63FF' },
    { label:'Active Now', value: meetings.filter(m=>m.is_active).length, icon:'◎', color:'#00D4FF' },
    { label:'Hosted', value: meetings.filter(m=>m.host_id===user?.id).length, icon:'⬡', color:'#8B5CF6' },
    { label:'Participants', value: meetings.reduce((a,m)=>a+(m.participant_count||0),0), icon:'◉', color:'#EC4899' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div style={{ padding:32, minHeight:'100vh' }}>
      {/* Header */}
      <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} style={{ marginBottom:32 }}>
        <p style={{ margin:'0 0 4px', color:'#64748b', fontFamily:'DM Sans,sans-serif', fontSize:14 }}>{greeting},</p>
        <h1 style={{ margin:0, fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:32, color:'#F8FAFC' }}>
          {user?.display_name || user?.username} <span style={{ background:'linear-gradient(135deg,#6C63FF,#00D4FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>👋</span>
        </h1>
      </motion.div>

      {/* Action buttons */}
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}
        style={{ display:'flex', gap:12, marginBottom:32, flexWrap:'wrap' }}>
        {[
          { label:'+ New Meeting', action:()=>setShowCreate(true), gradient:'linear-gradient(135deg,#6C63FF,#8B5CF6)', shadow:'rgba(108,99,255,0.4)' },
          { label:'⤵ Join Meeting', action:()=>setShowJoin(true), gradient:'linear-gradient(135deg,#0891b2,#00D4FF)', shadow:'rgba(0,212,255,0.3)' },
        ].map(btn => (
          <motion.button key={btn.label} whileHover={{ scale:1.03, y:-2 }} whileTap={{ scale:0.97 }}
            onClick={btn.action}
            style={{ padding:'14px 28px', borderRadius:14, background:btn.gradient, border:'none', color:'#fff', fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:15, cursor:'pointer', boxShadow:`0 6px 20px ${btn.shadow}` }}>
            {btn.label}
          </motion.button>
        ))}
      </motion.div>

      {/* Stats */}
      <motion.div variants={{ show:{ transition:{ staggerChildren:0.07 }} }} initial="hidden" animate="show"
        style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16, marginBottom:36 }}>
        {stats.map(s => (
          <motion.div key={s.label} variants={card} whileHover={{ y:-3, boxShadow:'0 12px 40px rgba(0,0,0,0.3)' }}
            style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:'20px 20px' }}>
            <div style={{ width:40, height:40, borderRadius:10, background:`${s.color}1a`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12, fontSize:18 }}>{s.icon}</div>
            <p style={{ margin:'0 0 4px', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:s.color }}>{s.value}</p>
            <p style={{ margin:0, fontSize:12, color:'#64748b', fontFamily:'DM Sans,sans-serif', fontWeight:500 }}>{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Meetings list */}
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:20, color:'#F8FAFC', margin:'0 0 16px' }}>Recent Meetings</h2>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:40 }}><Spinner size={32} /></div>
        ) : meetings.length === 0 ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
            style={{ textAlign:'center', padding:60, background:'#111827', borderRadius:20, border:'1px dashed rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize:40, marginBottom:12 }}>◷</p>
            <p style={{ color:'#94a3b8', fontFamily:'DM Sans,sans-serif', fontSize:16, margin:'0 0 8px' }}>No meetings yet</p>
            <p style={{ color:'#475569', fontFamily:'DM Sans,sans-serif', fontSize:13, margin:0 }}>Create or join a meeting to get started</p>
          </motion.div>
        ) : (
          <motion.div variants={{ show:{ transition:{ staggerChildren:0.05 }} }} initial="hidden" animate="show"
            style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:16 }}>
            {meetings.map(m => (
              <motion.div key={m.id} variants={card} whileHover={{ y:-3, borderColor:'rgba(108,99,255,0.3)' }}
                style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.07)', borderRadius:16, padding:20, cursor:'pointer', transition:'border-color .2s' }}
                onClick={() => navigate(`/meeting/${m.room_id}`)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                  <div>
                    <h3 style={{ margin:'0 0 4px', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#F8FAFC' }}>{m.title}</h3>
                    <p style={{ margin:0, fontSize:12, color:'#64748b', fontFamily:'JetBrains Mono,monospace' }}>{m.room_id}</p>
                  </div>
                  <Badge color={m.is_active ? 'green' : 'yellow'}>{m.is_active ? 'Live' : 'Ended'}</Badge>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:16, fontSize:12, color:'#64748b', fontFamily:'DM Sans,sans-serif' }}>
                  <span>◉ {m.participant_count || 0} participants</span>
                  <span>◷ {format(new Date(m.created_at), 'MMM d, h:mm a')}</span>
                </div>
                {m.host_id === user?.id && <div style={{ marginTop:8 }}><Badge color="brand">Host</Badge></div>}
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={()=>setShowCreate(false)} title="Create Meeting">
        <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { label:'Meeting Title *', key:'title', placeholder:'Team standup…', required:true },
            { label:'Description', key:'description', placeholder:'What is this meeting about?' },
            { label:'Password (optional)', key:'password', placeholder:'Leave blank for open meeting', type:'password' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:500, color:'#94a3b8', fontFamily:'DM Sans,sans-serif' }}>{f.label}</label>
              <input className="input-field" type={f.type||'text'} placeholder={f.placeholder} required={!!f.required}
                value={createForm[f.key]} onChange={e=>setCreateForm(c=>({...c,[f.key]:e.target.value}))} />
            </div>
          ))}
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={()=>setShowCreate(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} disabled={creating}>
              {creating ? <><Spinner size={16} color="#fff" /> Creating…</> : '🚀 Create & Join'}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Join Modal */}
      <Modal open={showJoin} onClose={()=>setShowJoin(false)} title="Join Meeting">
        <form onSubmit={handleJoin} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:500, color:'#94a3b8', fontFamily:'DM Sans,sans-serif' }}>Room ID *</label>
            <input className="input-field" placeholder="e.g. ABC-1234-XY" required
              value={joinForm.room_id} onChange={e=>setJoinForm(f=>({...f,room_id:e.target.value.toUpperCase()}))} style={{ fontFamily:'JetBrains Mono,monospace', letterSpacing:2 }} />
          </div>
          <div>
            <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:500, color:'#94a3b8', fontFamily:'DM Sans,sans-serif' }}>Password (if required)</label>
            <input className="input-field" type="password" placeholder="••••••••"
              value={joinForm.password} onChange={e=>setJoinForm(f=>({...f,password:e.target.value}))} />
          </div>
          <div style={{ display:'flex', gap:10, marginTop:8 }}>
            <button type="button" className="btn-ghost" style={{ flex:1 }} onClick={()=>setShowJoin(false)}>Cancel</button>
            <motion.button type="submit" className="btn-primary" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, background:'linear-gradient(135deg,#0891b2,#00D4FF)' }}
              whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} disabled={joining}>
              {joining ? <><Spinner size={16} color="#fff" /> Joining…</> : '⤵ Join Meeting'}
            </motion.button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
