# Air-Mouse MVP: Architecture & Design Document

## Executive Summary

Air-Mouse is a hands-free cursor control system enabling interaction via:
- **Gaze tracking** (eye position → cursor movement)
- **Hand gestures** (thumbs-up/down, palm, fist → clicks, scrolls)
- **Voice commands** (wake-word + 4 commands)

All processing is **local-first** with optional cloud augmentation. MVP targets **≤150ms end-to-end latency** with 30 FPS minimum.

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Web Application (React + TS)              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               Input Acquisition Layer                  │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │   Camera     │ │    Voice     │ │   Face Auth  │   │ │
│  │  │   Input      │ │    Input     │ │              │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↓ Frame Events                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          AI/ML Inference Layer (On-Device)            │ │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │ │
│  │  │  Gesture     │ │    Gaze      │ │  Voice ASR   │   │ │
│  │  │  Engine      │ │    Tracker   │ │              │   │ │
│  │  │(MediaPipe)   │ │(TF.js)       │ │(Web Speech)  │   │ │
│  │  └──────────────┘ └──────────────┘ └──────────────┘   │ │
│  └────────────────────────────────────────────────────────┘ │
│                  ↓ Gesture/Gaze/Command Events              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │        Real-Time Fusion & Control Layer               │ │
│  │     ┌─────────────────────────────────────┐           │ │
│  │     │  Multi-Modal Fusion Engine          │           │ │
│  │     │  (Kalman + Exponential Smoothing)   │           │ │
│  │     └─────────────────────────────────────┘           │ │
│  │                ↓                                        │ │
│  │     ┌─────────────────────────────────────┐           │ │
│  │     │  Cursor Controller                  │           │ │
│  │     │  - Move cursor                      │           │ │
│  │     │  - Execute clicks                   │           │ │
│  │     │  - Scroll window                    │           │ │
│  │     └─────────────────────────────────────┘           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              UI & State Management                     │ │
│  │  - Cursor Indicator (Aurora glow)                      │ │
│  │  - Control Panel (Settings, Calibration)              │ │
│  │  - Status Bar (Input states)                          │ │
│  │  - Zustand Store (State management)                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Persistence Layer                            │ │
│  │  - localStorage: Settings, calibration                │ │
│  │  - IndexedDB: Face embeddings (future)                │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
              ↓ Optional Cloud Sync (with consent)
      ┌─────────────────────────────────┐
      │   Cloud Services (Optional)     │
      │ - Profile Sync                  │
      │ - Model Updates                 │
      │ - Analytics                     │
      └─────────────────────────────────┘
```

---

## 2. Data Flow Diagram

### Real-Time Processing Pipeline (≤150ms)

```
[Camera Frame] (33ms interval @ 30 FPS)
    ↓
[MediaPipe Face Detection] (30-50ms)
    ├→ [Extract Face Landmarks] (468 points)
    ├→ [Gaze Estimation] (TF.js)
    │   └→ [Apply Calibration + Smoothing] (5ms)
    │       └→ [Cursor Position] (x, y)
    │
    ├→ [Hand Detection] (21 hand landmarks)
    │   └→ [Gesture Classification] (TF Lite) (10-20ms)
    │       └→ [Gesture Event] (type, confidence)
    │
    └→ [Head Pose Estimation] (for mode switching)

[Microphone Stream] (continuous)
    ↓
[Web Speech API] (async)
    ├→ [Wake Word Detection] ("Hey Air")
    └→ [Command Recognition] (100-500ms)
        └→ [Voice Command Event]

[All Events] → [Fusion Engine]
    ↓
[Multi-Modal Fusion Algorithm]
    ├→ Weight: gaze (70%) + gesture (20%) + voice (10%)
    ├→ Apply smoothing (EMA, α=0.3)
    └→ [Cursor State] {x, y, isClicking, scrollDir}
    
[Cursor State] → [Cursor Controller]
    ├→ [Update Cursor Position]
    ├→ [Execute Click] (via synthetic mouse event)
    └→ [Execute Scroll] (via window.scrollBy)

[Update UI]
    ├→ [CursorIndicator] (Aurora glow)
    ├→ [StatusBar] (Input states)
    └→ [Re-render] (60 FPS React)
