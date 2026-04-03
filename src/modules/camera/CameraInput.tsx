import React, { useEffect, useRef, useState } from 'react';
import { useAirMouseStore } from '../../store/airMouseStore';

/**
 * CameraInput Module
 * 
 * Responsibilities:
 * - Access user's camera via getUserMedia
 * - Stream video frames to gesture and gaze recognition pipelines
 * - Handle permission requests and fallback errors
 * - Manage frame rate throttling for performance
 */

const CameraInput: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { setCameraActive } = useAirMouseStore();
  const [error, setError] = useState<string | null>(null);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user',
          },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
          setError(null);

          // Track FPS
          fpsTimerRef.current = setInterval(() => {
            console.log(`Camera FPS: ${frameCountRef.current}`);
            frameCountRef.current = 0;
          }, 1000);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Camera access denied';
        setError(errorMsg);
        setCameraActive(false);
        console.error('Camera initialization failed:', err);
      }
    };

    initCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      if (fpsTimerRef.current) {
        clearInterval(fpsTimerRef.current);
      }
    };
  }, [setCameraActive]);

  // Process frames for gesture/gaze pipelines
  useEffect(() => {
    let animationId: number;

    const processFrame = () => {
      if (videoRef.current && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          frameCountRef.current++;

          // Dispatch frame data to gesture and gaze engines via custom events
          const imageData = ctx.getImageData(
            0,
            0,
            canvasRef.current.width,
            canvasRef.current.height,
          );
          window.dispatchEvent(
            new CustomEvent('camera-frame', {
              detail: {
                imageData,
                timestamp: performance.now(),
              },
            }),
          );
        }
      }
      animationId = requestAnimationFrame(processFrame);
    };

    processFrame();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
      {/* Hidden video element */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
        autoPlay
        onLoadedMetadata={() => {
          if (canvasRef.current && videoRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
          }
        }}
      />

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error display */}
      {error && (
        <div className="fixed top-4 left-4 bg-red-500/80 text-white px-4 py-2 rounded-lg text-sm">
          Camera Error: {error}
        </div>
      )}
    </>
  );
};

export default CameraInput;
