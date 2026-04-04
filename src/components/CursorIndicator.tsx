import React from 'react';

interface CursorIndicatorProps {
  x: number;
  y: number;
  isClicking: boolean;
}

const CursorIndicator: React.FC<CursorIndicatorProps> = ({
  x,
  y,
  isClicking,
}) => {
  return (
    <>
      {/* Outer aura glow - electric blue radial */}
      <div
        className="pointer-events-none"
        style={{
          position: 'fixed',
          width: isClicking ? '64px' : '48px',
          height: isClicking ? '64px' : '48px',
          borderRadius: '50%',
          zIndex: 1000,
          background: `radial-gradient(circle at center,
            rgba(184,238,255,${isClicking ? '0.6' : '0.4'}) 0%,
            rgba(0,170,255,${isClicking ? '0.5' : '0.3'}) 30%,
            rgba(0,51,170,${isClicking ? '0.3' : '0.2'}) 60%,
            transparent 80%
          )`,
          filter: 'blur(8px)',
          transform: `translate(${x - (isClicking ? 32 : 24)}px, ${y - (isClicking ? 32 : 24)}px)`,
          transition: 'all 0.15s ease-out',
          animation: 'auraPulse 2s infinite ease-in-out',
        }}
      />

      {/* Rotating ring */}
      <div
        className="pointer-events-none"
        style={{
          position: 'fixed',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          zIndex: 999,
          border: `1.5px solid ${isClicking ? 'rgba(26,200,255,0.8)' : 'rgba(0,170,255,0.5)'}`,
          transform: `translate(${x - 16}px, ${y - 16}px)`,
          transition: 'all 0.1s ease-out',
          animation: 'spinr 3s linear infinite',
        }}
      />

      {/* Inner bright dot */}
      <div
        className="pointer-events-none"
        style={{
          position: 'fixed',
          width: isClicking ? '12px' : '8px',
          height: isClicking ? '12px' : '8px',
          borderRadius: '50%',
          zIndex: 1001,
          background: `radial-gradient(circle, ${isClicking ? '#EEF8FF' : 'var(--arc-white)'} 0%, var(--arc-spark) 50%, transparent 100%)`,
          transform: `translate(${x - (isClicking ? 6 : 4)}px, ${y - (isClicking ? 6 : 4)}px)`,
          transition: 'all 0.05s ease-out',
          boxShadow: isClicking
            ? '0 0 12px rgba(238,248,255,0.9), 0 0 24px rgba(0,170,255,0.6)'
            : '0 0 8px rgba(0,170,255,0.6)',
        }}
      />

      {/* Click pulse animation */}
      {isClicking && (
        <div
          className="pointer-events-none"
          style={{
            position: 'fixed',
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            zIndex: 998,
            border: '2px solid rgba(0,170,255,0.5)',
            transform: `translate(${x - 32}px, ${y - 32}px)`,
            animation: 'clickPulse 0.6s ease-out forwards',
          }}
        />
      )}
    </>
  );
};

export default CursorIndicator;
