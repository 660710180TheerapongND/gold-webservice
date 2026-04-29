import React from 'react';

export default function LuxuryCard({ title, subtitle, children, style }) {
  return (
    <div style={{
      background: '#FDFAF4',
      border: '1px solid rgba(200,146,42,0.15)',
      borderRadius: '16px',
      padding: '1.75rem',
      position: 'relative',
      overflow: 'hidden',
      ...style
    }}>
      {title && (
        <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', margin: 0 }}>{title}</h3>
          {subtitle && <p style={{ fontSize: '11px', color: '#C8C0AA', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}