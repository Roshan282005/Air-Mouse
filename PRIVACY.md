# Air-Mouse Privacy & Security Policy

## Executive Summary

Air-Mouse is a **privacy-first, local-processing-by-default** application. All camera, voice, and biometric data is processed on your device. No data is transmitted to external servers without explicit user consent.

---

## 1. Data Collection & Processing

### What Data is Collected?

| Data Type | Source | Processing | Storage |
|-----------|--------|------------|---------|
| **Camera frames** | Webcam | MediaPipe (local) | In-memory only |
| **Face landmarks** | Camera → MediaPipe | Gaze estimation (local TF.js) | In-memory only |
| **Hand landmarks** | Camera → MediaPipe | Gesture classification (local) | In-memory only |
| **Audio stream** | Microphone | Web Speech API (local/cloud) | Not stored |
| **Voice commands** | Audio → ASR | Command extraction (local) | Not stored |
| **Cursor position** | Computed from gaze | Fusion algorithm (local) | RAM only |
| **Calibration data** | User-generated | Stored locally | localStorage |
| **Face embeddings** | Face detection → Feature extraction | Local embedding generation | IndexedDB (future, optional) |

### Local-First Processing

```
Camera Input → [On-Device Processing] → Cursor Action
                 ✓ No cloud connection
                 ✓ Instant feedback
                 ✓ Full privacy
```

---

## 2. Privacy Guarantees

### What is NOT Collected

- ✗ Personal identification
- ✗ Facial images (only mathematical embeddings)
- ✗ Audio recordings (only transcribed text)
- ✗ Identity-linked profiles (unless explicitly saved)
- ✗ Behavioral tracking (no analytics by default)
- ✗ Location data
- ✗ Device identifiers

### What Stays Local

- Camera video: **Processed, not stored**
- Face landmarks: **Used for gaze, not stored**
- Hand gestures: **Classified, not stored**
- Voice audio: **Transcribed, not stored**
- Cursor movements: **Computed, not logged**

### What is Stored (with consent)

| Data | Location | Encryption | Retention |
|------|----------|------------|-----------|
| Calibration offsets | localStorage | No (non-sensitive) | Until cleared |
| Face embeddings | IndexedDB (future) | Yes (Phase 2) | Until deleted |
| Settings (non-sensitive) | localStorage | No | Until cleared |
| Voice consent flag | localStorage | No | Until revoked |

---

## 3. Data Flow Architecture

### Scenario 1: Normal Usage (No Cloud)

```
User starts app
    ↓
[Consent Dialog]
    ├→ User grants camera access
    ├→ User grants microphone access
    └→ localStorage.setItem('air-mouse-consent', 'accepted')
    ↓
[Camera Feed Starts]
    ├→ Video processed in-memory
    ├→ MediaPipe extracts landmarks (21 hand points, 468 face points)
    ├→ Gaze estimated from face landmarks
    ├→ NO transmission to servers
    └→ Cursor position computed and rendered
    ↓
[Voice Commands]
    ├→ Web Speech API (browser built-in)
    ├→ Audio processed locally
    ├→ Command text extracted
    ├→ Audio NOT stored
    └→ Command executed
    ↓
[Calibration Data]
    ├→ User runs 9-point gaze calibration
    ├→ Offsets computed: { x: 42, y: -15 }
    └→ Stored in localStorage (not encrypted, non-sensitive)
```

**Result:** Zero external connections, full privacy ✓

### Scenario 2: Cloud Sync Enabled (with explicit consent)

```
User opts-in to cloud sync in Settings
    ↓
[Sync Service]
    ├→ Uploads: Calibration data only
    ├→ HTTPS encrypted
    ├→ User account required
    ├→ Server: No video, no audio, no raw biometrics
    └→ Purpose: Cross-device calibration (future)
```

**User must explicitly opt-in.** Off by default.

---

## 4. Biometric Data Handling

### Face Embeddings (Phase 2)

**What are embeddings?**
- Mathematical vector (e.g., 512 dimensions)
- Derived from facial features
- Cannot be reversed to recreate face
- Similar to a fingerprint: unique but not an image

**Storage & Security:**
- Stored in browser's IndexedDB
- Encrypted with user passphrase (future)
- User can delete at any time
- Not transmitted without consent

**Use Cases:**
- Multi-user authentication
- Per-user calibration profiles
- Liveness detection (spoofing prevention)

**Non-Use:**
- No facial recognition (not identifying who you are)
- No biometric authentication to external services
- No sharing with third parties

### Gaze Data

**What is captured:**
- Screen coordinates: (x, y)
- NOT raw eye features
- NOT pupil size or eye movements beyond position

**Storage:**
- Kept in-memory only (lost on page refresh)
- Gaze points history: last 100 points (RAM)
- No persistent storage of gaze history

