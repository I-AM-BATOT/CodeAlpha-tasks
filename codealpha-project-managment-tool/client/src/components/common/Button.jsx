import React from 'react';

const variants = {
  primary: {
    background: 'linear-gradient(135deg, #FF7F50, #E5623A)',
    color: '#fff', border: 'none',
    boxShadow: '0 4px 14px rgba(255,127,80,0.4)',
  },
  secondary: {
    background: '#fff', color: '#FF7F50',
    border: '1.5px solid #FF7F50', boxShadow: 'none',
  },
  danger: {
    background: 'linear-gradient(135deg,#E53E3E,#C53030)',
    color: '#fff', border: 'none',
    boxShadow: '0 4px 12px rgba(229,62,62,0.3)',
  },
  ghost: {
    background: 'transparent', color: '#6B7280',
    border: '1.5px solid #E1E3E6', boxShadow: 'none',
  },
  teal: {
    background: 'linear-gradient(135deg,#008B8B,#00AFAF)',
    color: '#fff', border: 'none',
    boxShadow: '0 4px 12px rgba(0,139,139,0.3)',
  },
};

export default function Button({
  children, onClick, variant = 'ghost',
  type = 'button', disabled, className = '',
  size = 'md', fullWidth = false, icon,
}) {
  const sizes = {
    sm: { fontSize:12, padding:'5px 12px', borderRadius:8 },
    md: { fontSize:13, padding:'8px 18px', borderRadius:10 },
    lg: { fontSize:15, padding:'11px 24px', borderRadius:12 },
  };
  const s = sizes[size];
  const v = variants[variant] || variants.ghost;

  return (
    <button
      type={type} onClick={onClick} disabled={disabled} className={className}
      style={{
        ...v, ...s,
        width: fullWidth ? '100%' : undefined,
        display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: 6, fontWeight: 500,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all .18s ease', whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {icon && <span style={{ fontSize: s.fontSize + 2 }}>{icon}</span>}
      {children}
    </button>
  );
}