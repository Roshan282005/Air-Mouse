import React, { useState } from 'react';
import { useAirMouseStore } from '../store/airMouseStore';

interface ControlPanelProps {
  onClose: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ onClose }) => {
  const {
    faceAuthEnabled,
    setFaceAuthEnabled,
    enableCloudSync,
    setEnableCloudSync,
    setCalibrationData,
    calibrationData,
  } = useAirMouseStore();

  const [tab, setTab] = useState<'general' | 'calibration' | 'privacy'>('general');

  const handleCalibrateGaze = () => {
    console.log('Starting gaze calibration...');
    alert('Calibration flow would start here');
  };

  const handleClearData = () => {
    if (confirm('Are you sure? This will delete all stored data.')) {
      localStorage.clear();
      setCalibrationData({});
      alert('All data cleared');
    }
  };

  const tabs = {
    general: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 className="agent-name" style={{ fontSize: '15px' }}>General Settings</h3>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={faceAuthEnabled}
            onChange={(e) => setFaceAuthEnabled(e.target.checked)}
            style={{
              accentColor: 'var(--arc-electric)',
              width: '16px', height: '16px',
            }}
          />
          <span style={{ color: 'var(--arc-spark)', fontSize: '13px' }}>Enable Face Authentication</span>
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={enableCloudSync}
            onChange={(e) => setEnableCloudSync(e.target.checked)}
            style={{
              accentColor: 'var(--arc-electric)',
              width: '16px', height: '16px',
            }}
          />
          <span style={{ color: 'var(--arc-spark)', fontSize: '13px' }}>Enable Cloud Sync (optional)</span>
        </label>

        <button
          onClick={handleCalibrateGaze}
          className="ui-btn ui-btn-primary"
          style={{ width: '100%', padding: '10px', fontSize: '12px' }}
        >
          Calibrate Gaze Tracking
        </button>
      </div>
    ),

    calibration: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 className="agent-name" style={{ fontSize: '15px' }}>Calibration</h3>
        <div style={{
          fontSize: '12px',
          color: 'rgba(128,216,255,0.45)',
          fontFamily: "'JetBrains Mono', monospace",
          display: 'flex', flexDirection: 'column', gap: '6px',
        }}>
          <p>X Offset: <span style={{ color: 'var(--arc-electric)' }}>{calibrationData.calibrationOffsetX || 0}</span></p>
          <p>Y Offset: <span style={{ color: 'var(--arc-electric)' }}>{calibrationData.calibrationOffsetY || 0}</span></p>
        </div>
        <button
          onClick={handleCalibrateGaze}
          className="ui-btn ui-btn-primary"
          style={{ width: '100%', padding: '10px', fontSize: '12px' }}
        >
          Re-calibrate
        </button>
      </div>
    ),

    privacy: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 className="agent-name" style={{ fontSize: '15px' }}>Privacy & Data</h3>
        <button
          onClick={handleClearData}
          style={{
            width: '100%',
            padding: '10px',
            background: 'rgba(248,113,113,0.15)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: '10px',
            color: '#f87171',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: "'Chakra Petch', sans-serif",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.25)';
            (e.target as HTMLButtonElement).style.boxShadow = '0 0 12px rgba(248,113,113,0.3)';
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLButtonElement).style.background = 'rgba(248,113,113,0.15)';
            (e.target as HTMLButtonElement).style.boxShadow = 'none';
          }}
        >
          Delete All Data
        </button>
        <p style={{ fontSize: '11px', color: 'rgba(128,216,255,0.35)' }}>
          This will clear calibration data, face embeddings, and all settings.
        </p>
      </div>
    ),
  };

  return (
    <div style={{
      background: 'rgba(0, 10, 40, 0.90)',
      border: '1px solid rgba(0, 170, 255, 0.18)',
      borderRadius: '16px',
      backdropFilter: 'blur(24px)',
      padding: '20px',
      width: '320px',
      maxHeight: '420px',
      overflowY: 'auto',
      boxShadow: '0 0 40px rgba(0,170,255,0.15), 0 20px 60px rgba(0,0,0,0.6)',
    }}>
      {/* Tab Navigation */}
      <div style={{
        display: 'flex', gap: '6px', marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid rgba(0,170,255,0.12)',
      }}>
        {(['general', 'calibration', 'privacy'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontSize: '10px',
              fontWeight: 600,
              padding: '4px 12px',
              borderRadius: '8px',
              transition: 'all 0.2s',
              letterSpacing: '0.07em',
              fontFamily: "'Chakra Petch', sans-serif",
              cursor: 'pointer',
              border: tab === t ? '1px solid rgba(0,170,255,0.3)' : '1px solid transparent',
              background: tab === t ? 'rgba(0,170,255,0.12)' : 'transparent',
              color: tab === t ? 'var(--arc-electric)' : 'rgba(128,216,255,0.4)',
            }}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tabs[tab]}

      {/* Close Button */}
      <button
        onClick={onClose}
        className="ui-btn"
        style={{ marginTop: '20px', width: '100%', padding: '10px', fontSize: '12px' }}
      >
        Close
      </button>
    </div>
  );
};

export default ControlPanel;
