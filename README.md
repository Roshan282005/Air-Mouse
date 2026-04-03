# Air-Mouse MVP: Complete Implementation Guide

**Hands-free cursor control via gaze, gestures, and voice.**

## Quick Start (5 minutes)

### Prerequisites
- Node.js 16+ and npm
- Modern browser (Chrome, Edge, Safari 15+)
- Webcam + microphone

### Installation & Running

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open browser to http://localhost:3000
# Grant camera & microphone permissions when prompted
```

**That's it!** The app will start with a consent flow, then initialize the real-time pipeline.

---

## Project Structure

```
air-mouse-mvp/
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Main app component
│   ├── styles/
│   │   └── globals.css             # Aurora/glassmorphism styles
│   ├── store/
│   │   └── airMouseStore.ts        # Zustand state management
│   ├── modules/
│   │   ├── camera/
│   │   │   └── CameraInput.tsx     # Video capture & frame streaming
│   │   ├── gesture/
│   │   │   └── GestureEngine.tsx   # Hand gesture recognition
│   │   ├── voice/
│   │   │   └── VoiceInput.tsx      # Voice command ASR
│   │   ├── cursor/
│   │   │   └── CursorController.tsx # Multi-modal fusion & cursor control
│   │   └── auth/
│   │       └── FaceAuth.tsx         # Face authentication (demo)
│   └── components/
│       ├── ConsentFlow.tsx          # Privacy consent UI
│       ├── MainUI.tsx               # Main UI orchestrator
│       ├── CursorIndicator.tsx      # Aurora cursor glow
│       ├── StatusBar.tsx            # Real-time status display
│       └── ControlPanel.tsx         # Settings & calibration
│
├── ml/
│   ├── gesture_model.py            # Gesture classifier training
│   ├── gaze_model.py               # Gaze estimation model
│   ├── requirements.txt            # Python dependencies
│   └── scripts/
│       ├── export_models.py        # Export to TF Lite / ONNX
│       └── train_gesture_model.py  # Training pipeline
│
├── public/
│   └── models/                     # Exported ML models (add after training)
│
├── package.json                    # Node.js dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── tailwind.config.js              # Tailwind CSS config
├── vite.config.ts                  # Vite build config
├── ARCHITECTURE.md                 # Detailed design docs
└── README.md                       # This file

```

---

## Core Modules

### 1. CameraInput (`src/modules/camera/CameraInput.tsx`)

**Responsibility:** Capture video stream and emit frame events

**Features:**
- Requests camera permission via `getUserMedia`
- Streams frames to gesture & gaze engines
- 30 FPS frame rate
- Error handling & fallback

**Usage:**
```typescript
// Automatically listens to camera frames
window.addEventListener('camera-frame', (event) => {
  const { imageData, timestamp } = event.detail;
  // Process frame...
});
```

---

### 2. GestureEngine (`src/modules/gesture/GestureEngine.tsx`)

**Responsibility:** Recognize hand gestures from camera frames

**Gestures:**
| Gesture | Action |
|---------|--------|
| 👍 Thumbs Up | Left click |
| 👎 Thumbs Down | Scroll down |
| ✋ Palm Open | Scroll up |
| ✊ Fist | Mode switch (reserved) |

**Integration:**
- Uses MediaPipe Hands (on-device, no cloud)
- Debounces with 3-frame confirmation
- Confidence threshold: 0.6

**Store Update:**
```typescript
setGesture({
  type: 'thumbs_up',
  confidence: 0.92,
  timestamp: performance.now()
});
```

---

### 3. VoiceInput (`src/modules/voice/VoiceInput.tsx`)

**Responsibility:** Wake-word detection and voice commands

**Commands:**
| Voice Phrase | Action |
|--------------|--------|
| "click" | Left click |
| "scroll up" | Scroll up |
| "scroll down" | Scroll down |
| "pause" / "stop" | Pause voice input |

**Tech:**
- Web Speech API (built-in, no server dependency)
- Continuous recognition with auto-restart
- Optional: Cloud ASR (Google Speech-to-Text) for better accuracy

**Toggle Voice:**
```typescript
setVoiceActive(true);   // Start listening
setVoiceActive(false);  // Stop listening
```

---

### 4. CursorController (`src/modules/cursor/CursorController.tsx`)

**Responsibility:** Multi-modal fusion and cursor execution

**Fusion Algorithm:**
```
targetX = 0.7 * gazeX + 0.2 * gestureX + 0.1 * voiceX
smoothedX = 0.3 * targetX + 0.7 * prevX  // Exponential moving average

