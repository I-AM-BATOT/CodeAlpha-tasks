import React, { useEffect } from 'react';

export default function Modal({ title, onClose, children, width = 520, subtitle }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', h);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, background: 'rgba(30,40,50,0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fadeIn"
        style={{
          width: '100%', maxWidth: width, maxHeight: '90vh',
          overflowY: 'auto', background: '#fff',
          borderRadius: 20, boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          border: '1px solid rgba(255,255,255,0.8)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1.5px solid #F3F4F6',
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 600, color: '#3A3B3C', margin: 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 3 }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: 8,
              border: '1.5px solid #E1E3E6', background: '#fff',
              cursor: 'pointer', fontSize: 16, color: '#6B7280',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFF0EB'; e.currentTarget.style.borderColor = '#FF7F50'; e.currentTarget.style.color = '#FF7F50'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E1E3E6'; e.currentTarget.style.color = '#6B7280'; }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: '20px 24px' }}>{children}</div>
      </div>
    </div>
  );
}