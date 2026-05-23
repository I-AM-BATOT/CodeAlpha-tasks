import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const features = [
  { icon:'🎥', title:'HD Video Conferencing', desc:'Crystal-clear multi-participant video with WebRTC technology.' },
  { icon:'✏️', title:'Live Whiteboard', desc:'Real-time collaborative drawing synced across all participants.' },
  { icon:'🖥️', title:'Screen Sharing', desc:'Share your screen instantly with a single click.' },
  { icon:'💬', title:'Live Chat', desc:'In-meeting chat with emoji reactions and typing indicators.' },
  { icon:'📁', title:'File Sharing', desc:'Drag-and-drop file uploads shared with everyone in the room.' },
  { icon:'🔒', title:'Secure & Encrypted', desc:'JWT auth, bcrypt passwords, and encrypted communications.' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight:'100vh', background:'#0F172A', color:'#F8FAFC', overflow:'hidden', position:'relative' }}>
      {/* Orbs */}
      <div className="orb" style={{ width:600, height:600, background:'rgba(108,99,255,0.1)', top:-200, left:-200 }} />
      <div className="orb" style={{ width:500, height:500, background:'rgba(0,212,255,0.07)', top:100, right:-150 }} />

      {/* Nav */}
      <nav style={{ padding:'20px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.06)', backdropFilter:'blur(10px)', position:'sticky', top:0, zIndex:50, background:'rgba(15,23,42,0.8)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:36, height:36, borderRadius:10, background:'linear-gradient(135deg,#6C63FF,#00D4FF)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800 }}>S</div>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:20 }}>SyncSpace</span>
        </div>
        <div style={{ display:'flex', gap:12 }}>
          <Link to="/login" style={{ padding:'8px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', color:'#94a3b8', textDecoration:'none', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:500, transition:'all .2s' }}>Sign In</Link>
          <Link to="/register" style={{ padding:'8px 20px', borderRadius:10, background:'linear-gradient(135deg,#6C63FF,#8B5CF6)', color:'#fff', textDecoration:'none', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:600, boxShadow:'0 4px 16px rgba(108,99,255,0.4)' }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'100px 48px 80px', textAlign:'center', position:'relative' }}>
        <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'6px 16px', background:'rgba(108,99,255,0.12)', border:'1px solid rgba(108,99,255,0.2)', borderRadius:999, marginBottom:28 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#6C63FF', display:'inline-block', boxShadow:'0 0 8px #6C63FF' }} />
            <span style={{ fontSize:13, color:'#a49cf9', fontFamily:'DM Sans,sans-serif', fontWeight:500 }}>Real-time collaboration platform</span>
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(40px,6vw,76px)', lineHeight:1.1, margin:'0 0 24px' }}>
            Connect. Collaborate.<br />
            <span style={{ background:'linear-gradient(135deg,#6C63FF,#00D4FF)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Create Together.</span>
          </h1>
          <p style={{ fontSize:'clamp(16px,2vw,20px)', color:'#94a3b8', fontFamily:'DM Sans,sans-serif', lineHeight:1.6, maxWidth:600, margin:'0 auto 40px' }}>
            SyncSpace brings your team together with HD video, live whiteboard, instant chat, and seamless file sharing — all in one beautiful platform.
          </p>
          <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
            <motion.div whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}>
              <Link to="/register" style={{ padding:'15px 36px', borderRadius:14, background:'linear-gradient(135deg,#6C63FF,#8B5CF6)', color:'#fff', textDecoration:'none', fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:600, boxShadow:'0 6px 24px rgba(108,99,255,0.5)', display:'inline-block' }}>
                Start Free →
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale:1.04, y:-2 }} whileTap={{ scale:0.97 }}>
              <Link to="/login" style={{ padding:'15px 36px', borderRadius:14, border:'1px solid rgba(255,255,255,0.12)', color:'#F8FAFC', textDecoration:'none', fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:500, background:'rgba(255,255,255,0.04)', display:'inline-block' }}>
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Mock UI preview */}
        <motion.div initial={{ opacity:0, y:50, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:0.3, duration:0.8 }}
          style={{ marginTop:70, background:'rgba(17,24,39,0.9)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:20, boxShadow:'0 40px 100px rgba(0,0,0,0.5)', backdropFilter:'blur(10px)' }}>
          {/* Fake meeting UI */}
          <div style={{ background:'#0d1424', borderRadius:16, padding:20, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, minHeight:200 }}>
            {[{name:'Alex',color:'#6C63FF'},{name:'Sam',color:'#8B5CF6'},{name:'Jordan',color:'#00D4FF'},{name:'Casey',color:'#EC4899'},{name:'Morgan',color:'#22c55e'},{name:'Riley',color:'#f59e0b'}].map((p,i)=>(
              <motion.div key={p.name} initial={{opacity:0,scale:0.8}} animate={{opacity:1,scale:1}} transition={{delay:0.5+i*0.08}}
                style={{ borderRadius:12, background:'#161d33', border:`1px solid ${i===0?p.color:'rgba(255,255,255,0.06)'}`, padding:16, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8, minHeight:80, boxShadow:i===0?`0 0 20px ${p.color}40`:undefined }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${p.color},${p.color}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:14, color:'#fff' }}>{p.name[0]}</div>
                <span style={{ fontSize:11, color:'#94a3b8', fontFamily:'DM Sans,sans-serif' }}>{p.name}</span>
              </motion.div>
            ))}
          </div>
          {/* Fake controls */}
          <div style={{ marginTop:16, display:'flex', justifyContent:'center', gap:10 }}>
            {['🎤','🎥','🖥️','💬','✏️'].map((icon,i)=>(
              <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.9+i*0.05}}
                style={{ width:44, height:44, borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>
                {icon}
              </motion.div>
            ))}
            <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:1.15}}
              style={{ width:44, height:44, borderRadius:12, background:'linear-gradient(135deg,#ef4444,#dc2626)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:'#fff', boxShadow:'0 4px 12px rgba(239,68,68,0.4)' }}>✕</motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'60px 48px' }}>
        <motion.div initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} style={{ textAlign:'center', marginBottom:56 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(28px,4vw,44px)', margin:'0 0 16px' }}>Everything you need</h2>
          <p style={{ color:'#94a3b8', fontFamily:'DM Sans,sans-serif', fontSize:17, margin:0 }}>Built for modern teams who demand quality and performance</p>
        </motion.div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity:0, y:24 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.07 }}
              whileHover={{ y:-5, borderColor:'rgba(108,99,255,0.25)', boxShadow:'0 12px 40px rgba(0,0,0,0.3)' }}
              style={{ background:'#111827', border:'1px solid rgba(255,255,255,0.07)', borderRadius:18, padding:28, transition:'all .25s' }}>
              <div style={{ fontSize:32, marginBottom:16 }}>{f.icon}</div>
              <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:17, color:'#F8FAFC', margin:'0 0 10px' }}>{f.title}</h3>
              <p style={{ color:'#64748b', fontFamily:'DM Sans,sans-serif', fontSize:14, lineHeight:1.6, margin:0 }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
        style={{ maxWidth:700, margin:'20px auto 80px', padding:'56px 48px', background:'rgba(108,99,255,0.06)', border:'1px solid rgba(108,99,255,0.15)', borderRadius:24, textAlign:'center', position:'relative', overflow:'hidden' }}>
        <div className="orb" style={{ width:300, height:300, background:'rgba(108,99,255,0.15)', top:'50%', left:'50%', transform:'translate(-50%,-50%)' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <h2 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'clamp(24px,3.5vw,38px)', margin:'0 0 16px' }}>Ready to sync up?</h2>
          <p style={{ color:'#94a3b8', fontFamily:'DM Sans,sans-serif', fontSize:16, margin:'0 0 32px' }}>Join thousands of teams collaborating on SyncSpace</p>
          <motion.div whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }} style={{ display:'inline-block' }}>
            <Link to="/register" style={{ padding:'15px 44px', borderRadius:14, background:'linear-gradient(135deg,#6C63FF,#8B5CF6)', color:'#fff', textDecoration:'none', fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:600, boxShadow:'0 6px 28px rgba(108,99,255,0.5)', display:'inline-block' }}>
              Create Free Account →
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer */}
      <div style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'24px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
        <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:15, color:'#F8FAFC' }}>SyncSpace</span>
        <span style={{ fontSize:12, color:'#475569', fontFamily:'DM Sans,sans-serif' }}>© 2025 SyncSpace. Built with React + Node.js + Socket.io</span>
      </div>
    </div>
  );
}
