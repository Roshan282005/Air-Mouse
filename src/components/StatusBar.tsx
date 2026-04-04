import React from 'react';

interface StatusBarProps {
  gestureType: string;
  voiceActive: boolean;
  command: string;
}

const StatusBar: React.FC<StatusBarProps> = ({
  gestureType,
  voiceActive,
  command,
}) => {
  return (
    <div style={{
      position: 'fixed', top: '16px', right: '16px',
      display: 'flex', flexDirection: 'column', gap: '8px',
      padding: '12px 16px',
      background: 'rgba(0, 10, 40, 0.90)',
      border: '1px solid rgba(0, 170, 255, 0.18)',
      borderRadius: '14px',
      backdropFilter: 'blur(20px)',
      fontSize: '13px',
      fontFamily: "'Rajdhani', sans-serif",
      pointerEvents: 'auto',
      zIndex: 100,
      minWidth: '180px',
    }}>
      {/* Gesture Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: gestureType !== 'none' ? '#4ade80' : 'rgba(128,216,255,0.3)',
          boxShadow: gestureType !== 'none' ? '0 0 8px #4ade80, 0 0 16px rgba(74,222,128,0.4)' : 'none',
          animation: gestureType !== 'none' ? 'sdot 2.2s ease-in-out infinite' : 'none',
        }} />
        <span style={{ color: 'rgba(128,216,255,0.6)' }}>
          Gesture: <span style={{ color: 'var(--arc-spark)' }}>{gestureType}</span>
        </span>
      </div>

      {/* Voice Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: voiceActive ? 'var(--arc-electric)' : 'rgba(128,216,255,0.3)',
          boxShadow: voiceActive ? '0 0 8px var(--arc-electric), 0 0 16px rgba(0,170,255,0.4)' : 'none',
          animation: voiceActive ? 'sdot 2.2s ease-in-out infinite' : 'none',
        }} />
        <span style={{ color: 'rgba(128,216,255,0.6)' }}>
          Voice: <span style={{ color: voiceActive ? 'var(--arc-electric)' : 'rgba(128,216,255,0.4)' }}>
            {voiceActive ? 'Listening...' : 'Off'}
          </span>
        </span>
      </div>

      {/* Command Display */}
      {command !== 'none' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '4px 8px',
          background: 'rgba(0,170,255,0.07)',
          border: '1px solid rgba(0,170,255,0.25)',
          borderRadius: '8px',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--arc-cyan)',
            boxShadow: '0 0 6px var(--arc-cyan)',
          }} />
          <span style={{ color: 'var(--arc-cyan)', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
            {command}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
