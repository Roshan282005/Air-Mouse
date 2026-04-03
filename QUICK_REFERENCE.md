# Air-Mouse: Quick Reference Guide

## Installation (5 min)

```bash
git clone https://github.com/your-org/air-mouse.git
cd air-mouse
npm install
npm run dev
# → http://localhost:3000
```

## First Time Setup

1. **Grant permissions** in browser:
   - ✓ Camera access
   - ✓ Microphone access
   - ✓ (Optional) Face authentication

2. **Calibrate gaze:**
   - Click ⚙️ (bottom-left)
   - Select "Calibration" tab
   - Click "Calibrate Gaze Tracking"
   - Follow on-screen guide

3. **Test inputs:**
   - Move eyes → cursor follows
   - Thumbs up → click
   - Say "scroll down" → page scrolls

## Core Files (Where to Make Changes)

| File | Purpose | Quick Edit |
|------|---------|-----------|
| `src/App.tsx` | Main app logic | Entry point |
| `src/modules/cursor/CursorController.tsx` | Fusion algorithm | Adjust weights (line ~50) |
| `src/modules/gesture/GestureEngine.tsx` | Gesture detection | Min confidence (line ~40) |
| `src/modules/voice/VoiceInput.tsx` | Voice commands | Add commands (line ~50) |
| `src/store/airMouseStore.ts` | State management | Add new state fields |
| `src/styles/globals.css` | Styling | Aurora colors |

## Common Tasks

### Add a New Gesture

1. **In `src/modules/gesture/GestureEngine.tsx`:**
   ```typescript
   const randomGesture = [
     'thumbs_up', 'thumbs_down', 'palm_open', 'fist', 
     'peace_sign'  // ← Add new
   ][...];
   ```

2. **In `src/modules/cursor/CursorController.tsx`:**
   ```typescript
   if (currentGesture.type === 'peace_sign') {
     // Define action
   }
   ```

### Adjust Fusion Weights

**File:** `src/modules/cursor/CursorController.tsx` (line ~50)

```typescript
fusionContextRef.current = {
  gazeWeight: 0.8,      // Increase for gaze-heavy
  gestureWeight: 0.15,  // Decrease if too sensitive
  voiceWeight: 0.05,    // Adjust as needed
  smoothingFactor: 0.2, // Lower = more responsive
};
```

### Add a New Voice Command

**File:** `src/modules/voice/VoiceInput.tsx` (line ~50)

```typescript
commandMapRef.current = {
  'click': 'click',
  'scroll up': 'scroll_up',
  'scroll down': 'scroll_down',
  'pause': 'pause',
  'maximize': 'maximize',  // ← Add
};
```

**Then handle in CursorController:**
```typescript
if (currentVoiceCommand.command === 'maximize') {
  // Execute maximize
}
```

### Change UI Theme

**File:** `src/styles/globals.css`

```css
:root {
  --color-accent: #00d9ff;           /* Cyan */
  --color-accent-secondary: #7c3aed; /* Purple */
  --blur-strength: 20px;
}

/* Aurora colors - adjust as needed */
.aurora-glow {
  background: linear-gradient(135deg, var(--color-accent), var(--color-accent-secondary));
}
```

### Adjust Latency

1. **Camera FPS:** `src/modules/camera/CameraInput.tsx`
   ```typescript
   // Change frame rate
   const processFrame = () => {
     // Currently 33ms (30 FPS)
     // Make faster = more CPU
     animationId = requestAnimationFrame(processFrame);
   };
   ```

2. **Smoothing:** `src/modules/cursor/CursorController.tsx`
   ```typescript
   smoothingFactor: 0.3  // Lower = less lag, more jitter
   ```

## Performance Debugging

### Check Latency
1. Open Chrome DevTools (F12)
2. Go to **Performance** tab
3. Click **Record**
4. Perform gesture/gaze action
5. Stop recording
6. Look for frame rate & function duration

### Check Memory Usage
1. DevTools → **Memory** tab
2. Take heap snapshot
3. Look for large allocations
4. Check for memory leaks (repeated snapshots)

### Check FPS
1. DevTools → **Console**
2. Run:
   ```javascript
   // Add FPS counter
   let lastTime = performance.now();
   let fps = 0;
   setInterval(() => {
     const now = performance.now();
     fps = 1000 / (now - lastTime);
     console.log(`FPS: ${fps.toFixed(1)}`);
     lastTime = now;
   }, 1000);
   ```

## Build for Production

```bash
npm run build          # Create optimized bundle
npm run preview        # Test locally
npm run type-check    # Verify types
npm run lint          # Check code quality
```

