import React, { useEffect, useState } from 'react';
import { useAirMouseStore } from './store/airMouseStore';
import CameraInput from './modules/camera/CameraInput';
import GestureEngine from './modules/gesture/GestureEngine';
import VoiceInput from './modules/voice/VoiceInput';
import CursorController from './modules/cursor/CursorController';
import FaceAuth from './modules/auth/FaceAuth';
import ConsentFlow from './components/ConsentFlow';
import MainUI from './components/MainUI';

const App: React.FC = () => {
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(true);
  const { initStore } = useAirMouseStore();

  useEffect(() => {
    // Initialize store and check consent
    const storedConsent = localStorage.getItem('air-mouse-consent');
    if (storedConsent === 'accepted') {
      setConsentGiven(true);
    }
    initStore();
    setLoading(false);
  }, [initStore]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center glass-dark">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-accent-cyan"></div>
          <p className="text-accent-cyan mt-4 text-lg">Initializing Air-Mouse...</p>
        </div>
      </div>
    );
  }

  if (!consentGiven) {
    return <ConsentFlow onAccept={() => setConsentGiven(true)} />;
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 overflow-hidden">
      {/* Core input modules */}
      <CameraInput />
      <GestureEngine />
      <VoiceInput />
      <FaceAuth />
      <CursorController />

      {/* Main UI */}
      <MainUI />
    </div>
  );
};

export default App;
