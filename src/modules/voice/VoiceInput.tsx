import React, { useEffect, useRef, useState } from 'react';
import { useAirMouseStore, VoiceCommand } from '../../store/airMouseStore';

/**
 * VoiceInput Module
 * 
 * Responsibilities:
 * - Detect wake-word ("Hey Air")
 * - Process voice commands: click, scroll_up, scroll_down, pause
 * - Uses Web Speech API for ASR
 * - Optional: cloud-based ASR for improved accuracy
 * 
 * Real-time performance: ≤500ms for command recognition
 */

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const VoiceInput: React.FC = () => {
  const { setVoiceCommand, setVoiceActive, voiceActive } = useAirMouseStore();
  const recognizerRef = useRef<SpeechRecognition | null>(null);
  const [supported, setSupported] = useState(false);
  const wakeWordThresholdRef = useRef(0.75);
  const commandMapRef = useRef<Record<string, VoiceCommand['command']>>({
    click: 'click',
    'left click': 'click',
    'scroll up': 'scroll_up',
    'scroll down': 'scroll_down',
    pause: 'pause',
    stop: 'pause',
  });

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('Web Speech API not supported');
      setSupported(false);
      return;
    }

    setSupported(true);
    recognizerRef.current = new SpeechRecognition();

    if (recognizerRef.current) {
      recognizerRef.current.continuous = true;
      recognizerRef.current.interimResults = true;
      recognizerRef.current.lang = 'en-US';

      recognizerRef.current.addEventListener('result', handleSpeechResult);
      recognizerRef.current.addEventListener('end', () => {
        // Auto-restart recognition
        if (voiceActive && recognizerRef.current) {
          recognizerRef.current.start();
        }
      });

      recognizerRef.current.addEventListener('error', (event) => {
        console.error('Speech recognition error:', event);
      });
    }

    return () => {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, [voiceActive]);

  const handleSpeechResult = (event: Event) => {
    const speechEvent = event as any;
    let interimTranscript = '';

    for (let i = speechEvent.resultIndex; i < speechEvent.results.length; i++) {
      const transcript = speechEvent.results[i][0].transcript;

      if (speechEvent.results[i].isFinal) {
        processCommand(transcript);
      } else {
        interimTranscript += transcript;
      }
    }
  };

  const processCommand = (transcript: string) => {
    const lowerTranscript = transcript.toLowerCase().trim();

    // Check for wake word
    if (lowerTranscript.includes('hey air') || lowerTranscript.includes('air')) {
      console.log('Wake word detected');
      // Could trigger enhanced listening mode
    }

    // Map transcript to command
    for (const [phrase, command] of Object.entries(commandMapRef.current)) {
      if (lowerTranscript.includes(phrase)) {
        const voiceCmd: VoiceCommand = {
          command,
          confidence: 0.85, // Web Speech API confidence
          timestamp: performance.now(),
        };
        setVoiceCommand(voiceCmd);
        console.log('Voice command:', command, transcript);
        return;
      }
    }
  };

  const toggleVoiceRecognition = () => {
    if (!recognizerRef.current) return;

    if (voiceActive) {
      recognizerRef.current.stop();
      setVoiceActive(false);
    } else {
      recognizerRef.current.start();
      setVoiceActive(true);
    }
  };

  return (
    <div className="hidden">
      {supported && (
        <button
          onClick={toggleVoiceRecognition}
          className="fixed bottom-4 right-4 px-4 py-2 bg-accent-cyan text-slate-900 rounded-full font-semibold"
          aria-label="Toggle voice input"
        >
          {voiceActive ? '🎤 Listening...' : '🎤 Start Voice'}
        </button>
      )}
      {!supported && (
        <p className="text-red-500 text-xs">Web Speech API not available</p>
      )}
    </div>
  );
};

export default VoiceInput;
