import React from 'react';

export default function Spinner({ size = 36, text = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', minHeight: 200, gap: 14,
    }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        border: `3px solid #E1E3E6`,
        borderTopColor: '#008B8B',
        animation: 'spin .7s linear infinite',
      }} />
      {text && <p style={{ fontSize: 13, color: '#9CA3AF', fontWeight: 500 }}>{text}</p>}
    </div>
  );
}