// Result: Smooth, stable cursor movement
```

**Actions:**
- `setCursorState()` → Update Zustand store
- `simulateClick()` → Execute click at cursor position
- `simulateScroll()` → Scroll window (up/down)

**Performance:**
- Target latency: ≤150ms end-to-end
- Runs on 60 FPS requestAnimationFrame

---

### 5. FaceAuth (`src/modules/auth/FaceAuth.tsx`)

**Responsibility:** Optional face-based authentication

**Current:** Demo-ready, non-blocking
- Auto-recognizes after 2 seconds
- Enables multi-user support (Phase 2)

**Future Enhancements:**
- Liveness detection (spoofing prevention)
- Per-user calibration profiles

---

### 6. UI Components

#### ConsentFlow
Privacy-first consent UI explaining:
- Data collection & processing (camera, voice)
- Local-first architecture
- User rights & data deletion

#### CursorIndicator
Aurora-styled cursor glow:
- Cyan/purple gradient ring
- Pulsing animation on click
- Smooth position tracking

#### StatusBar
Real-time status display:
- Current gesture type
- Voice listening state
- Last voice command

#### ControlPanel
Settings & calibration:
- Enable/disable face auth
- Toggle cloud sync
- Calibrate gaze (9-point grid)
- Clear all data

---

## API Contracts & Events

### Store (Zustand)

```typescript
interface AirMouseStore {
  // Camera
  cameraActive: boolean;
  setCameraActive(active: boolean): void;

  // Gaze
  currentGaze: GazePoint | null;
  setGaze(gaze: GazePoint): void;
  gazePoints: GazePoint[];
  addGazePoint(gaze: GazePoint): void;

  // Gesture
  currentGesture: GestureData;
  setGesture(gesture: GestureData): void;

  // Voice
  currentVoiceCommand: VoiceCommand;
  setVoiceCommand(cmd: VoiceCommand): void;
  voiceActive: boolean;
  setVoiceActive(active: boolean): void;

  // Cursor
  cursorState: CursorState;
  setCursorState(partial: Partial<CursorState>): void;

  // Auth
  faceAuthEnabled: boolean;
  setFaceAuthEnabled(enabled: boolean): void;
  isAuthenticated: boolean;
  setAuthenticated(auth: boolean): void;

  // Settings
  enableCloudSync: boolean;
  setEnableCloudSync(enabled: boolean): void;
  calibrationData: Record<string, number>;
  setCalibrationData(data: Record<string, number>): void;

  // Init
  initStore(): void;
}
```

### Events

#### Camera Frame
```typescript
window.addEventListener('camera-frame', (event: CustomEvent) => {
  const { imageData, timestamp } = event.detail;
  // ImageData: Raw pixel data (RGBA)
  // timestamp: DOMHighResTimeStamp
});
```

---

## Build & Deployment

### Development Build

```bash
npm run dev
# Starts: http://localhost:3000 with hot reload
# Files: src/ (TypeScript/React)
```

### Production Build

```bash
npm run build
# Output: dist/ (optimized, minified)
# Size target: <500KB (gzipped)

npm run preview
# Test production build locally
```

### TypeScript Type Checking

```bash
npm run type-check
# Verify all types before building
```

### Linting

```bash
npm run lint
# Check code quality and style
```

---

## Python ML Pipeline

### Setup

```bash
cd ml
python -m venv venv

# On Linux/macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

