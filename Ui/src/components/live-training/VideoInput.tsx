/**
 * Video input component supporting camera and file upload modes.
 */
import { useRef, useState, useEffect } from 'react';
import type { InputMode } from '../../types/training.types';

interface VideoInputProps {
  mode: InputMode;
  onModeChange: (mode: InputMode) => void;
  onStreamReady: (stream: MediaStream) => void;
  onVideoReady: (file: File) => void;
  isActive: boolean;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export function VideoInput({
  mode,
  onModeChange,
  onStreamReady,
  onVideoReady,
  isActive,
  videoRef,
}: VideoInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'camera' && !stream) {
      startCamera();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mode]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: false,
      });

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      onStreamReady(mediaStream);
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      console.error('Camera error:', err);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setVideoFile(file);
      onVideoReady(file);

      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(file);
      }
    }
  };

  const handleModeToggle = () => {
    const newMode = mode === 'camera' ? 'upload' : 'camera';
    onModeChange(newMode);

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    setVideoFile(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Video Input</h2>
        <button
          onClick={handleModeToggle}
          disabled={isActive}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {mode === 'camera' ? 'Upload Video' : 'Use Camera'}
        </button>
      </div>

      <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
        {mode === 'camera' ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!stream && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                <p className="text-white text-lg">Initializing camera...</p>
              </div>
            )}
          </>
        ) : (
          <>
            {videoFile ? (
              <video
                ref={videoRef}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                <div className="text-center">
                  <p className="text-white text-lg mb-4">
                    Upload a video to analyze
                  </p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Choose Video File
                  </button>
                </div>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-900 bg-opacity-75">
            <p className="text-white text-lg">{error}</p>
          </div>
        )}
      </div>

      {!stream && !videoFile && !error && mode === 'camera' && (
        <p className="text-sm text-gray-500 text-center">
          Enable camera to start AI coaching
        </p>
      )}
    </div>
  );
}
