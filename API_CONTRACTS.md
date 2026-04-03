# Air-Mouse API Contracts & Data Models

This document specifies all internal APIs, data types, and communication contracts between Air-Mouse modules.

---

## Table of Contents

1. [TypeScript Interfaces](#typescript-interfaces)
2. [Event Protocol](#event-protocol)
3. [Zustand Store API](#zustand-store-api)
4. [Module Communication](#module-communication)
5. [Error Handling](#error-handling)
6. [Performance Contracts](#performance-contracts)

---

## TypeScript Interfaces

### Core Data Types

```typescript
// ============================================
// GAZE TRACKING
// ============================================

interface GazePoint {
  x: number;        // Screen X coordinate (0 to window.innerWidth)
  y: number;        // Screen Y coordinate (0 to window.innerHeight)
  timestamp: number; // DOMHighResTimeStamp (ms)
}

interface HeadPose {
  yaw: number;      // Head rotation left/right (-90 to 90 degrees)
  pitch: number;    // Head rotation up/down (-90 to 90 degrees)
  roll: number;     // Head tilt (-45 to 45 degrees)
  confidence: number; // 0-1 confidence score
}

// ============================================
// GESTURE RECOGNITION
// ============================================

type GestureType = 'thumbs_up' | 'thumbs_down' | 'palm_open' | 'fist' | 'none';

interface GestureData {
  type: GestureType;
  confidence: number;  // 0-1 confidence score
  timestamp: number;   // DOMHighResTimeStamp
  landmarks?: number[][]; // Optional: 21 hand landmarks [x, y, z]
}

interface HandLandmarks {
  landmarks: Array<[x: number, y: number, z: number]>;
  handedness: 'LEFT' | 'RIGHT';
  confidence: number;
}

// ============================================
// VOICE COMMANDS
// ============================================

type VoiceCommandType = 'click' | 'scroll_up' | 'scroll_down' | 'pause' | 'none';

interface VoiceCommand {
  command: VoiceCommandType;
  confidence: number;   // 0-1, depends on ASR accuracy
  transcript: string;   // Raw transcribed text
  timestamp: number;    // DOMHighResTimeStamp
  language?: string;    // BCP 47 language tag, default 'en-US'
}

// ============================================
// CURSOR CONTROL
// ============================================

interface CursorState {
  x: number;                          // Screen X coordinate
  y: number;                          // Screen Y coordinate
  isClicking: boolean;                // Is performing click action
  scrollDirection: 'up' | 'down' | 'none';
  isDragging?: boolean;               // (Future) Drag operation
}

interface CursorAction {
  type: 'move' | 'click' | 'double_click' | 'scroll' | 'drag';
  x?: number;
  y?: number;
  button?: 'left' | 'right' | 'middle';  // Default: 'left'
  scrollDelta?: number;   // Pixels to scroll (positive = down)
  dragTo?: { x: number; y: number }; // Drag destination
}

// ============================================
// FACE AUTHENTICATION
// ============================================

interface FaceEmbedding {
  vector: number[];     // Mathematical vector (e.g., 512-dim)
  timestamp: number;
  modelVersion: string; // e.g., "mediapipe-face-2.0"
}

interface FaceDetection {
  landmarks: Array<[x: number, y: number, z: number]>; // 468 points
  confidence: number;
  bbox?: { x: number; y: number; width: number; height: number };
}

// ============================================
// CALIBRATION
// ============================================

interface CalibrationData {
  calibrationOffsetX: number;
  calibrationOffsetY: number;
  calibrationScale?: { x: number; y: number };
  calibrationPoints?: Array<{ screen: [x, y]; gaze: [x, y] }>;
  timestamp: number;
  deviceInfo?: {
    screenWidth: number;
    screenHeight: number;
    userAgentData?: object;
  };
}

// ============================================
// SETTINGS & PREFERENCES
// ============================================

interface AppSettings {
  cameraEnabled: boolean;
  voiceEnabled: boolean;
  faceAuthEnabled: boolean;
  cloudSyncEnabled: boolean;
  gazeTrackerModel: 'mediapipe' | 'tensorflow';
  smoothingFactor: number;         // 0-1, default 0.3
  gestureConfidenceThreshold: number; // 0-1, default 0.6
  voiceLanguage: string;           // BCP 47, default 'en-US'
  theme: 'light' | 'dark';         // UI theme
  contrastMode: boolean;           // Accessibility
}

// ============================================
// PERMISSION & CONSENT
// ============================================

interface UserConsent {
  camera: boolean;
  microphone: boolean;
  faceRecognition: boolean;
  cloudSync: boolean;
  analytics: boolean;
  timestamp: number;
  version: string;  // Policy version accepted
}

// ============================================
// ERROR TYPES
// ============================================

interface AirMouseError {
  code: string;  // e.g., 'CAMERA_DENIED', 'ASR_TIMEOUT'
  message: string;
  details?: object;
  timestamp: number;
}
```

---

## Event Protocol

### Custom Events

All inter-module communication uses **CustomEvent** for loose coupling.

#### 1. Camera Frame Event

**Event name:** `'camera-frame'`

```typescript
window.addEventListener('camera-frame', (event: Event) => {
  const customEvent = event as CustomEvent;
  const { imageData, timestamp } = customEvent.detail;
  
  // imageData: CanvasImageData (RGBA, 1280x720)
  // timestamp: DOMHighResTimeStamp
});

// Dispatch (from CameraInput):
window.dispatchEvent(new CustomEvent('camera-frame', {
  detail: {
    imageData: ctx.getImageData(0, 0, width, height),
    timestamp: performance.now(),
  },
}));
```

**Frequency:** 30 FPS (every ~33ms)
**Payload size:** ~4 MB per frame (uncompressed RGBA)

---

#### 2. Gaze Update Event

**Event name:** `'gaze-update'`

```typescript
window.addEventListener('gaze-update', (event: Event) => {
  const { gaze } = (event as CustomEvent).detail;
  // gaze: GazePoint
});
```

**Frequency:** Variable, typically 20-30 FPS
**Source:** GazeEngine (MediaPipe → TensorFlow.js inference)

---

#### 3. Gesture Recognized Event

**Event name:** `'gesture-detected'`

```typescript
window.addEventListener('gesture-detected', (event: Event) => {
  const { gesture } = (event as CustomEvent).detail;
  // gesture: GestureData
});
```

**Frequency:** On gesture change (typically once per second)
**Source:** GestureEngine (MediaPipe Hands)

---

#### 4. Voice Command Event

**Event name:** `'voice-command'`

```typescript
window.addEventListener('voice-command', (event: Event) => {
  const { command } = (event as CustomEvent).detail;
  // command: VoiceCommand
});
```

**Frequency:** On recognized command (variable)
**Source:** VoiceInput (Web Speech API)

---

#### 5. Cursor Action Event

**Event name:** `'cursor-action'`

```typescript
window.addEventListener('cursor-action', (event: Event) => {
  const { action } = (event as CustomEvent).detail;
  // action: CursorAction
});
```

**Frequency:** On cursor movement or action (60 FPS for movement)
**Source:** CursorController (Fusion engine)

---

### Event Dispatching Pattern

```typescript
// Generic event dispatch pattern
function dispatchEvent<T>(
  eventName: string,
  detail: T,
) {
  window.dispatchEvent(
    new CustomEvent(eventName, {
      detail,
      bubbles: false,
      cancelable: false,
    }),
  );
}

// Usage
dispatchEvent('camera-frame', {
  imageData: ctx.getImageData(0, 0, w, h),
  timestamp: performance.now(),
});
```

---

## Zustand Store API

### Store Creation

```typescript
import { create } from 'zustand';

export const useAirMouseStore = create<AirMouseStore>((set) => ({
  // ... state and methods
}));
```

### Store Methods (Full Interface)

```typescript
interface AirMouseStore {
  // ============= CAMERA =============
  cameraActive: boolean;
  setCameraActive(active: boolean): void;

  // ============= GAZE =============
  currentGaze: GazePoint | null;
  gazePoints: GazePoint[];
  
  setGaze(gaze: GazePoint): void;
  addGazePoint(gaze: GazePoint): void;

  // ============= GESTURE =============
  currentGesture: GestureData;
  setGesture(gesture: GestureData): void;

  // ============= VOICE =============
  currentVoiceCommand: VoiceCommand;
  voiceActive: boolean;
  
  setVoiceCommand(cmd: VoiceCommand): void;
  setVoiceActive(active: boolean): void;

  // ============= CURSOR =============
  cursorState: CursorState;
  setCursorState(partial: Partial<CursorState>): void;

  // ============= AUTHENTICATION =============
  faceAuthEnabled: boolean;
  isAuthenticated: boolean;
  
  setFaceAuthEnabled(enabled: boolean): void;
  setAuthenticated(auth: boolean): void;

  // ============= SETTINGS =============
  enableCloudSync: boolean;
  calibrationData: Record<string, number>;
  
  setEnableCloudSync(enabled: boolean): void;
  setCalibrationData(data: Record<string, number>): void;

  // ============= INITIALIZATION =============
  initStore(): void;
}
```

### Store Usage Examples

```typescript
// In React component
import { useAirMouseStore } from '@/store/airMouseStore';

function MyComponent() {
  const { currentGaze, setCursorState } = useAirMouseStore();
  
  useEffect(() => {
    if (currentGaze) {
      setCursorState({
        x: currentGaze.x,
        y: currentGaze.y,
      });
    }
  }, [currentGaze, setCursorState]);
  
  return <div>X: {currentGaze?.x}</div>;
}
```

---

## Module Communication

### CameraInput → GestureEngine (via events)

```
CameraInput
  ├─ Captures frames from navigator.mediaDevices
  └─ Dispatches 'camera-frame' event
       ↓
     GestureEngine (listens)
       ├─ Receives ImageData
       ├─ Runs MediaPipe Hands inference
       └─ Updates store: setGesture()
```

### GestureEngine → CursorController (via store)

```
GestureEngine
  └─ setGesture(GestureData)
       ↓
     Store update
       ↓
     CursorController (subscribes to store)
       ├─ Reads currentGesture
       ├─ Maps gesture to action
       └─ Executes click/scroll
```

### VoiceInput → CursorController (via store)

```
VoiceInput
  └─ setVoiceCommand(VoiceCommand)
       ↓
     Store update
       ↓
     CursorController (subscribes to store)
       ├─ Reads currentVoiceCommand
       ├─ Maps command to action
       └─ Executes (click/scroll/pause)
```

### Multi-Modal Fusion (CursorController)

```
Store: {
  currentGaze: GazePoint,
  currentGesture: GestureData,
  currentVoiceCommand: VoiceCommand,
}
  ↓
CursorController (main fusion logic)
  ├─ Weight inputs: gaze(70%) + gesture(20%) + voice(10%)
  ├─ Apply smoothing (EMA, α=0.3)
  ├─ Detect conflicts (e.g., scroll + click)
  └─ Emit CursorAction event
```

---

## Error Handling

### Error Types & Codes

```typescript
enum ErrorCode {
  CAMERA_DENIED = 'ERR_CAMERA_DENIED',
  CAMERA_NOT_FOUND = 'ERR_CAMERA_NOT_FOUND',
  MIC_DENIED = 'ERR_MIC_DENIED',
  ASR_TIMEOUT = 'ERR_ASR_TIMEOUT',
  MODEL_LOAD_FAILED = 'ERR_MODEL_LOAD',
  INFERENCE_ERROR = 'ERR_INFERENCE',
  STORAGE_FULL = 'ERR_STORAGE_FULL',
  NETWORK_ERROR = 'ERR_NETWORK',
  UNKNOWN = 'ERR_UNKNOWN',
}
```

### Error Event

```typescript
window.addEventListener('air-mouse-error', (event: Event) => {
  const { error } = (event as CustomEvent).detail;
  // error: AirMouseError
  
  console.error(`[${error.code}] ${error.message}`, error.details);
});

// Dispatch
dispatchEvent('air-mouse-error', {
  code: ErrorCode.CAMERA_DENIED,
  message: 'Camera permission denied',
  timestamp: performance.now(),
});
```

### Graceful Degradation

```typescript
// If camera fails, fall back to voice-only
if (!cameraActive) {
  // Disable gaze & gesture
  // Show warning: "Camera unavailable, voice commands only"
  // Continue with voice input
}

// If voice fails, fall back to gesture + gaze
if (!voiceActive) {
  // Disable voice commands
  // Show info: "Microphone unavailable"
  // Continue with gaze + gesture
}
```

---

## Performance Contracts

### Latency SLOs (Service Level Objectives)

| Operation | Target | Max | Measurement |
|-----------|--------|-----|-------------|
| Camera capture → frame event | 30ms | 50ms | Frame extraction time |
| Gaze inference | 30ms | 50ms | MediaPipe + TF.js |
| Gesture classification | 15ms | 30ms | MediaPipe inference |
| Voice ASR | 200ms | 500ms | Speech → text |
| Fusion algorithm | 10ms | 20ms | Input → cursor state |
| UI render (60 FPS) | 16ms | 30ms | React re-render |
| **End-to-end (gaze→cursor)** | **100ms** | **150ms** | Full pipeline |

### Memory Contracts

| Component | Target | Max |
|-----------|--------|-----|
| Camera buffer (1280x720 RGBA) | 50 MB | 50 MB |
| Gaze history (100 points) | 10 KB | 50 KB |
| Gesture buffer | 1 MB | 5 MB |
| ML models (loaded) | 30 MB | 50 MB |
| React state | 5 MB | 10 MB |
| **Total** | **~100 MB** | **<150 MB** |

### Frame Rate Contracts

| Layer | Target | Minimum | Adaptive |
|-------|--------|---------|----------|
| Camera capture | 30 FPS | 15 FPS | Throttle if CPU high |
| Gaze tracking | 30 FPS | 15 FPS | Skip frames if needed |
| UI render | 60 FPS | 30 FPS | React auto-batches |
| Voice ASR | N/A (continuous) | - | - |

### Accuracy Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Gaze tracking | ±5-10° visual angle | Calibration validation |
| Gesture recognition | ≥85% | Test set accuracy |
| Voice command | ≥90% | Command extraction rate |
| False-positive rate (gesture) | <5% | Per-hour false triggers |

---

## Example: Complete Data Flow

### Scenario: User performs "thumbs up" gesture

```
[1] Camera frame captured
    CameraInput → dispatchEvent('camera-frame', {imageData, timestamp})

[2] Gaze estimation
    GestureEngine (listens to camera-frame)
    → MediaPipe Hands inference (~20ms)
    → Detect thumbs_up (confidence: 0.92)
    → Store update: setGesture({type: 'thumbs_up', confidence: 0.92, ...})

[3] Store update triggers subscriber
    useAirMouseStore() subscribers notified
    → CursorController (subscribes to currentGesture)

[4] Fusion & action mapping
    CursorController.processFusion()
    → Check currentGesture.type === 'thumbs_up'
    → Check confidence > 0.8 ✓
    → Set shouldClick = true
    → setCursorState({isClicking: true, ...})

[5] Cursor action execution
    → simulateClick(x, y)
    → Find element at (x, y)
    → element.click()
    → Debounce: skip next click for 300ms

[6] UI update
    CursorIndicator receives isClicking: true
    → Show pulse animation
    → 16ms re-render (60 FPS)

[7] User feedback
    ✓ Click executed at screen position
    ✓ Visual feedback (cursor pulse)
    ✓ Total latency: ~80ms (within budget)
```

---

## Conclusion

This API contract ensures:
- ✓ Clear module boundaries
- ✓ Predictable latency
- ✓ Type-safe communication
- ✓ Graceful degradation
- ✓ Testability & debugging

Refer to this document when:
- Adding new modules
- Integrating external services
- Debugging performance issues
- Writing tests
