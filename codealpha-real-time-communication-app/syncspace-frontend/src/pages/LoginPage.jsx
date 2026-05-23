import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative', overflow: 'hidden' }}>
      {/* Orbs */}
      <div className="orb" style={{ width: 500, height: 500, background: 'rgba(108,99,255,0.12)', top: -150, left: -150 }} />
      <div className="orb" style={{ width: 400, height: 400, background: 'rgba(0,212,255,0.08)', bottom: -100, right: -100 }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: 440, background: 'rgba(22,29,51,0.8)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 40, boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.div whileHover={{ scale: 1.05 }} style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg,#6C63FF,#00D4FF)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 8px 30px rgba(108,99,255,0.4)' }}>
            <span style={{ fontSize: 24, color: '#fff', fontWeight: 800 }}>S</span>
          </motion.div>
          <h1 style={{ fontFamily: 'Syne,sans-serif', fontWeight: 800, fontSize: 28, color: '#F8FAFC', margin: '0 0 8px' }}>Welcome back</h1>
          <p style={{ color: '#64748b', fontFamily: 'DM Sans,sans-serif', fontSize: 14, margin: 0 }}>Sign in to your SyncSpace account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[{ label: 'Email', key: 'email', type: 'email', placeholder: 'you@example.com' },
            { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' }].map(field => (
            <div key={field.key}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#94a3b8', fontFamily: 'DM Sans,sans-serif' }}>{field.label}</label>
              <motion.input whileFocus={{ scale: 1.01 }} className="input-field" type={field.type} placeholder={field.placeholder}
                value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))} required />
            </div>
          ))}

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
            className="btn-primary" style={{ width: '100%', fontSize: 15, marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Spinner size={18} color="#fff" /> Signing in…</> : 'Sign In'}
          </motion.button>
        </form>

        {/* Demo hint */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ marginTop: 20, padding: '12px 16px', background: 'rgba(108,99,255,0.08)', border: '1px solid rgba(108,99,255,0.15)', borderRadius: 10 }}>
          <p style={{ margin: 0, fontSize: 12, color: '#a49cf9', fontFamily: 'DM Sans,sans-serif' }}>
            <strong>Demo:</strong> Register first, then login with your credentials.
          </p>
        </motion.div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b', fontFamily: 'DM Sans,sans-serif' }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#6C63FF', textDecoration: 'none', fontWeight: 600 }}>Create one →</Link>
        </p>
      </motion.div>
    </div>
  );
}
