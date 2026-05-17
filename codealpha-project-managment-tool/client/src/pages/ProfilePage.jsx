import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateProfile, logout } from '../store/slices/authSlice';
import { authAPI } from '../api/auth.api';
import { initials, avatarColor } from '../utils/helpers';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);

  const [form, setForm]   = useState({ name: user?.name || '', email: user?.email || '' });
  const [pw, setPw]       = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving]     = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pMsg, setPMsg]   = useState({ text:'', type:'' });
  const [wMsg, setWMsg]   = useState({ text:'', type:'' });

  const msg = (m) => m.type === 'success'
    ? { background:'#ECFDF5', border:'1px solid #A7F3D0', color:'#065F46', borderRadius:8, padding:'10px 14px', fontSize:13, marginTop:6 }
    : { background:'#FFF0EB', border:'1px solid #FFD0BC', color:'#E5623A', borderRadius:8, padding:'10px 14px', fontSize:13, marginTop:6 };

  const inputStyle = (focused) => ({
    width:'100%', padding:'10px 14px', fontSize:14, borderRadius:10,
    border:`1.5px solid ${focused ? '#008B8B' : '#E1E3E6'}`,
    background:'#fff', color:'#3A3B3C', outline:'none',
    boxSizing:'border-box', transition:'border-color .15s',
    boxShadow: focused ? '0 0 0 3px rgba(0,139,139,0.12)' : 'none',
    fontFamily:'inherit',
  });

  const [foc, setFoc] = useState({});

  const saveProfile = async () => {
    setSaving(true); setPMsg({text:'',type:''});
    const r = await dispatch(updateProfile(form));
    setSaving(false);
    if (r.error) setPMsg({ text: r.payload || 'Update failed', type:'error' });
    else setPMsg({ text:'Profile updated successfully!', type:'success' });
  };

  const savePassword = async () => {
    if (pw.next !== pw.confirm) { setWMsg({text:'Passwords do not match',type:'error'}); return; }
    if (pw.next.length < 6)     { setWMsg({text:'Min. 6 characters required',type:'error'}); return; }
    setPwSaving(true); setWMsg({text:'',type:''});
    try {
      await authAPI.changePassword({ currentPassword: pw.current, newPassword: pw.next });
      setWMsg({text:'Password changed successfully!',type:'success'});
      setPw({current:'',next:'',confirm:''});
    } catch(e) {
      setWMsg({text: e.response?.data?.message||'Failed',type:'error'});
    } finally { setPwSaving(false); }
  };

  const Card = ({ children, title, icon }) => (
    <div style={{
      background:'#fff', borderRadius:16, overflow:'hidden',
      border:'1.5px solid #E1E3E6', marginBottom:16,
      boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        padding:'14px 20px', borderBottom:'1.5px solid #F3F4F6',
        display:'flex', alignItems:'center', gap:10,
        background:'linear-gradient(135deg,#F5F7FA,#fff)',
      }}>
        <span style={{ fontSize:18 }}>{icon}</span>
        <h3 style={{ fontSize:15, fontWeight:700, color:'#3A3B3C', margin:0 }}>{title}</h3>
      </div>
      <div style={{ padding:'20px' }}>{children}</div>
    </div>
  );

  return (
    <div style={{ maxWidth:720, margin:'0 auto', padding:'28px 20px' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
        <button onClick={() => navigate('/')} style={{
          width:36, height:36, borderRadius:10, border:'1.5px solid #E1E3E6',
          background:'#fff', cursor:'pointer', fontSize:16, display:'flex',
          alignItems:'center', justifyContent:'center',
        }}>←</button>
        <div>
          <h2 style={{ fontSize:20, fontWeight:800, color:'#3A3B3C', margin:0 }}>My Profile</h2>
          <p style={{ fontSize:12, color:'#9CA3AF', margin:0 }}>Manage your account settings</p>
        </div>
      </div>

      {/* Avatar banner */}
      <div style={{
        background:'linear-gradient(135deg,#008B8B,#006F6F)',
        borderRadius:16, padding:'24px 24px', marginBottom:16,
        display:'flex', alignItems:'center', gap:18,
      }}>
        <div style={{
          width:72, height:72, borderRadius:'50%', flexShrink:0,
          background:`linear-gradient(135deg,${avatarColor(user?.id||0)},${avatarColor(user?.id||0)}BB)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:26, fontWeight:700, color:'#fff',
          border:'3px solid rgba(255,255,255,0.3)',
          boxShadow:'0 4px 16px rgba(0,0,0,0.2)',
        }}>{initials(user?.name)}</div>
        <div>
          <p style={{ fontSize:20, fontWeight:800, color:'#fff', marginBottom:4 }}>{user?.name}</p>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.7)', marginBottom:8 }}>{user?.email}</p>
          <span style={{
            fontSize:11, background:'rgba(255,255,255,0.2)',
            color:'#fff', padding:'3px 10px', borderRadius:99,
            fontWeight:600, border:'1px solid rgba(255,255,255,0.3)',
          }}>✓ Active member</span>
        </div>
      </div>

      {/* Edit profile */}
      <Card title="Edit profile" icon="👤">
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {[{label:'Full name',key:'name',type:'text',ph:'Your name'},{label:'Email address',key:'email',type:'email',ph:'your@email.com'}].map(f=>(
            <div key={f.key}>
              <label style={{fontSize:13,fontWeight:500,color:'#3A3B3C',display:'block',marginBottom:5}}>{f.label}</label>
              <input
                type={f.type} value={form[f.key]}
                onChange={e=>setForm({...form,[f.key]:e.target.value})}
                placeholder={f.ph}
                style={inputStyle(foc[f.key])}
                onFocus={()=>setFoc({...foc,[f.key]:true})}
                onBlur={()=>setFoc({...foc,[f.key]:false})}
              />
            </div>
          ))}
          {pMsg.text && <div style={msg(pMsg)}>{pMsg.type==='success'?'✅':'⚠'} {pMsg.text}</div>}
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button onClick={saveProfile} disabled={saving} style={{
              padding:'10px 22px', borderRadius:10,
              background:'linear-gradient(135deg,#008B8B,#00AFAF)',
              color:'#fff', border:'none', fontSize:13, fontWeight:600,
              cursor:saving?'not-allowed':'pointer',
              boxShadow:'0 4px 12px rgba(0,139,139,0.3)', opacity:saving?0.7:1,
            }}>{saving?'Saving...':'Save changes'}</button>
          </div>
        </div>
      </Card>

      {/* Change password */}
      <Card title="Change password" icon="🔒">
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          {[{label:'Current password',key:'current',ph:'Your current password'},{label:'New password',key:'next',ph:'Min. 6 characters'},{label:'Confirm new password',key:'confirm',ph:'Repeat new password'}].map(f=>(
            <div key={f.key}>
              <label style={{fontSize:13,fontWeight:500,color:'#3A3B3C',display:'block',marginBottom:5}}>{f.label}</label>
              <input
                type="password" value={pw[f.key]}
                onChange={e=>setPw({...pw,[f.key]:e.target.value})}
                placeholder={f.ph}
                style={inputStyle(foc['pw'+f.key])}
                onFocus={()=>setFoc({...foc,['pw'+f.key]:true})}
                onBlur={()=>setFoc({...foc,['pw'+f.key]:false})}
              />
            </div>
          ))}
          {wMsg.text && <div style={msg(wMsg)}>{wMsg.type==='success'?'✅':'⚠'} {wMsg.text}</div>}
          <div style={{display:'flex',justifyContent:'flex-end'}}>
            <button onClick={savePassword} disabled={pwSaving} style={{
              padding:'10px 22px',borderRadius:10,
              background:'linear-gradient(135deg,#008B8B,#00AFAF)',
              color:'#fff',border:'none',fontSize:13,fontWeight:600,
              cursor:pwSaving?'not-allowed':'pointer',
              boxShadow:'0 4px 12px rgba(0,139,139,0.3)',opacity:pwSaving?0.7:1,
            }}>{pwSaving?'Changing...':'Change password'}</button>
          </div>
        </div>
      </Card>

      {/* Sign out */}
      <div style={{
        background:'#fff',borderRadius:16,border:'1.5px solid #FFD0BC',
        padding:'20px',display:'flex',alignItems:'center',
        justifyContent:'space-between',gap:16,flexWrap:'wrap',
        boxShadow:'0 2px 8px rgba(255,127,80,0.06)',
      }}>
        <div>
          <p style={{fontSize:14,fontWeight:700,color:'#FF7F50',marginBottom:3}}>Sign out</p>
          <p style={{fontSize:12,color:'#9CA3AF'}}>Sign out of your account on this device</p>
        </div>
        <button onClick={async()=>{await dispatch(logout());navigate('/login');}} style={{
          padding:'9px 20px',borderRadius:10,
          background:'linear-gradient(135deg,#FF7F50,#E5623A)',
          color:'#fff',border:'none',fontSize:13,fontWeight:600,
          cursor:'pointer',boxShadow:'0 4px 12px rgba(255,127,80,0.35)',
          whiteSpace:'nowrap',
        }}>🚪 Sign out</button>
      </div>
    </div>
  );
}