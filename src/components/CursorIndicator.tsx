import React from 'react';

interface CursorIndicatorProps {
  x: number;
  y: number;
  isClicking: boolean;
}

/**
 * CursorIndicator Component
 * 
 * Visual feedback for cursor position and state
 * Aurora-styled with glow effect
 */

const CursorIndicator: React.FC<CursorIndicatorProps> = ({
  x,
  y,
  isClicking,
}) => {
  return (
    <>
      {/* Outer glow ring */}
      <div
        className={`fixed w-12 h-12 rounded-full pointer-events-none transition-all duration-100 ${
          isClicking ? 'bg-accent-cyan/40 scale-125' : 'bg-accent-cyan/20'
        }`}
        style={{
          transform: `translate(${x - 24}px, ${y - 24}px)`,
          boxShadow: `0 0 20px ${isClicking ? '#00d9ff' : '#00d9ff'}, 0 0 40px ${isClicking ? '#00d9ff' : 'transparent'}`,
        }}
      />

      {/* Inner dot */}
      <div
        className={`fixed w-2 h-2 rounded-full pointer-events-none transition-all duration-100 ${
          isClicking ? 'bg-white' : 'bg-accent-cyan'
        }`}
        style={{
          transform: `translate(${x - 4}px, ${y - 4}px)`,
        }}
      />

      {/* Click pulse animation */}
      {isClicking && (
        <div
          className="fixed w-12 h-12 rounded-full pointer-events-none animate-ping"
          style={{
            transform: `translate(${x - 24}px, ${y - 24}px)`,
            backgroundColor: 'rgba(0, 217, 255, 0.5)',
          }}
        />
      )}
    </>
  );
};

export default CursorIndicator;
