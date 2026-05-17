import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, clearError } from '../store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form,   setForm]   = useState({ name:'', email:'', password:'' });
  const [showPw, setShowPw] = useState(false);
  const [done,   setDone]   = useState(false);
  const [foc,    setFoc]    = useState({});

  useEffect(() => () => dispatch(clearError()), []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const r = await dispatch(register(form));
    if (!r.error) setDone(true);
  };

  const inputStyle = (key) => ({
    width:'100%', padding:'11px 14px 11px 40px',
    fontSize:14, borderRadius:10,
    border:`1.5px solid ${foc[key] ? '#FF7F50' : '#E1E3E6'}`,
    background:'#fff', color:'#3A3B3C', outline:'none',
    boxSizing:'border-box', transition:'all .15s',
    boxShadow: foc[key] ? '0 0 0 3px rgba(255,127,80,0.12)' : 'none',
    fontFamily:'inherit',
  });

  if (done) return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg,#FF7F50,#E5623A)', padding:16,
    }}>
      <div className="animate-fadeIn" style={{
        background:'#fff', borderRadius:24, padding:'40px 32px',
        textAlign:'center', maxWidth:380, width:'100%',
        boxShadow:'0 24px 64px rgba(0,0,0,0.15)',
      }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#3A3B3C', marginBottom:10 }}>Account created!</h2>
        <p style={{ fontSize:14, color:'#9CA3AF', marginBottom:24, lineHeight:1.7 }}>
          Welcome to TaskFlow Pro! You can now sign in and start managing your projects.
        </p>
        <Link to="/login" style={{
          display:'block', padding:'13px 24px',
          background:'linear-gradient(135deg,#FF7F50,#E5623A)',
          color:'#fff', borderRadius:12, fontWeight:700,
          fontSize:14, textDecoration:'none',
          boxShadow:'0 4px 16px rgba(255,127,80,0.4)',
        }}>Go to login →</Link>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg, rgb(86 27 5), rgb(212 74 24), rgb(30 9 3))', padding:16,
    }}>
      <div className="animate-fadeIn" style={{
        width:'100%', maxWidth:420, background:'#FFF8F5',
        borderRadius:24, overflow:'hidden',
        boxShadow:'0 24px 64px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          padding:'28px 28px 22px',
          background:'linear-gradient(135deg,#FF7F50,#E5623A)',
          textAlign:'center',
        }}>
          <img
            src="/logo.png" alt="logo"
            style={{ width:56, height:56, borderRadius:16, objectFit:'cover', margin:'0 auto 12px', display:'block', border:'3px solid rgba(255,255,255,0.4)', boxShadow:'0 4px 16px rgba(0,0,0,0.2)' }}
            onError={e => e.target.style.display='none'}
          />
          <h2 style={{ fontSize:20, fontWeight:800, color:'#fff', marginBottom:4 }}>Create your account</h2>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.8)' }}>Join TaskFlow Pro for free today</p>
        </div>

        {/* Form */}
        <div style={{ padding:'24px 28px' }}>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[
              { label:'Full name',     key:'name',     type:'text',     ph:'Alex Kim',           icon:'👤' },
              { label:'Email address', key:'email',    type:'email',    ph:'you@example.com',    icon:'📧' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:13, fontWeight:600, color:'#3A3B3C', display:'block', marginBottom:5 }}>{f.label}</label>
                <div style={{ position:'relative' }}>
                  <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15 }}>{f.icon}</span>
                  <input
                    type={f.type} value={form[f.key]}
                    onChange={e => setForm({...form,[f.key]:e.target.value})}
                    required placeholder={f.ph}
                    style={inputStyle(f.key)}
                    onFocus={() => setFoc({...foc,[f.key]:true})}
                    onBlur={() => setFoc({...foc,[f.key]:false})}
                  />
                </div>
              </div>
            ))}

            {/* Password with eye */}
            <div>
              <label style={{ fontSize:13, fontWeight:600, color:'#3A3B3C', display:'block', marginBottom:5 }}>Password</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:15 }}>🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({...form, password:e.target.value})}
                  required placeholder="Min. 6 characters"
                  style={{ ...inputStyle('password'), paddingRight:44 }}
                  onFocus={() => setFoc({...foc,password:true})}
                  onBlur={() => setFoc({...foc,password:false})}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                    border:'none', background:'none', cursor:'pointer',
                    fontSize:17, padding:2,
                    color: showPw ? '#FF7F50' : '#9CA3AF',
                    transition:'color .15s',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}
                  title={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              <p style={{ fontSize:11, color:'#9CA3AF', marginTop:4 }}>Must be at least 6 characters</p>
            </div>

            {error && (
              <div style={{ background:'#FFF0EB', border:'1px solid #FFD0BC', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#E5623A' }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              style={{
                width:'100%', padding:'13px',
                background:'linear-gradient(135deg,#FF7F50,#E5623A)',
                color:'#fff', border:'none', borderRadius:10,
                fontSize:14, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow:'0 4px 16px rgba(255,127,80,0.4)',
                opacity: loading ? 0.75 : 1, marginTop:4,
                transition:'all .2s',
              }}
            >{loading ? '⏳ Creating account...' : 'Create account →'}</button>
          </form>

          <p style={{ textAlign:'center', fontSize:13, color:'#9CA3AF', marginTop:16 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#FF7F50', fontWeight:700, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}