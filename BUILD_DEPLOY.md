# Build, Deployment & Operations Guide

## Table of Contents

1. [Local Development](#local-development)
2. [Building for Production](#building-for-production)
3. [Deployment Options](#deployment-options)
4. [Performance Optimization](#performance-optimization)
5. [Monitoring & Debugging](#monitoring--debugging)
6. [ML Model Management](#ml-model-management)
7. [CI/CD Pipeline](#cicd-pipeline)

---

## Local Development

### Prerequisites

```bash
# Required
- Node.js 16+ (18+ recommended)
- npm 8+ or yarn 3+
- Python 3.8+ (for ML pipeline)
- Git

# Optional
- Docker (for containerized development)
- VS Code + extensions (ESLint, TypeScript, Prettier)
```

### Initial Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/air-mouse.git
cd air-mouse

# 2. Install dependencies
npm install

# 3. Verify installation
npm run type-check   # Check TypeScript
npm run lint         # Check code quality
```

### Running Development Server

```bash
npm run dev
# Output:
#   VITE v4.4.0  ready in 245 ms
#   ➜  Local:   http://localhost:3000/
#   ➜  press h to show help

# Open http://localhost:3000 in browser
# Changes auto-reload with HMR
```

### Hot Module Replacement (HMR)

All source files support HMR:
- Edit `.tsx` files → auto-reload (state preserved)
- Edit `.css` files → instant CSS injection
- Edit store → state persists

---

## Building for Production

### Optimization Checklist

```bash
# 1. Type checking
npm run type-check
# Should output: "No errors found"

# 2. Linting
npm run lint
# Should show: "0 errors, 0 warnings"

# 3. Testing (if added)
npm run test
# All tests should pass

# 4. Production build
npm run build
# Output: dist/ folder with optimized assets
```

### Build Output

```
dist/
├── index.html                 # Entry point (~2 KB)
├── assets/
│   ├── index-[hash].js       # Main bundle (gzipped: ~150 KB)
│   ├── vendor-[hash].js      # React, dependencies (~100 KB gzipped)
│   ├── mediapipe-[hash].js   # MediaPipe chunk (~50 KB gzipped)
│   ├── index-[hash].css      # Styles (~30 KB)
│   └── ... (other chunks)
└── vite.svg                   # Logo

# Total size target: <300 KB gzipped
```

### Build Configuration

**vite.config.ts** optimizations:

```typescript
build: {
  outDir: 'dist',
  sourcemap: true,              // Debug in production
  rollupOptions: {
    output: {
      manualChunks: {
        mediapipe: ['mediapipe'],
        vendor: ['react', 'react-dom'],
      },
    },
  },
}
```

### Preview Production Build

```bash
# Build optimized version
npm run build

# Serve it locally
npm run preview
# Output: http://localhost:4173/

# Test in production mode before deploying
```

---

## Deployment Options

### Option 1: Static Hosting (Recommended for MVP)

**Platforms:** Vercel, Netlify, GitHub Pages, AWS S3 + CloudFront

#### Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Output:
#    Deployed to https://air-mouse.vercel.app/

# Environment: Automatically detects Vite project
```

**vercel.json** (optional):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

#### Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy

# 3. Output:
#    Deployed to https://air-mouse.netlify.app/
```

**netlify.toml**:
```toml
[build]
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

#### GitHub Pages

```bash
# 1. Update vite.config.ts
# base: '/air-mouse/' (if deploying to subdirectory)

# 2. Deploy script in package.json
npm run build
git add dist/
git commit -m "Deploy to GitHub Pages"
git push
```

### Option 2: Docker Container

**Dockerfile**:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Build & Run:**
```bash
docker build -t air-mouse:latest .
docker run -p 80:80 air-mouse:latest
# Access at http://localhost/
```

### Option 3: Cloud Functions (AWS Lambda, Google Cloud Functions)

For serverless deployment with backend (future):

```typescript
// api/app.ts - Express server
import express from 'express';
import { handler } from 'vite-ssr';

const app = express();
app.use('/', handler);
export default app;
```

---

## Performance Optimization

### Bundle Size Optimization

**Current targets:**

| Metric | Target | Actual |
|--------|--------|--------|
| Total gzipped | <500 KB | ~300 KB |
| JS | <300 KB | ~200 KB |
| CSS | <50 KB | ~30 KB |
| Initial load | <2s | ~1.2s |

### Code Splitting

**Automatic splitting in vite.config.ts:**

```typescript
rollupOptions: {
  output: {
    manualChunks: {
      mediapipe: ['mediapipe'],           // Separate chunk
      vendor: ['react', 'react-dom'],    // Vendor chunk
      store: ['zustand'],                 // Store chunk
    },
  },
}
```

### Lazy Loading Models

**Load ML models on-demand:**

```typescript
// Don't load gesture model until first gesture needed
let gestureModel: any = null;

async function loadGestureModel() {
  if (gestureModel) return gestureModel;
  
  const response = await fetch('/models/gesture_model.tflite');
  gestureModel = await response.arrayBuffer();
  return gestureModel;
}
```

### Image Optimization

**Tailwind CSS purging:**

```javascript
// tailwind.config.js
content: [
  "./index.html",
  "./src/**/*.{js,ts,jsx,tsx}",
],
// Removes unused CSS (~30% reduction)
```

### Compression

**Enable Gzip on server:**

```nginx
# nginx.conf
gzip on;
gzip_types text/plain application/javascript text/css application/json;
gzip_min_length 1000;
gzip_compress_level 6;
```

---

## Monitoring & Debugging

### Browser DevTools

```bash
# Chrome DevTools
- Press F12 or Cmd+Option+I
- Performance tab: Measure frame rate
- Console: Check for errors
- Network: Monitor API calls
- Storage: Inspect localStorage/IndexedDB
```

### Performance Profiling

```typescript
// Add performance markers
performance.mark('gaze-start');
// ... gaze processing
performance.mark('gaze-end');
performance.measure('gaze', 'gaze-start', 'gaze-end');

const measure = performance.getEntriesByName('gaze')[0];
console.log(`Gaze processing: ${measure.duration.toFixed(2)}ms`);
```

### Remote Debugging

**React DevTools Browser Extension:**
```bash
# Install: Chrome Web Store
# Inspect component hierarchy
# Track state & prop changes
# Replay component actions
```

### Error Tracking (Future)

```typescript
// Optional: Sentry for error tracking
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://key@sentry.io/project",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,  // 10% of errors
});
```

---

## ML Model Management

### Training & Export Workflow

```bash
# 1. Setup Python environment
cd ml
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 2. Train models
python scripts/train_gesture_model.py
# Output: Models with improved accuracy

# 3. Export to web formats
python scripts/export_models.py
# Output:
#   ../public/models/gesture_model.tflite
#   ../public/models/gesture_model.onnx
#   ../public/models/gaze_model.tflite

# 4. Copy to public folder
cp ml/models/* public/models/

# 5. Rebuild web app
npm run build
```

### Model Versioning

```
public/models/
├── gesture_model.v1.tflite    # Production
├── gesture_model.v2.tflite    # Beta testing
├── gesture_model.onnx          # Browser fallback
└── gaze_model.v1.tflite       # Current
```

**Version control in app:**

```typescript
const MODEL_VERSIONS = {
  gesture: 'v1',
  gaze: 'v1',
};

// Load versioned model
async function loadGestureModel() {
  const version = MODEL_VERSIONS.gesture;
  return fetch(`/models/gesture_model.${version}.tflite`);
}
```

### A/B Testing Models

```typescript
// Route based on experiment ID
const experimentId = getExperimentId();

if (experimentId === 'gesture_v2') {
  // Test new gesture model
  return loadModel('gesture_model.v2.tflite');
} else {
  // Production model
  return loadModel('gesture_model.v1.tflite');
}
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

**.github/workflows/deploy.yml:**

```yaml
name: Build and Deploy

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Type check
        run: npm run type-check
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Test bundle size
        run: |
          SIZE=$(gzip -c dist/index.html | wc -c)
          echo "Bundle size: $SIZE bytes"
          if [ $SIZE -gt 512000 ]; then
            echo "Bundle too large!"
            exit 1
          fi
      
      - name: Deploy to Vercel
        if: github.ref == 'refs/heads/main'
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### Pre-Commit Hooks

**setup-husky.sh:**

```bash
#!/bin/bash
npx husky install
npx husky add .husky/pre-commit "npm run lint && npm run type-check"
npx husky add .husky/pre-push "npm run build"
```

---

## Troubleshooting Deployment

### Build Fails: Module Not Found

```bash
Error: Cannot find module 'mediapipe'

# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Or: Update package.json
npm install mediapipe@latest
```

### High Latency in Production

```bash
# 1. Check server response time
# DevTools → Network → Slow 3G

# 2. Enable compression
# Server: gzip on

# 3. Reduce bundle size
# npm run build -- --analyze

# 4. Cache models
# Add Cache-Control headers
```

### CORS Errors (if loading external models)

```nginx
# nginx.conf
add_header Access-Control-Allow-Origin *;
add_header Access-Control-Allow-Methods "GET, OPTIONS";
```

### WebRTC Camera Not Working

```typescript
// Check HTTPS requirement (localhost exempt)
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  console.error('WebRTC requires HTTPS');
}
```

---

## Environment Variables

**.env.example:**
```
VITE_API_URL=https://api.air-mouse.local
VITE_ENABLE_SENTRY=false
VITE_SENTRY_DSN=
VITE_ENVIRONMENT=development
```

**Usage in code:**

```typescript
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const enableSentry = import.meta.env.VITE_ENABLE_SENTRY === 'true';
```

---

## Maintenance & Updates

### Security Patching

```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Check outdated packages
npm outdated

# Update minor versions
npm update

# Update major versions (careful!)
npm install package@latest
```

### Dependency Updates

```bash
# Update single package
npm install react@latest

# Update all
npm install --save-dev typescript@latest eslint@latest

# Check before updating
npm ls react  # Show current version

# Verify compatibility
npm run type-check && npm run build
```

---

## Conclusion

This guide covers the complete development, build, and deployment lifecycle for Air-Mouse MVP. Adjust configurations based on your specific hosting platform and requirements.

**Key takeaways:**
- Local dev: `npm run dev`
- Production build: `npm run build`
- Deploy: Vercel, Netlify, or Docker
- Monitor: React DevTools + Performance API
- ML: Train in Python, export to TF Lite/ONNX

For questions: Refer to main README.md or create an issue.
