import React, { useState } from 'react';
import { useAirMouseStore } from '../store/airMouseStore';

interface ControlPanelProps {
  onClose: () => void;
}

/**
 * ControlPanel Component
 * 
 * Settings and controls for:
 * - Calibration
 * - Input sensitivity
 * - Face authentication
 * - Cloud sync toggle
 * - Data management
 */

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
    // TODO: Implement 5-point or 9-point calibration
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
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">General Settings</h3>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={faceAuthEnabled}
            onChange={(e) => setFaceAuthEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Enable Face Authentication</span>
        </label>

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={enableCloudSync}
            onChange={(e) => setEnableCloudSync(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Enable Cloud Sync (optional)</span>
        </label>

        <button
          onClick={handleCalibrateGaze}
          className="w-full py-2 bg-accent-purple text-white rounded-lg text-sm font-semibold hover:bg-accent-purple/80 transition"
        >
          Calibrate Gaze Tracking
        </button>
      </div>
    ),

    calibration: (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Calibration</h3>
        <div className="text-xs text-gray-400 space-y-2">
          <p>X Offset: {calibrationData.calibrationOffsetX || 0}</p>
          <p>Y Offset: {calibrationData.calibrationOffsetY || 0}</p>
        </div>
        <button
          onClick={handleCalibrateGaze}
          className="w-full py-2 bg-accent-cyan text-slate-900 rounded-lg text-sm font-semibold hover:bg-cyan-400 transition"
        >
          Re-calibrate
        </button>
      </div>
    ),

    privacy: (
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Privacy & Data</h3>
        <button
          onClick={handleClearData}
          className="w-full py-2 bg-red-500/50 text-white rounded-lg text-sm font-semibold hover:bg-red-600/50 transition"
        >
          Delete All Data
        </button>
        <p className="text-xs text-gray-400">
          This will clear calibration data, face embeddings, and all settings.
        </p>
      </div>
    ),
  };

  return (
    <div className="glass-dark p-6 rounded-2xl w-80 max-h-96 overflow-y-auto">
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-4 border-b border-white/10 pb-3">
        {(['general', 'calibration', 'privacy'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`text-xs font-semibold px-3 py-1 rounded transition ${
              tab === t
                ? 'bg-accent-cyan/30 text-accent-cyan'
                : 'text-gray-400 hover:text-white'
            }`}
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
        className="mt-6 w-full py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition"
      >
        Close
      </button>
    </div>
  );
};

export default ControlPanel;
