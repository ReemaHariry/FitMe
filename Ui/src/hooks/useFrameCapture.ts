/**
 * Hook for capturing frames from video stream.
 */
import { useEffect, useRef } from 'react';

interface UseFrameCaptureOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  isActive: boolean;
  onFrame: (base64Frame: string) => void;
  intervalMs?: number;
}

export function useFrameCapture({
  videoRef,
  isActive,
  onFrame,
  intervalMs = 2000,
}: UseFrameCaptureOptions) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const captureFrame = () => {
      const video = videoRef.current;
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Frame = canvas.toDataURL('image/jpeg', 0.7);
      onFrame(base64Frame);
    };

    if (isActive) {
      intervalRef.current = window.setInterval(captureFrame, intervalMs);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [videoRef, isActive, onFrame, intervalMs]);
}
