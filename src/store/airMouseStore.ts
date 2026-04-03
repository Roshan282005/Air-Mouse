import { create } from 'zustand';

export interface Pose {
  x: number;
  y: number;
  z: number;
  confidence: number;
}

export interface GazePoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface GestureData {
  type: 'thumbs_up' | 'thumbs_down' | 'palm_open' | 'fist' | 'none';
  confidence: number;
  timestamp: number;
}

export interface VoiceCommand {
  command: 'click' | 'scroll_up' | 'scroll_down' | 'pause' | 'none';
  confidence: number;
  timestamp: number;
}

export interface CursorState {
  x: number;
  y: number;
  isClicking: boolean;
  scrollDirection: 'up' | 'down' | 'none';
}

interface AirMouseStore {
  // Camera state
  cameraActive: boolean;
  setCameraActive: (active: boolean) => void;

  // Gaze tracking
  gazePoints: GazePoint[];
  currentGaze: GazePoint | null;
  setGaze: (gaze: GazePoint) => void;
  addGazePoint: (gaze: GazePoint) => void;

  // Gesture recognition
  currentGesture: GestureData;
  setGesture: (gesture: GestureData) => void;

  // Voice commands
  currentVoiceCommand: VoiceCommand;
  setVoiceCommand: (cmd: VoiceCommand) => void;
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;

  // Cursor control
  cursorState: CursorState;
  setCursorState: (state: Partial<CursorState>) => void;

  // Face authentication
  faceAuthEnabled: boolean;
  setFaceAuthEnabled: (enabled: boolean) => void;
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;

  // Settings
  enableCloudSync: boolean;
  setEnableCloudSync: (enabled: boolean) => void;
  calibrationData: Record<string, number>;
  setCalibrationData: (data: Record<string, number>) => void;

  // Initialization
  initStore: () => void;
}

export const useAirMouseStore = create<AirMouseStore>((set) => ({
  cameraActive: false,
  setCameraActive: (active) => set({ cameraActive: active }),

  gazePoints: [],
  currentGaze: null,
  setGaze: (gaze) => set({ currentGaze: gaze }),
  addGazePoint: (gaze) =>
    set((state) => ({
      gazePoints: [...state.gazePoints.slice(-99), gaze], // Keep last 100 points
    })),

  currentGesture: { type: 'none', confidence: 0, timestamp: 0 },
  setGesture: (gesture) => set({ currentGesture: gesture }),

  currentVoiceCommand: { command: 'none', confidence: 0, timestamp: 0 },
  setVoiceCommand: (cmd) => set({ currentVoiceCommand: cmd }),
  voiceActive: false,
  setVoiceActive: (active) => set({ voiceActive: active }),

  cursorState: { x: 0, y: 0, isClicking: false, scrollDirection: 'none' },
  setCursorState: (partial) =>
    set((state) => ({
      cursorState: { ...state.cursorState, ...partial },
    })),

  faceAuthEnabled: false,
  setFaceAuthEnabled: (enabled) => set({ faceAuthEnabled: enabled }),
  isAuthenticated: false,
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),

  enableCloudSync: false,
  setEnableCloudSync: (enabled) => set({ enableCloudSync: enabled }),
  calibrationData: {},
  setCalibrationData: (data) => set({ calibrationData: data }),

  initStore: () => {
    // Load persisted settings from IndexedDB or localStorage
    const savedSettings = localStorage.getItem('air-mouse-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      set({
        enableCloudSync: settings.enableCloudSync || false,
        calibrationData: settings.calibrationData || {},
      });
    }
  },
}));
