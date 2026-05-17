import React from 'react';
import { initials, avatarColor } from '../../utils/helpers';

export default function Avatar({ user, size = 32, showOnline = false, className = '' }) {
  if (!user) return null;
  const fontSize = size < 28 ? size * 0.38 : size * 0.35;
  return (
    <div className={`relative inline-flex shrink-0 ${className}`} title={user.name}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${avatarColor(user.id)}, ${avatarColor(user.id)}CC)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize, fontWeight: 600, color: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
        border: '2px solid rgba(255,255,255,0.8)',
        flexShrink: 0,
      }}>
        {initials(user.name)}
      </div>
      {showOnline && (
        <div style={{
          position:'absolute', bottom:0, right:0,
          width: size * 0.28, height: size * 0.28,
          borderRadius:'50%', background:'#10B981',
          border:'2px solid white',
        }} />
      )}
    </div>
  );
}