## Deploy

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
# → https://air-mouse.vercel.app
```

### Netlify
```bash
npm install -g netlify-cli
netlify deploy
# → https://air-mouse.netlify.app
```

### Docker
```bash
docker build -t air-mouse .
docker run -p 80:80 air-mouse
# → http://localhost
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Camera not working | Check permissions, try HTTPS, use incognito |
| Gaze inaccurate | Run calibration, check lighting, adjust smoothing |
| Voice not recognized | Speak clearly, check microphone, lower confidence threshold |
| Cursor jerky | Increase smoothing factor (0.4-0.5) |
| High latency | Reduce resolution, close other tabs, disable effects |
| Out of memory | Reduce gaze buffer size, disable face embeddings |

## Documentation

| Document | Read If... |
|----------|-----------|
| README.md | You're setting up the project |
| ARCHITECTURE.md | You want to understand how it works |
| API_CONTRACTS.md | You're adding new modules |
| PRIVACY.md | You want privacy/security details |
| BUILD_DEPLOY.md | You're deploying to production |
| MVP_SUMMARY.md | You want a complete overview |

## Key Code Patterns

### Using Zustand Store in Component

```typescript
import { useAirMouseStore } from '@/store/airMouseStore';

function MyComponent() {
  const { currentGaze, setCursorState } = useAirMouseStore();
  
  useEffect(() => {
    if (currentGaze) {
      // Do something with gaze
    }
  }, [currentGaze]);
}
```

### Dispatching Custom Events

```typescript
// Send event
window.dispatchEvent(new CustomEvent('camera-frame', {
  detail: { imageData, timestamp },
}));

// Listen
window.addEventListener('camera-frame', (event) => {
  const { imageData, timestamp } = event.detail;
});
```

### Updating Store

```typescript
const { setCursorState, setGesture } = useAirMouseStore();

// Update cursor
setCursorState({
  x: 100,
  y: 200,
  isClicking: true,
});

// Update gesture
setGesture({
  type: 'thumbs_up',
  confidence: 0.95,
  timestamp: performance.now(),
});
```

## Performance Targets

| Metric | Target | How to Verify |
|--------|--------|---------------|
| Latency | ≤150ms | Chrome DevTools Performance tab |
| Camera FPS | 30 FPS | Console: measure frame time |
| UI FPS | 60 FPS | Chrome DevTools Rendering |
| Memory | <150 MB | Chrome DevTools Memory |
| Bundle | <500 KB (gzipped) | `npm run build` output |

## Useful Chrome DevTools Tips

```javascript
// In console:

// Profile gesture detection
console.time('gesture');
// ... gesture code
console.timeEnd('gesture');

// Log all store updates
const store = useAirMouseStore.getState();
console.log(store);

// Test click simulation
document.elementFromPoint(100, 100).click();

// Check permissions
navigator.permissions.query({ name: 'camera' });
```

## Git Workflow

```bash
# Feature branch
git checkout -b feat/new-gesture
git add .
git commit -m "feat: add peace sign gesture"
git push origin feat/new-gesture

# Create PR, wait for review
# Merge when approved
git checkout main
git pull
```

## Environment Variables

Create `.env.local`:
```
VITE_API_URL=http://localhost:3001
VITE_ENABLE_SENTRY=false
VITE_ENVIRONMENT=development
```

## Running Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

## TypeScript Tips

```typescript
// Check for type errors without building
npm run type-check

// Inspect type definitions
Hover in VS Code or check .d.ts files

// Add new types
// → Edit src/store/airMouseStore.ts
```

## Resources

- **MediaPipe Docs:** https://developers.google.com/mediapipe
- **TensorFlow.js:** https://www.tensorflow.org/js
- **React Hooks:** https://react.dev/reference/react/hooks
- **Zustand:** https://github.com/pmndrs/zustand
- **Vite:** https://vitejs.dev/
- **Web Speech API:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

## Quick Checklist Before Commit

- [ ] `npm run type-check` passes
- [ ] `npm run lint` shows no errors
- [ ] Component renders without errors
- [ ] No console warnings
- [ ] Latency acceptable (<150ms)
- [ ] Memory stable (no leaks)
- [ ] Comments added for complex logic

## Contact & Support

- **Questions:** Refer to README.md or ARCHITECTURE.md
- **Bug Report:** GitHub Issues
- **Security Issue:** security@air-mouse.local (private)
- **Feedback:** team@air-mouse.local

---

**Last Updated:** April 2026
**Version:** 1.0.0 MVP

Happy coding! 🚀