**Non-Use:**
- No behavioral analysis
- No attention tracking
- No emotion detection (future consideration)

---

## 5. Voice Processing

### Web Speech API (Default)

**Processing:**
- Audio stream: Processed by browser's built-in ASR
- No recording
- Real-time transcription
- Command extraction happens locally

**Privacy:**
- Audio never leaves device (in offline mode)
- Text only is generated
- Text NOT stored

### Optional: Cloud ASR (Future)

If user enables cloud ASR for better accuracy:
- Audio is encrypted and sent to cloud service
- User must explicitly opt-in
- Service: e.g., Google Speech-to-Text
- User can revoke at any time

**User controls:**
```typescript
enableCloudSync: false  // Default: off
```

---

## 6. Consent & User Control

### Consent Flow (First Launch)

```
┌─────────────────────────┐
│  Welcome to Air-Mouse   │  ← Welcome screen
└─────────────────────────┘
           ↓
┌────────────────────────────┐
│  Permissions & Privacy     │  ← User toggles:
│  ☑ Camera access          │    ✓ Camera (required)
│  ☑ Microphone access      │    ✓ Voice (required)
│  ☐ Face authentication    │    ☐ Optional: Face auth
└────────────────────────────┘
           ↓
┌────────────────────────────┐
│  Privacy Policy & Rights   │  ← Detailed explanation:
│  • Data is local           │    - What's stored
│  • You can delete anytime  │    - Deletion process
│  • No cloud unless opted   │    - Cloud opt-in
│  • Clear data button       │    - User rights
│  [I ACCEPT] [DECLINE]     │    - Biometric handling
└────────────────────────────┘
```

### Runtime Controls

**Settings Panel:**
```typescript
┌─────────────────────────────┐
│  General Settings           │
│  ☑ Face Authentication      │
│  ☐ Cloud Sync (optional)    │
│  [Calibrate Gaze Tracking]  │
└─────────────────────────────┘
     ↓
┌─────────────────────────────┐
│  Privacy & Data             │
│  Stored data:               │
│  • Calibration offsets      │
│  • Face embeddings (if any) │
│                             │
│  [DELETE ALL DATA]          │
│                             │
│  Warning: This cannot be    │
│  undone. All settings will  │
│  be reset.                  │
└─────────────────────────────┘
```

### User Rights

| Right | Implementation |
|------|-----------------|
| **Right to Know** | ConsentFlow explains all data collection |
| **Right to Access** | Settings shows all stored data (future export) |
| **Right to Delete** | "Delete All Data" button clears everything |
| **Right to Opt-Out** | Can disable any input (camera, voice, face) |
| **Right to Revoke Consent** | Can revoke cloud sync anytime |
| **Right to Portability** | Can export calibration data (future) |

---

## 7. Data Retention & Deletion

### Default Retention

| Data | Retention | Delete Method |
|------|-----------|----------------|
| In-memory (camera, landmarks) | Until page close | Automatic |
| Gaze history (100-point buffer) | RAM until close | Automatic |
| Calibration data | Indefinite | Settings → Delete |
| Voice commands (transcribed) | Not stored | N/A |
| Settings | Indefinite | Settings → Delete |
| Face embeddings (future) | Indefinite | Settings → Delete |

### Explicit Deletion

**User can delete all data in Settings:**

```typescript
handleClearData = () => {
  if (confirm('Delete all stored data? This cannot be undone.')) {
    localStorage.clear();
    indexedDB.deleteDatabase('AirMouseDB');
    // Reset state
    setCalibrationData({});
    alert('All data cleared successfully');
  }
};
```

**What gets deleted:**
- ✓ Calibration offsets
- ✓ Face embeddings
- ✓ Preferences
- ✓ Consent flags
- ✓ All IndexedDB records

---

## 8. Third-Party Integrations

### No Third-Party Tracking

- ✗ No Google Analytics
- ✗ No Mixpanel
- ✗ No Sentry (error tracking optional, anonymized)
- ✗ No CDN user tracking
- ✗ No ads or ad networks

### Optional Services (Phase 2)

If enabled, only with explicit consent:

| Service | Purpose | Data | Auth |
|---------|---------|------|------|
| Firebase Realtime DB | Cloud sync (optional) | Calibration data | User consent |
| Google Speech-to-Text | Enhanced voice accuracy | Audio (encrypted) | User opt-in |

---

## 9. Security Measures

### Data Transmission

**Rule:** HTTPS only
- All cloud communications use HTTPS
- No plain HTTP allowed
- Certificate pinning (future)

### Storage

**localStorage (Non-Sensitive):**
- Calibration offsets
- Settings flags
- Consent status
- Unencrypted but non-sensitive