pip install -r requirements.txt
```

### Training (Placeholder)

```bash
python scripts/train_gesture_model.py
# Trains gesture classifier with dummy data
# Replace with real gesture video data
```

### Export Models

```bash
python scripts/export_models.py
# Exports to: ../public/models/
# - gesture_model.tflite
# - gesture_model.onnx
# - gaze_model.tflite
```

### Models Available
| Model | Format | Size | Purpose |
|-------|--------|------|---------|
| `gesture_model` | TF Lite, ONNX | ~5-10 MB | Hand gesture classification |
| `gaze_model` | TF Lite | ~3-5 MB | Gaze position estimation |

---

## Configuration

### Gesture Detection Tuning

Edit `src/modules/gesture/GestureEngine.tsx`:
```typescript
minConfidenceRef.current = 0.6;  // Confidence threshold (0-1)
// Lower = more sensitive, higher false positives
// Higher = more accurate, misses weaker gestures
```

### Voice Command Tuning

Edit `src/modules/voice/VoiceInput.tsx`:
```typescript
commandMapRef.current = {
  'click': 'click',
  'scroll up': 'scroll_up',
  // Add more phrase mappings
};
```

### Fusion Weights

Edit `src/modules/cursor/CursorController.tsx`:
```typescript
fusionContextRef.current = {
  gazeWeight: 0.7,      // Gaze contribution (70%)
  gestureWeight: 0.2,   // Gesture contribution (20%)
  voiceWeight: 0.1,     // Voice contribution (10%)
  smoothingFactor: 0.3, // EMA alpha (higher = more responsive)
};
```

---

## Privacy & Security

### Local-First Processing
- ✓ Camera: Processed locally, never uploaded
- ✓ Voice: ASR via Web Speech API (no cloud unless opted-in)
- ✓ Face embeddings: Stored in browser only

### Explicit Consent
- Consent dialog on first launch
- Granular permission toggles (camera, voice, face auth)
- Clear data deletion option in Settings

### Data Retention
- Calibration data: localStorage (can be cleared)
- Face embeddings: IndexedDB (future, encrypted)
- Settings: localStorage (plain text, but non-sensitive)

### GDPR Compliance
- Right to access: Export all data (future feature)
- Right to deletion: "Clear All Data" in Settings
- Right to opt-out: Toggle any input source

---

## Performance Targets

### Latency Budget (Target ≤150ms)

| Component | Time |
|-----------|------|
| Camera capture | 0-33ms |
| MediaPipe inference | 30-50ms |
| Gaze estimation | 20-30ms |
| Gesture classification | 10-20ms |
| Fusion + smoothing | 5-10ms |
| UI render (60 FPS) | 16ms |
| **Total** | **81-159ms** ✓ |

### Frame Rate
- Target: 30 FPS camera, 60 FPS UI render
- Minimum acceptable: 15 FPS camera, 30 FPS UI

### Memory
- Target: <150 MB total
- Camera buffer: ~50 MB
- Models (TF Lite): <20 MB
- App + state: ~80 MB

---

## Troubleshooting

### Camera Permission Denied
**Issue:** "Camera access denied" error
**Solution:**
1. Check browser permissions (Settings → Privacy → Camera)
2. Ensure HTTPS (if not localhost)
3. Try incognito window

### Gaze Tracking Inaccurate
**Issue:** Cursor doesn't follow eyes
**Solution:**
1. Run calibration (Settings → Calibration → Calibrate Gaze)
2. Ensure good lighting (avoid backlighting)
3. Position camera 18-24 inches away
4. Adjust `gazeWeight` in fusion algorithm

### Voice Commands Not Working
**Issue:** "Commands not recognized"
**Solution:**
1. Check microphone permissions
2. Ensure Web Speech API is supported (check browser)
3. Speak clearly and pause between commands
4. Lower `minConfidence` in VoiceInput

### High Latency / Lag
**Issue:** Cursor lags behind eyes
**Solution:**
1. Close other browser tabs
2. Reduce screen resolution (temporarily)
3. Lower frame rate in CameraInput
4. Increase `smoothingFactor` for more lag, decrease for more jitter

---

## Testing

### Unit Tests
```bash
npm run test
# Run vitest suite
```

### Manual Testing Checklist
- [ ] Camera starts without permission errors
- [ ] Cursor moves smoothly following eyes
- [ ] Thumbs-up gesture triggers click
- [ ] Voice commands recognized and executed
- [ ] Settings panel opens/closes
- [ ] Calibration dialog launches
- [ ] "Clear Data" deletes stored settings
- [ ] App works offline (after initial load)

---

## Sample Code: Real-Time Cursor Update from Gaze

**File:** `src/modules/cursor/CursorController.tsx` (excerpt)

```typescript
useEffect(() => {
  const processFusion = () => {
    const now = performance.now();
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;

    // 1. Use gaze if recent (<200ms)
    if (currentGaze && currentGaze.timestamp > now - 200) {
      const calibratedX = currentGaze.x + fusionContextRef.current.calibrationOffset.x;
      const calibratedY = currentGaze.y + fusionContextRef.current.calibrationOffset.y;
      targetX = calibratedX;
      targetY = calibratedY;
    }

    // 2. Apply exponential moving average smoothing
    const smoothedX =
      targetX * (1 - fusionContextRef.current.smoothingFactor) +
      (cursorHistoryRef.current[0]?.x ?? targetX) * fusionContextRef.current.smoothingFactor;
    const smoothedY =
      targetY * (1 - fusionContextRef.current.smoothingFactor) +
      (cursorHistoryRef.current[0]?.y ?? targetY) * fusionContextRef.current.smoothingFactor;

    // 3. Update cursor state
    setCursorState({
      x: Math.round(smoothedX),
      y: Math.round(smoothedY),
    });
  };

  const intervalId = setInterval(processFusion, 16); // ~60 FPS
  return () => clearInterval(intervalId);
}, [currentGaze, setCursorState]);
```

---

## Sample Code: Left-Click from Gesture

**File:** `src/modules/cursor/CursorController.tsx` (excerpt)

```typescript
// === GESTURE-BASED ACTIONS ===
if (currentGesture.type !== 'none' && currentGesture.confidence > 0.8) {
  if (currentGesture.type === 'thumbs_up') {
    shouldClick = true;
  }
}

