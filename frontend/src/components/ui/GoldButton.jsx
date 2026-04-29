import React from 'react';

const T = {
  ink: '#0E0B06',
  gold: '#B8872A',
  goldLt: '#E8C56A',
};

export default function GoldButton({ children, onClick, variant = 'primary', ...props }) {
  const baseStyle = {
    padding: '12px 24px',
    borderRadius: '10px',
    fontFamily: "'Syne', sans-serif",
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: 'none',
  };

  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${T.gold}, ${T.goldLt})`,
      color: T.ink,
    },
    dark: {
      background: T.ink,
      color: '#FFF',
    },
    outline: {
      background: 'transparent',
      border: `1px solid ${T.gold}`,
      color: T.gold,
    }
  };

  return (
    <button 
      style={{ ...baseStyle, ...variants[variant] }} 
      onClick={onClick}
      onMouseEnter={(e) => e.target.style.transform = 'scale(0.98)'}
      onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
      {...props}
    >
      {children}
    </button>
  );
}