import React, { useEffect, useState, useRef } from 'react';
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
  const starfieldRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const storedConsent = localStorage.getItem('air-mouse-consent');
    if (storedConsent === 'accepted') {
      setConsentGiven(true);
    }
    initStore();
    setLoading(false);
  }, [initStore]);

  // Starfield animation
  useEffect(() => {
    const canvas = starfieldRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W: number, H: number;
    const stars: Array<{
      x: number; y: number; r: number;
      a: number; sp: number; col: string;
    }> = [];

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };

    const mk = () => {
      stars.length = 0;
      for (let i = 0; i < 320; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.3 + 0.1,
          a: Math.random(),
          sp: Math.random() * 0.005 + 0.001,
          col: Math.random() < 0.13
            ? (Math.random() < 0.5 ? 'rgba(0,170,255,' : 'rgba(128,216,255,')
            : (Math.random() < 0.08 ? 'rgba(85,51,255,' : 'rgba(255,255,255,'),
        });
      }
    };

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const s of stars) {
        s.a += s.sp;
        if (s.a > 1) s.a = 0;
        const al = Math.abs(Math.sin(s.a * Math.PI));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.col + al.toFixed(2) + ')';
        ctx.fill();
      }
      animId = requestAnimationFrame(draw);
    };

    resize();
    mk();
    draw();

    const handler = () => { resize(); mk(); };
    window.addEventListener('resize', handler);

    return () => {
      window.removeEventListener('resize', handler);
      cancelAnimationFrame(animId);
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        width: '100%', height: '100vh',
        background: 'var(--sp-void)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '20px',
      }}>
        {/* Orb loading animation */}
        <div className="orb-wrap" style={{ transform: 'scale(1.5)' }}>
          <div className="orb-ring" />
          <div className="orb-ring" />
          <div className="orb-ring" />
          <div className="orb-ring" />
          <div className="orb-core" />
        </div>
        <p className="agent-name" style={{ fontSize: '16px' }}>
          Initializing Air-Mouse...
        </p>
        <div className="progress-bar active" style={{ width: '200px', opacity: 1 }} />
      </div>
    );
  }

  if (!consentGiven) {
    return <ConsentFlow onAccept={() => setConsentGiven(true)} />;
  }

  return (
    <div style={{
      width: '100%', height: '100vh',
      background: 'var(--sp-void)',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Nebula background layers */}
      <div className="nebula neb-a" />
      <div className="nebula neb-b" />
      <div className="nebula neb-c" />
      <canvas id="starfield" ref={starfieldRef} />

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
