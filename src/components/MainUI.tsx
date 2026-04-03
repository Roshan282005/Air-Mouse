import React, { useState } from 'react';
import { useAirMouseStore } from '../store/airMouseStore';
import CursorIndicator from './CursorIndicator';
import ControlPanel from './ControlPanel';
import StatusBar from './StatusBar';

/**
 * MainUI Component
 * 
 * Aurora/glassmorphism design with:
 * - Real-time cursor position indicator
 * - Control panel for settings
 * - Status bar showing input states
 */

const MainUI: React.FC = () => {
  const [showPanel, setShowPanel] = useState(false);
  const { cursorState, currentGesture, currentVoiceCommand, voiceActive } =
    useAirMouseStore();

  return (
    <div className="fixed inset-0 pointer-events-none">
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
        className="fixed bottom-4 left-4 pointer-events-auto w-14 h-14 rounded-full glass-dark flex items-center justify-center hover:bg-white/20 transition z-50"
        aria-label="Open control panel"
      >
        <span className="text-xl">⚙️</span>
      </button>

      {/* Control Panel */}
      {showPanel && (
        <div className="fixed bottom-20 left-4 pointer-events-auto z-50">
          <ControlPanel onClose={() => setShowPanel(false)} />
        </div>
      )}

      {/* Debug Info (optional) */}
      <div className="fixed top-4 left-4 glass-dark px-3 py-2 rounded text-xs text-gray-400 pointer-events-auto">
        <p>X: {cursorState.x}, Y: {cursorState.y}</p>
        <p>Gesture: {currentGesture.type}</p>
        <p>Voice: {currentVoiceCommand.command}</p>
      </div>
    </div>
  );
};

export default MainUI;
