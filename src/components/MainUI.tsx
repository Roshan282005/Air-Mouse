import React, { useState } from 'react';
import { useAirMouseStore } from '../store/airMouseStore';
import CursorIndicator from './CursorIndicator';
import ControlPanel from './ControlPanel';
import StatusBar from './StatusBar';

const MainUI: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const { cursorState, currentGesture, currentVoiceCommand, voiceActive } =
    useAirMouseStore();

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}>
      {/* Cursor Indicator */}
      <CursorIndicator x={cursorState.x} y={cursorState.y} isClicking={cursorState.isClicking} />

      {/* Status Bar (top-right) */}
      <StatusBar
        gestureType={currentGesture.type}
        voiceActive={voiceActive}
        command={currentVoiceCommand.command}
      />

      {/* Control Panel Toggle (bottom-left) */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        style={{
          position: 'fixed', bottom: '16px', left: '16px',
          pointerEvents: 'auto',
          width: '56px', height: '56px',
          borderRadius: '50%',
          background: 'rgba(0, 10, 40, 0.86)',
          border: '1px solid rgba(0, 170, 255, 0.18)',
          backdropFilter: 'blur(20px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.22s',
          zIndex: 100,
          boxShadow: '0 0 20px rgba(0,170,255,0.15)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget).style.borderColor = 'var(--arc-electric)';
          (e.currentTarget).style.boxShadow = '0 0 30px rgba(0,170,255,0.3)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget).style.borderColor = 'rgba(0, 170, 255, 0.18)';
          (e.currentTarget).style.boxShadow = '0 0 20px rgba(0,170,255,0.15)';
        }}
        aria-label="Open control panel"
      >
        {/* Gear icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(128,216,255,0.6)" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </button>

      {/* Control Panel */}
      {showPanel && (
        <div style={{ position: 'fixed', bottom: '84px', left: '16px', pointerEvents: 'auto', zIndex: 100 }}>
          <ControlPanel onClose={() => setShowPanel(false)} />
        </div>
      )}

      {/* Debug Info */}
      <div style={{
        position: 'fixed', top: '16px', left: '16px',
        background: 'rgba(0, 10, 40, 0.86)',
        border: '1px solid rgba(0, 170, 255, 0.18)',
        borderRadius: '10px',
        padding: '8px 12px',
        fontSize: '10px',
        fontFamily: "'JetBrains Mono', monospace",
        color: 'rgba(128,216,255,0.45)',
        pointerEvents: 'auto',
        display: 'flex', flexDirection: 'column', gap: '4px',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
      }}>
        <p>X: <span style={{ color: 'var(--arc-electric)' }}>{cursorState.x}</span>, Y: <span style={{ color: 'var(--arc-electric)' }}>{cursorState.y}</span></p>
        <p>Gesture: <span style={{ color: currentGesture.type !== 'none' ? '#4ade80' : 'rgba(128,216,255,0.3)' }}>{currentGesture.type}</span></p>
        <p>Voice: <span style={{ color: voiceActive ? 'var(--arc-cyan)' : 'rgba(128,216,255,0.3)' }}>{currentVoiceCommand.command}</span></p>
      </div>
    </div>
  );
};

export default MainUI;