// === DEBOUNCE CLICKS ===
if (shouldClick && now - lastClickTimeRef.current > clickDebounceRef.current) {
  lastClickTimeRef.current = now;
  simulateClick(smoothedX, smoothedY);
}

function simulateClick(x: number, y: number) {
  const element = document.elementFromPoint(x, y) as HTMLElement;
  if (element) {
    element.click();
    console.log('Simulated click at', x, y);
  }
}
```

---

## Sample Code: Wake-Word Driven Command

**File:** `src/modules/voice/VoiceInput.tsx` (excerpt)

```typescript
const handleSpeechResult = (event: Event) => {
  const speechEvent = event as any;

  for (let i = speechEvent.resultIndex; i < speechEvent.results.length; i++) {
    const transcript = speechEvent.results[i][0].transcript;

    if (speechEvent.results[i].isFinal) {
      processCommand(transcript);
    }
  }
};

const processCommand = (transcript: string) => {
  const lowerTranscript = transcript.toLowerCase().trim();

  // 1. Check for wake word
  if (lowerTranscript.includes('hey air') || lowerTranscript.includes('air')) {
    console.log('Wake word detected');
    // Could trigger enhanced listening mode
  }

  // 2. Map transcript to command
  for (const [phrase, command] of Object.entries(commandMapRef.current)) {
    if (lowerTranscript.includes(phrase)) {
      const voiceCmd: VoiceCommand = {
        command,
        confidence: 0.85,
        timestamp: performance.now(),
      };
      setVoiceCommand(voiceCmd);
      console.log('Voice command:', command, transcript);
      return;
    }
  }
};
```

---

## Security & Privacy Guidelines

### Biometric Data Handling

**Face Embeddings:**
- Mathematical vector representation (not an image)
- Cannot be reversed to recreate face
- Stored locally in IndexedDB (encrypted in Phase 2)
- User can delete at any time

**Gaze Data:**
- Screen coordinates only (not eye features)
- Calibration offsets stored locally
- Historical gaze points kept in-memory only (lost on refresh)

### Consent Flow

**First Launch:**
1. Welcome screen
2. Permission grants (camera, voice, optional face auth)
3. Privacy policy & data handling
4. Explicit acceptance required

**Runtime:**
- Voice input: Toggle button always visible
- Face auth: Can disable in Settings
- Cloud sync: Opt-in only

### Data Deletion

**User can delete:**
- All calibration data
- Face embeddings
- Settings
- Via: Settings → Privacy → "Delete All Data"

---

## Phase 2 Roadmap (Weeks 4–12)

- [ ] **Multi-Gesture Vocab:** Point, swipe, pinch, rotate
- [ ] **Multi-User Profiles:** Per-user calibration & face auth
- [ ] **Offline Fallback:** Service Worker caching
- [ ] **Performance Tuning:** Web Workers, WASM acceleration
- [ ] **Cloud Sync:** Firebase / custom backend
- [ ] **Advanced Auth:** Liveness detection
- [ ] **Accessibility:** Calibration for users with motor disabilities
- [ ] **Mobile Apps:** Flutter implementation

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run tests: `npm run test`
5. Lint: `npm run lint`
6. Type check: `npm run type-check`
7. Submit a PR

---

## License

MIT License - See LICENSE file for details

---

## Support

- **Issues:** GitHub Issues
- **Feedback:** https://github.com/anomalyco/opencode
- **Documentation:** See ARCHITECTURE.md

---

## Acknowledgments

Built with:
- React + TypeScript
- MediaPipe (pose & hand detection)
- TensorFlow.js (on-device ML)
- Web Speech API (voice recognition)
- Zustand (state management)
- Tailwind CSS (styling)
- Vite (build tooling)

---

**Happy hands-free computing! 🚀**
