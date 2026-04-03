import React from 'react';

interface StatusBarProps {
  gestureType: string;
  voiceActive: boolean;
  command: string;
}

/**
 * StatusBar Component
 * 
 * Real-time display of active input modes
 */

const StatusBar: React.FC<StatusBarProps> = ({
  gestureType,
  voiceActive,
  command,
}) => {
  return (
    <div className="fixed top-4 right-4 glass-dark px-4 py-3 rounded-lg space-y-2 text-sm pointer-events-auto">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${gestureType !== 'none' ? 'bg-green-400' : 'bg-gray-500'}`} />
        <span>Gesture: {gestureType}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${voiceActive ? 'bg-green-400 animate-pulse' : 'bg-gray-500'}`} />
        <span>Voice: {voiceActive ? 'Listening...' : 'Off'}</span>
      </div>

      {command !== 'none' && (
        <div className="flex items-center gap-2 text-accent-cyan">
          <span className="w-2 h-2 rounded-full bg-accent-cyan" />
          <span>Command: {command}</span>
        </div>
      )}
    </div>
  );
};

export default StatusBar;