```

**Latency Breakdown (Target ≤150ms):**
- Camera capture: 0-33ms (frame-dependent)
- MediaPipe inference: 30-50ms
- Gaze estimation: 20-30ms
- Gesture classification: 10-20ms
- Fusion + smoothing: 5-10ms
- UI update: 16ms (60 FPS)
- **Total: 81-159ms** ✓

---

## 3. Core Module Descriptions

### 3.1 CameraInput Module (`src/modules/camera/CameraInput.tsx`)

**Responsibilities:**
- Request camera permission
- Capture video stream
- Frame extraction & processing
- Performance monitoring (FPS tracking)

**API:**
```typescript
// Event: Fires on each camera frame
window.dispatchEvent(new CustomEvent('camera-frame', {
  detail: {
    imageData: ImageData,  // Raw pixel data
    timestamp: number,      // DOMHighResTimeStamp
  }
}));
```

**Performance:**
- Target: 30 FPS (33ms per frame)
- Memory: ~50 MB (1280x720 video buffer)

---

### 3.2 GestureEngine Module (`src/modules/gesture/GestureEngine.tsx`)

**Responsibilities:**
- Detect hand presence & landmarks (MediaPipe Hands)
- Classify gestures
- Emit gesture events with confidence

**Gesture Dictionary:**
```
- thumbs_up    → Left click
- thumbs_down  → Scroll down
- palm_open    → Scroll up
- fist         → (Reserved for mode switch)
- none         → No gesture
```

**Integration:**
- Listens to `camera-frame` events
- Uses MediaPipe Hands (browser-compatible)
- Debounces detections (3 consecutive frames)

---

### 3.3 VoiceInput Module (`src/modules/voice/VoiceInput.tsx`)

**Responsibilities:**
- Continuous speech recognition (Web Speech API)
- Wake-word detection ("Hey Air")
- Command extraction

**Command Dictionary:**
```
"click" / "left click"   → Click action
"scroll up"              → Scroll up
"scroll down"            → Scroll down
"pause" / "stop"         → Pause voice input
```

**Implementation:**
- Web Speech API for ASR (built-in, no server)
- Optional: Cloud ASR (e.g., Google Speech-to-Text) for better accuracy

---

### 3.4 CursorController Module (`src/modules/cursor/CursorController.tsx`)

**Responsibilities:**
- Multi-modal sensor fusion
- Apply calibration & smoothing
- Execute cursor actions

**Fusion Algorithm:**
```
targetX = 0.7 * gazeX + 0.2 * gestureX + 0.1 * voiceX
smoothedX = α * targetX + (1-α) * prevX  // EMA, α=0.3

// Debounce clicks: 300ms between clicks
// Drag operations: (future phase)
```

**Output Actions:**
- `setCursorState()` → Zustand store update
- `simulateClick()` → Synthetic mouse event
- `simulateScroll()` → window.scrollBy()

---

### 3.5 FaceAuth Module (`src/modules/auth/FaceAuth.tsx`)

**Responsibilities:**
- Detect and validate user face (optional, demo-ready)
- Liveness detection (future)
- Local embedding storage

**Current Implementation:**
- Non-blocking: Doesn't prevent app usage
- Demo: Auto-accepts after 2 seconds
- Future: MediaPipe Face Detection + similarity matching

---

### 3.6 CursorController UI Components

**CursorIndicator.tsx:**
- Aurora-styled glow ring at cursor position
- Pulsing animation on click
- Responsive to latency

**StatusBar.tsx:**
- Real-time input state display
- Gesture type, voice status, last command

**ControlPanel.tsx:**
- Tabs: General, Calibration, Privacy
- Calibration trigger (9-point grid)
- Data deletion

---

## 4. State Management (Zustand Store)

```typescript
interface AirMouseStore {
  // Camera
  cameraActive: boolean;

  // Gaze
  gazePoints: GazePoint[];
  currentGaze: GazePoint | null;

  // Gesture
  currentGesture: GestureData;

  // Voice
  currentVoiceCommand: VoiceCommand;
  voiceActive: boolean;

  // Cursor state
  cursorState: CursorState;

  // Authentication
  faceAuthEnabled: boolean;
  isAuthenticated: boolean;

  // Settings
  enableCloudSync: boolean;
  calibrationData: Record<string, number>;
}
```

---

## 5. Data Processing Pipeline (Python ML)

### ML Workflow:

```
Data Collection
    ↓