**IndexedDB (Biometric Data, Phase 2):**
- Face embeddings
- Encrypted with user passphrase
- Cannot be accessed by other origins

### Code & Dependency Security

- Regular npm audit
- TypeScript strict mode
- No untrusted external scripts
- All dependencies reviewed

---

## 10. Compliance & Standards

### GDPR (General Data Protection Regulation)

| Requirement | Implementation |
|-------------|-----------------|
| **Consent** | Explicit opt-in consent flow |
| **Transparency** | ConsentFlow explains all processing |
| **Right to Access** | Settings shows all data |
| **Right to Deletion** | Delete All Data button |
| **Data Minimization** | No unnecessary data collection |
| **Processing Limits** | Data used only for cursor control |
| **Data Protection** | Local-first, HTTPS, encryption (phase 2) |

### CCPA (California Consumer Privacy Act)

| Right | Implementation |
|-------|-----------------|
| **Right to Know** | Privacy policy and consent flow |
| **Right to Delete** | Delete All Data in Settings |
| **Right to Opt-Out** | Cloud sync opt-in (default: off) |
| **Non-Discrimination** | Service works without cloud sync |

### HIPAA (if used in medical context, future)

- Data de-identification (strip PII)
- Audit logs for access (future)
- Business associate agreements (future)
- Encryption at rest and in transit (future)

---

## 11. Vulnerability Disclosure

### Report Security Issues

**Do not open public GitHub issues for security vulnerabilities.**

Instead, email: `security@air-mouse.local` with:
- Vulnerability description
- Steps to reproduce
- Affected version
- Proposed fix (optional)

We will:
1. Acknowledge receipt within 48 hours
2. Investigate and confirm
3. Release fix in minor version
4. Credit reporter (if desired)

---

## 12. Policy Updates

### Versioning

- **v1.0.0:** Initial MVP (local-first, no cloud)
- **v1.1.0:** Add cloud sync option (Phase 2)
- **v2.0.0:** Advanced biometrics & compliance (Phase 3+)

### Notification

If privacy policy changes:
- Users will be notified in-app
- 30-day notice before enforcement
- Re-consent required for major changes
- Option to opt-out

---

## 13. FAQ

**Q: Is my camera recording me?**
A: No. Your camera is only processed in real-time for gaze estimation. Video is never stored or transmitted.

**Q: Can Air-Mouse identify me by my face?**
A: No. It does not perform facial recognition. It only extracts face landmarks to estimate gaze direction.

**Q: Is my voice recorded?**
A: No. Audio is transcribed locally to text. The audio stream is not recorded or stored.

**Q: What happens if I close the browser?**
A: All in-memory data (gaze history, face landmarks) is cleared. Only calibration data (if saved) remains in localStorage.

**Q: Can I use Air-Mouse offline?**
A: Yes. All core features work offline. Cloud sync (if enabled) will sync when reconnected.

**Q: How do I delete my data?**
A: Settings → Privacy → "Delete All Data". This clears calibration, embeddings, and all stored settings.

**Q: Is encryption enabled?**
A: Yes for any cloud transmission (HTTPS). Local storage is not encrypted (Phase 2 will add encryption).

**Q: Can someone hack my biometric data?**
A: Face embeddings are stored locally in your browser. External actors cannot access them without compromising your device first. Even then, embeddings cannot be reversed to recreate your face.

---

## 14. Contact & Support

**Questions about privacy?**
- Email: `privacy@air-mouse.local`
- File an issue: GitHub Issues (non-sensitive only)
- Privacy Policy feedback: `policy@air-mouse.local`

---

## 15. Appendix: Technical Implementation

### Data Types (TypeScript)

```typescript
// No PII
interface GazePoint {
  x: number;        // Screen coordinate
  y: number;        // Screen coordinate
  timestamp: number;
}

// Landmarks, not identity
interface FaceData {
  landmarks: Array<[x, y, z]>;  // 468 points
  confidence: number;
}

// Text only, no audio
interface VoiceCommand {
  command: 'click' | 'scroll_up' | 'scroll_down' | 'pause';
  confidence: number;
  timestamp: number;
}

// Mathematical vector, not reversible
interface FaceEmbedding {
  vector: number[];  // e.g., 512-dimensional
  label?: string;    // User's name (optional, if storing)
}
```

### Encryption (Phase 2 Plan)

```typescript
// Face embeddings encryption
const encryptedEmbedding = encryptData(
  JSON.stringify(faceEmbedding),
  userPassphrase
);
await indexedDB.store('embeddings').put(encryptedEmbedding);
```

---

**Last Updated:** April 2026
**Version:** 1.0.0
**Status:** Live

This privacy policy describes the current MVP (v1.0.0). Updates will be published as new features are released.
