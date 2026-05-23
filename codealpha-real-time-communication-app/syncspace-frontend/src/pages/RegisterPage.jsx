import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username:'', email:'', password:'', display_name:'' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const fields = [
    { label:'Display Name', key:'display_name', type:'text', placeholder:'John Doe' },
    { label:'Username', key:'username', type:'text', placeholder:'johndoe' },
    { label:'Email', key:'email', type:'email', placeholder:'you@example.com' },
    { label:'Password', key:'password', type:'password', placeholder:'Min 6 characters' },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#0F172A', display:'flex', alignItems:'center', justifyContent:'center', padding:24, position:'relative', overflow:'hidden' }}>
      <div className="orb" style={{ width:500, height:500, background:'rgba(139,92,246,0.1)', top:-100, right:-150 }} />
      <div className="orb" style={{ width:400, height:400, background:'rgba(0,212,255,0.07)', bottom:-100, left:-100 }} />

      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
        style={{ width:'100%', maxWidth:440, background:'rgba(22,29,51,0.85)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:24, padding:40, boxShadow:'0 24px 80px rgba(0,0,0,0.5)' }}>

        <div style={{ textAlign:'center', marginBottom:32 }}>
          <motion.div whileHover={{ scale:1.05 }} style={{ width:56, height:56, borderRadius:16, background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', boxShadow:'0 8px 30px rgba(139,92,246,0.4)' }}>
            <span style={{ fontSize:24, color:'#fff', fontWeight:800 }}>S</span>
          </motion.div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#F8FAFC', margin:'0 0 8px' }}>Create account</h1>
          <p style={{ color:'#64748b', fontFamily:'DM Sans,sans-serif', fontSize:14, margin:0 }}>Join SyncSpace today</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {fields.map((field, i) => (
            <motion.div key={field.key} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.05 }}>
              <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:500, color:'#94a3b8', fontFamily:'DM Sans,sans-serif' }}>{field.label}</label>
              <input className="input-field" type={field.type} placeholder={field.placeholder}
                value={form[field.key]} onChange={e => setForm(f => ({...f, [field.key]: e.target.value}))} required={field.key !== 'display_name'} />
            </motion.div>
          ))}

          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit" disabled={loading}
            className="btn-primary" style={{ width:'100%', fontSize:15, marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            {loading ? <><Spinner size={18} color="#fff" /> Creating…</> : 'Create Account'}
          </motion.button>
        </form>

        <p style={{ textAlign:'center', marginTop:24, fontSize:14, color:'#64748b', fontFamily:'DM Sans,sans-serif' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color:'#8B5CF6', textDecoration:'none', fontWeight:600 }}>Sign in →</Link>
        </p>
      </motion.div>
    </div>
  );
}