[Gesture Video] → MediaPipe Extraction → Hand Landmarks (21 × 3)
                                              ↓
                                         Train/Val Split
                                              ↓
                                    TensorFlow Model Training
                                              ↓
                                    Export: TF Lite + ONNX
                                              ↓
                                    Load in Browser (ONNX.js)
                                              ↓
                                    Real-time Inference
```

### Python Scripts:

| File | Purpose |
|------|---------|
| `ml/gesture_model.py` | Define & train gesture classifier |
| `ml/gaze_model.py` | Define & train gaze estimation |
| `ml/scripts/export_models.py` | Export to TF Lite / ONNX |
| `ml/scripts/train_gesture_model.py` | End-to-end training script |

---

## 6. Privacy & Data Handling

### Data Flow (Local-First):

```
[Camera] → [Processing] → [Inference] → [Cursor Action]
  ↓          (local)       (local)         (local)
[Trash]   No network,   No cloud      No transmission
          No storage    unless opted-in
```

### Explicit Cloud Opt-In:

```
User Consent (localStorage)
    ↓
Consent Dialog (ConsentFlow.tsx)
    ├→ Camera access
    ├→ Microphone access
    ├→ Face authentication
    └→ Cloud sync (optional)

[Data stored]
    ├→ Calibration data (localStorage)
    ├→ Face embeddings (IndexedDB, if enrolled)
    └→ Settings (localStorage)

[User can delete anytime]
    └→ "Clear All Data" button in ControlPanel
```

---

## 7. Real-Time Performance Strategy

### DSA-Oriented Optimizations:

1. **Ring Buffer for Gaze History** (O(1) smoothing)
   ```typescript
   const gazeHistory = new RingBuffer<GazePoint>(10);
   // Constant-time insertion, FIFO eviction
   ```

2. **Gesture Debouncing** (State machine)
   ```
   IDLE --[detect]→ PENDING --[3 frames]→ CONFIRMED → [event] → IDLE
   ```

3. **Fusion Weights** (Pre-computed, no branching)
   ```typescript
   const weights = { gaze: 0.7, gesture: 0.2, voice: 0.1 };
   // Fixed layout, cache-friendly
   ```

4. **Exponential Moving Average** (Single-pass smoothing)
   ```typescript
   smoothed = α * current + (1-α) * prev;  // O(1), no allocations
   ```

### Graceful Degradation:

```
All inputs available   → Multi-modal fusion
Only gaze available    → Use gaze + default weights
Only voice available   → Voice commands only
All inputs fail        → Fallback to standard mouse
```

---

## 8. Testing Strategy

### Unit Tests:
- Gesture classification accuracy
- Gaze calibration math
- Voice command parsing

### Integration Tests:
- Multi-modal fusion correctness
- Cursor movement smoothness
- Click/scroll execution

### Performance Tests:
- Latency profiling (target ≤150ms)
- FPS stability
- Memory leaks (long-running)

### Accessibility Tests:
- Keyboard fallback
- Screen reader compatibility
- High-contrast mode

---

## 9. Build & Deployment

### Development:
```bash
npm install
npm run dev        # Vite dev server, localhost:3000
```

### Production:
```bash
npm run build      # Optimized bundle
npm run preview    # Test production build
```

### Python ML:
```bash
cd ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python scripts/export_models.py
```

---

## 10. Phase 2 Roadmap (Weeks 4–12)

- **Multi-gesture vocabulary** (point, swipe, pinch, rotate)
- **Multi-user profiles** (per-user calibration)
- **Offline fallback** (Service Worker caching)
- **Performance tuning** (Web Workers, WASM acceleration)
- **Cloud sync** (Firebase / custom backend)
- **Advanced auth** (Liveness detection, spoofing prevention)
- **Accessibility features** (Eye gaze calibration for users with motor disabilities)

---

## 11. Conclusion

Air-Mouse MVP delivers a **privacy-first, low-latency hands-free interface** with:
- ✓ Real-time multi-modal fusion (gaze + gesture + voice)
- ✓ <150ms end-to-end latency target
- ✓ Local-first data processing
- ✓ Graceful degradation on input failure
- ✓ Aurora/glassmorphism UI aesthetic
- ✓ Extensible Python ML pipeline

The architecture prioritizes **deterministic, low-memory real-time processing** with clear separation between browser-based inference and optional cloud augmentation.
