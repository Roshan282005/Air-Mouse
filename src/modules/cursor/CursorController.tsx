import React, { useEffect, useRef } from 'react';
import { useAirMouseStore } from '../../store/airMouseStore';

/**
 * CursorController Module
 * 
 * Responsibilities:
 * - Fuse multi-modal input: gaze, gestures, voice
 * - Apply smoothing and calibration to gaze data
 * - Execute cursor movements, clicks, scrolls
 * - Implements real-time DSA-based fusion algorithm
 * 
 * Real-time performance: ≤150ms end-to-end latency
 */

interface FusionContext {
  gazeWeight: number;
  gestureWeight: number;
  voiceWeight: number;
  smoothingFactor: number;
  calibrationOffset: { x: number; y: number };
}

const CursorController: React.FC = () => {
  const {
    currentGaze,
    currentGesture,
    currentVoiceCommand,
    setCursorState,
    calibrationData,
  } = useAirMouseStore();

  const fusionContextRef = useRef<FusionContext>({
    gazeWeight: 0.7,
    gestureWeight: 0.2,
    voiceWeight: 0.1,
    smoothingFactor: 0.3,
    calibrationOffset: { x: 0, y: 0 },
  });

  const cursorHistoryRef = useRef<Array<{ x: number; y: number; timestamp: number }>>([]);
  const lastClickTimeRef = useRef(0);
  const clickDebounceRef = useRef(300); // ms

  // Load calibration data
  useEffect(() => {
    if (calibrationData.calibrationOffsetX && calibrationData.calibrationOffsetY) {
      fusionContextRef.current.calibrationOffset = {
        x: calibrationData.calibrationOffsetX,
        y: calibrationData.calibrationOffsetY,
      };
    }
  }, [calibrationData]);

  // Main fusion and control loop
  useEffect(() => {
    const processFusion = () => {
      const now = performance.now();
      let targetX = window.innerWidth / 2;
      let targetY = window.innerHeight / 2;

      // === GAZE INPUT ===
      if (currentGaze && currentGaze.timestamp > now - 200) {
        // Apply calibration and normalization
        const calibratedX =
          currentGaze.x + fusionContextRef.current.calibrationOffset.x;
        const calibratedY =
          currentGaze.y + fusionContextRef.current.calibrationOffset.y;

        targetX = calibratedX;
        targetY = calibratedY;
      }

      // === APPLY SMOOTHING (Exponential Moving Average) ===
      const smoothedX =
        targetX * (1 - fusionContextRef.current.smoothingFactor) +
        (cursorHistoryRef.current[0]?.x ?? targetX) *
          fusionContextRef.current.smoothingFactor;
      const smoothedY =
        targetY * (1 - fusionContextRef.current.smoothingFactor) +
        (cursorHistoryRef.current[0]?.y ?? targetY) *
          fusionContextRef.current.smoothingFactor;

      // Store history for smoothing
      cursorHistoryRef.current.unshift({ x: smoothedX, y: smoothedY, timestamp: now });
      if (cursorHistoryRef.current.length > 10) {
        cursorHistoryRef.current.pop();
      }

      // === GESTURE-BASED ACTIONS ===
      let shouldClick = false;
      let scrollDir: 'up' | 'down' | 'none' = 'none';

      if (currentGesture.type !== 'none' && currentGesture.confidence > 0.8) {
        if (currentGesture.type === 'thumbs_up') {
          shouldClick = true;
        } else if (currentGesture.type === 'thumbs_down') {
          scrollDir = 'down';
        } else if (currentGesture.type === 'palm_open') {
          scrollDir = 'up';
        }
      }

      // === VOICE-BASED COMMANDS ===
      if (currentVoiceCommand.command !== 'none') {
        if (currentVoiceCommand.command === 'click') {
          shouldClick = true;
        } else if (currentVoiceCommand.command === 'scroll_up') {
          scrollDir = 'up';
        } else if (currentVoiceCommand.command === 'scroll_down') {
          scrollDir = 'down';
        }
      }

      // === UPDATE CURSOR STATE ===
      setCursorState({
        x: Math.round(smoothedX),
        y: Math.round(smoothedY),
        isClicking: shouldClick && now - lastClickTimeRef.current > clickDebounceRef.current,
        scrollDirection: scrollDir,
      });

      if (shouldClick && now - lastClickTimeRef.current > clickDebounceRef.current) {
        lastClickTimeRef.current = now;
        simulateClick(smoothedX, smoothedY);
      }

      if (scrollDir !== 'none') {
        simulateScroll(scrollDir);
      }
    };

    const intervalId = setInterval(processFusion, 16); // ~60 FPS
    return () => clearInterval(intervalId);
  }, [currentGaze, currentGesture, currentVoiceCommand, setCursorState]);

  return <div className="hidden">CursorController Active</div>;
};

/**
 * Simulate a click at the given coordinates
 * Note: Direct programmatic clicking is limited by browser security;
 * this is mainly for demo/accessibility purposes
 */
function simulateClick(x: number, y: number) {
  const element = document.elementFromPoint(x, y) as HTMLElement;
  if (element) {
    element.click();
    console.log('Simulated click at', x, y);
  }
}

/**
 * Simulate scrolling
 */
function simulateScroll(direction: 'up' | 'down') {
  const scrollAmount = 50;
  window.scrollBy({
    top: direction === 'down' ? scrollAmount : -scrollAmount,
    behavior: 'smooth',
  });
  console.log('Scroll', direction);
}

export default CursorController;
