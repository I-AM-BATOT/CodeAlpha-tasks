import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login, clearError } from '../store/slices/authSlice';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, token } = useSelector(s => s.auth);
  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [foc,    setFoc]    = useState({});

  useEffect(() => { if (token) navigate('/'); }, [token]);
  useEffect(() => () => dispatch(clearError()), []);

  const handleSubmit = (e) => { e.preventDefault(); dispatch(login(form)); };

  const inputStyle = (key) => ({
    width: '100%', padding: '11px 14px 11px 40px',
    fontSize: 14, borderRadius: 10,
    border: `1.5px solid ${foc[key] ? '#FF7F50' : '#E1E3E6'}`,
    background: '#fff', color: '#3A3B3C', outline: 'none',
    boxSizing: 'border-box', transition: 'all .15s',
    boxShadow: foc[key] ? '0 0 0 3px rgba(255,127,80,0.12)' : 'none',
    fontFamily: 'inherit',
  });

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #FF7F50 0%, #FF6B35 50%, #E5623A 100%)',
    }}>
      {/* Left decorative panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px', color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background circles */}
        <div style={{ position:'absolute',top:-80,left:-80,width:300,height:300,borderRadius:'50%',background:'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute',bottom:-60,right:-40,width:200,height:200,borderRadius:'50%',background:'rgba(255,255,255,0.06)' }} />
        <div style={{ position:'absolute',top:'40%',right:40,width:100,height:100,borderRadius:'50%',background:'rgba(255,255,255,0.04)' }} />

        <div style={{ position: 'relative', maxWidth: 400 }}>
          {/* App logo */}
          <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:32 }}>
            <img
              src="/logo.png" alt="TaskFlow Pro"
              style={{ width:64, height:64, borderRadius:18, objectFit:'cover', border:'3px solid rgba(255,255,255,0.4)', boxShadow:'0 8px 24px rgba(0,0,0,0.2)' }}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
            />
            <div style={{
              width:64, height:64, borderRadius:18,
              background:'rgba(255,255,255,0.2)',
              display:'none', alignItems:'center', justifyContent:'center',
              fontSize:22, fontWeight:800, color:'#fff',
              border:'3px solid rgba(255,255,255,0.4)',
            }}>TF</div>
            <div>
              <p style={{ fontSize:22, fontWeight:800, color:'#fff' }}>TaskFlow</p>
              <p style={{ fontSize:12, color:'rgba(255,255,255,0.75)', fontWeight:600, letterSpacing:2 }}>PRO</p>
            </div>
          </div>

          <h1 style={{ fontSize:36, fontWeight:800, marginBottom:14, lineHeight:1.2, color:'#fff' }}>
            Manage projects<br />like a pro. 🚀
          </h1>
          <p style={{ fontSize:15, opacity:0.85, lineHeight:1.8, marginBottom:36, color:'#fff' }}>
            Real-time collaboration, smart task tracking, and powerful Kanban boards — all in one place.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {['✅ Real-time team collaboration','📋 Drag & drop Kanban boards','🔔 Smart notifications','🔒 Secure JWT authentication','👥 Project member management'].map(f => (
              <div key={f} style={{
                display:'flex', alignItems:'center', gap:10,
                fontSize:13, color:'rgba(255,255,255,0.9)',
                background:'rgba(255,255,255,0.1)',
                padding:'8px 14px', borderRadius:8,
                backdropFilter:'blur(4px)',
                border:'1px solid rgba(255,255,255,0.15)',
              }}>{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div style={{
        width:'100%', maxWidth:460,
        display:'flex', flexDirection:'column',
        alignItems:'center', justifyContent:'center',
        padding:'32px 28px',
        background:'#FFF8F5',
        boxShadow:'-20px 0 60px rgba(0,0,0,0.1)',
      }}>
        <div style={{ width:'100%', maxWidth:380 }}>

          {/* Form header */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <img
              src="/logo.png" alt="logo"
              style={{ width:56, height:56, borderRadius:16, objectFit:'cover', margin:'0 auto 14px', display:'block', boxShadow:'0 6px 20px rgba(255,127,80,0.3)', border:'2px solid #FFD0BC' }}
              onError={e => { e.target.style.display='none'; }}
            />
            <h2 style={{ fontSize:22, fontWeight:800, color:'#3A3B3C', marginBottom:6 }}>Welcome back!</h2>
            <p style={{ fontSize:13, color:'#9CA3AF' }}>Sign in to your workspace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Email */}
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:'#3A3B3C', display:'block', marginBottom:5 }}>Email address</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15 }}>📧</span>
                <input
                  type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required placeholder="you@example.com"
                  style={inputStyle('email')}
                  onFocus={() => setFoc({...foc, email:true})}
                  onBlur={() => setFoc({...foc, email:false})}
                />
              </div>
            </div>

            {/* Password with eye toggle */}
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:'#3A3B3C', display:'block', marginBottom:5 }}>Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15 }}>🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required placeholder="Enter your password"
                  style={{ ...inputStyle('password'), paddingRight:44 }}
                  onFocus={() => setFoc({...foc, password:true})}
                  onBlur={() => setFoc({...foc, password:false})}
                />
                {/* Eye toggle button */}
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    border:'none', background:'none', cursor:'pointer',
                    fontSize:17, padding:2, borderRadius:4,
                    color: showPw ? '#FF7F50' : '#9CA3AF',
                    transition:'color .15s',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background:'#FFF0EB', border:'1px solid #FFD0BC',
                borderRadius:8, padding:'10px 14px',
                fontSize:13, color:'#E5623A',
                display:'flex', alignItems:'center', gap:6,
              }}>⚠ {error}</div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width:'100%', padding:'13px',
                background: loading ? '#FFD0BC' : 'linear-gradient(135deg,#FF7F50,#E5623A)',
                color:'#fff', border:'none', borderRadius:10,
                fontSize:15, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 16px rgba(255,127,80,0.45)',
                transition:'all .2s', marginTop:4,
                letterSpacing:0.3,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform='translateY(-1px)'; e.currentTarget.style.boxShadow='0 6px 20px rgba(255,127,80,0.5)'; }}}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(255,127,80,0.45)'; }}
            >
              {loading ? '⏳ Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'#9CA3AF', marginTop:20 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'#FF7F50', fontWeight:700, textDecoration:'none' }}>
              Create one free →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}