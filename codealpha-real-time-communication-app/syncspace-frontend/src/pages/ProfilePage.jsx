import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Spinner } from '../components/ui/Spinner';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ display_name: user?.display_name||'', avatar_url: user?.avatar_url||'' });
  const [pwForm, setPwForm] = useState({ current_password:'', new_password:'' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const saveProfile = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const { data } = await authAPI.updateProfile(form);
      updateUser(data.data);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const changePw = async (e) => {
    e.preventDefault(); setSavingPw(true);
    try {
      await authAPI.changePassword(pwForm);
      toast.success('Password changed!');
      setPwForm({ current_password:'', new_password:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSavingPw(false); }
  };

  return (
    <div style={{ padding:32, maxWidth:600 }}>
      <motion.h1 initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
        style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:28, color:'#F8FAFC', marginBottom:8 }}>Profile</motion.h1>
      <p style={{ color:'#64748b', fontFamily:'DM Sans,sans-serif', fontSize:14, marginBottom:32 }}>Manage your account settings</p>

      {/* Avatar */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }}
        style={{ display:'flex', alignItems:'center', gap:20, marginBottom:32, padding:24, background:'#111827', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ width:72, height:72, borderRadius:'50%', background:'linear-gradient(135deg,#6C63FF,#8B5CF6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'#fff', fontFamily:'Syne,sans-serif', boxShadow:'0 4px 20px rgba(108,99,255,0.4)', flexShrink:0 }}>
          {user?.display_name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h2 style={{ margin:'0 0 4px', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:20, color:'#F8FAFC' }}>{user?.display_name}</h2>
          <p style={{ margin:'0 0 2px', fontSize:13, color:'#64748b', fontFamily:'DM Sans,sans-serif' }}>@{user?.username}</p>
          <p style={{ margin:0, fontSize:13, color:'#64748b', fontFamily:'DM Sans,sans-serif' }}>{user?.email}</p>
        </div>
      </motion.div>

      {/* Profile form */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.08 }}
        style={{ padding:24, background:'#111827', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)', marginBottom:20 }}>
        <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#F8FAFC', marginTop:0, marginBottom:20 }}>Edit Profile</h3>
        <form onSubmit={saveProfile} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { label:'Display Name', key:'display_name', placeholder:'Your name' },
            { label:'Avatar URL', key:'avatar_url', placeholder:'https://…' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:500, color:'#94a3b8', fontFamily:'DM Sans,sans-serif' }}>{f.label}</label>
              <input className="input-field" placeholder={f.placeholder} value={form[f.key]} onChange={e=>setForm(v=>({...v,[f.key]:e.target.value}))} />
            </div>
          ))}
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit" className="btn-primary"
            style={{ alignSelf:'flex-start', display:'flex', alignItems:'center', gap:8 }} disabled={saving}>
            {saving ? <><Spinner size={16} color="#fff" /> Saving…</> : 'Save Changes'}
          </motion.button>
        </form>
      </motion.div>

      {/* Password form */}
      <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.14 }}
        style={{ padding:24, background:'#111827', borderRadius:16, border:'1px solid rgba(255,255,255,0.07)' }}>
        <h3 style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:16, color:'#F8FAFC', marginTop:0, marginBottom:20 }}>Change Password</h3>
        <form onSubmit={changePw} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[
            { label:'Current Password', key:'current_password' },
            { label:'New Password', key:'new_password' },
          ].map(f => (
            <div key={f.key}>
              <label style={{ display:'block', marginBottom:6, fontSize:13, fontWeight:500, color:'#94a3b8', fontFamily:'DM Sans,sans-serif' }}>{f.label}</label>
              <input className="input-field" type="password" placeholder="••••••••" value={pwForm[f.key]} onChange={e=>setPwForm(v=>({...v,[f.key]:e.target.value}))} required />
            </div>
          ))}
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }} type="submit"
            style={{ alignSelf:'flex-start', padding:'10px 20px', borderRadius:10, background:'rgba(139,92,246,0.15)', border:'1px solid rgba(139,92,246,0.3)', color:'#a78bfa', fontFamily:'DM Sans,sans-serif', fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }} disabled={savingPw}>
            {savingPw ? <><Spinner size={16} color="#a78bfa" /> Updating…</> : '🔑 Update Password'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
