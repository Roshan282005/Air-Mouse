import React, { useState } from 'react';

interface ConsentFlowProps {
  onAccept: () => void;
}

/**
 * ConsentFlow Component
 * 
 * Privacy-first consent UI that explains:
 * - What data is collected (camera, voice, gesture)
 * - Where it's processed (local-first, optional cloud)
 * - User rights and opt-out options
 * - Biometric data handling
 */

const ConsentFlow: React.FC<ConsentFlowProps> = ({ onAccept }) => {
  const [step, setStep] = useState<'welcome' | 'permissions' | 'privacy'>('welcome');
  const [accepted, setAccepted] = useState({
    camera: false,
    voice: false,
    faceAuth: false,
  });

  const handleAccept = () => {
    localStorage.setItem('air-mouse-consent', 'accepted');
    localStorage.setItem('air-mouse-permissions', JSON.stringify(accepted));
    onAccept();
  };

  const handleReject = () => {
    localStorage.setItem('air-mouse-consent', 'rejected');
    window.location.href = 'about:blank';
  };

  const togglePermission = (key: keyof typeof accepted) => {
    setAccepted((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center p-4">
      <div className="glass-dark p-8 rounded-2xl max-w-2xl w-full backdrop-blur-2xl">
        {step === 'welcome' && (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-accent-cyan">Welcome to Air-Mouse</h1>
            <p className="text-lg text-gray-300">
              Control your cursor, click, and scroll with your eyes, gestures, and voice.
            </p>
            <div className="space-y-3 text-sm text-gray-400">
              <p>✓ Real-time hand gesture recognition</p>
              <p>✓ Gaze-based cursor tracking</p>
              <p>✓ Voice command control</p>
              <p>✓ All processing done locally on your device</p>
            </div>
            <button
              onClick={() => setStep('permissions')}
              className="w-full py-3 bg-accent-cyan text-slate-900 font-semibold rounded-lg hover:bg-cyan-400 transition"
            >
              Continue
            </button>
          </div>
        )}

        {step === 'permissions' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-accent-cyan">Permissions & Privacy</h2>

            <div className="space-y-4">
              <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input
                  type="checkbox"
                  checked={accepted.camera}
                  onChange={() => togglePermission('camera')}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold">Camera Access</p>
                  <p className="text-xs text-gray-400">
                    For gaze tracking and gesture recognition. Video is never uploaded.
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input
                  type="checkbox"
                  checked={accepted.voice}
                  onChange={() => togglePermission('voice')}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold">Microphone Access</p>
                  <p className="text-xs text-gray-400">
                    For voice commands. Audio processing happens locally.
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition">
                <input
                  type="checkbox"
                  checked={accepted.faceAuth}
                  onChange={() => togglePermission('faceAuth')}
                  className="w-5 h-5"
                />
                <div>
                  <p className="font-semibold">Face Authentication (Optional)</p>
                  <p className="text-xs text-gray-400">
                    For multi-user support. Face embeddings stored locally only.
                  </p>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setStep('privacy')}
                className="w-full py-3 bg-accent-cyan text-slate-900 font-semibold rounded-lg hover:bg-cyan-400 transition"
                disabled={!accepted.camera || !accepted.voice}
              >
                Next: Privacy Policy
              </button>
              <button
                onClick={() => setStep('welcome')}
                className="w-full py-3 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {step === 'privacy' && (
          <div className="space-y-6 max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-bold text-accent-cyan">Privacy & Data Policy</h2>

            <div className="space-y-3 text-sm text-gray-300">
              <section>
                <h3 className="font-semibold text-accent-purple mb-1">Data Processing</h3>
                <p className="text-xs">
                  All video, audio, and biometric data is processed locally on your device. No data is transmitted to servers unless you explicitly enable cloud sync.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-accent-purple mb-1">Data Retention</h3>
                <p className="text-xs">
                  Calibration data and face embeddings are stored in your browser's local storage. You can delete this data at any time in Settings.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-accent-purple mb-1">Your Rights</h3>
                <p className="text-xs">
                  • Right to access: View all stored biometric data
                  <br />
                  • Right to deletion: Clear all data with one click
                  <br />
                  • Right to opt-out: Disable any feature at any time
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-accent-purple mb-1">Biometric Data</h3>
                <p className="text-xs">
                  Face embeddings are mathematical representations of your facial features, not images. They cannot be reverse-engineered to recreate your face. They are stored locally only.
                </p>
              </section>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-3 bg-accent-cyan text-slate-900 font-semibold rounded-lg hover:bg-cyan-400 transition"
              >
                I Accept
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-3 bg-red-500/50 text-white font-semibold rounded-lg hover:bg-red-600/50 transition"
              >
                Decline
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsentFlow;
