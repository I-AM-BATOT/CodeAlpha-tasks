import React, { useState } from 'react';

export default function Input({
  label, type = 'text', value, onChange,
  placeholder, required, error, icon, hint,
  rows, textarea = false,
}) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: '100%', fontSize: 14, padding: '10px 14px',
    borderRadius: 10, border: `1.5px solid ${error ? '#FF7F50' : focused ? '#008B8B' : '#E1E3E6'}`,
    background: '#fff', color: '#3A3B3C',
    transition: 'border-color .15s, box-shadow .15s',
    boxShadow: focused ? '0 0 0 3px rgba(0,139,139,0.12)' : 'none',
    outline: 'none', resize: textarea ? 'vertical' : undefined,
    paddingLeft: icon ? 38 : 14,
    fontFamily: 'inherit',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 500, color: '#3A3B3C' }}>
          {label}{required && <span style={{ color: '#FF7F50', marginLeft: 2 }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', fontSize: 15,
            color: focused ? '#008B8B' : '#9CA3AF', pointerEvents: 'none',
          }}>
            {icon}
          </span>
        )}
        {textarea ? (
          <textarea
            value={value} onChange={onChange} placeholder={placeholder}
            required={required} rows={rows || 3}
            style={base}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        ) : (
          <input
            type={type} value={value} onChange={onChange}
            placeholder={placeholder} required={required}
            style={base}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        )}
      </div>
      {hint  && !error && <p style={{ fontSize: 11, color: '#9CA3AF' }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: '#FF7F50', display:'flex', alignItems:'center', gap:4 }}>⚠ {error}</p>}
    </div>
  );
}