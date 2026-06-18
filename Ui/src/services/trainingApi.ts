/**
 * API service for training endpoints.
 */
import type {
  AIResponse,
  VideoAIResponse,
  SessionStartRequest,
  SessionStartResponse,
  SessionEndRequest,
  SessionEndResponse,
  TrainingSession,
} from '../types/training.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Send a single frame for real-time inference.
 */
export async function sendFrame(
  frame: string,
  sessionId: string
): Promise<AIResponse> {
  // Strip data-URL prefix if present
  const cleanFrame = frame.includes(',') ? frame.split(',')[1] : frame;
  
  const response = await fetch(`${API_BASE_URL}/api/inference/frame`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      frame: cleanFrame,
      session_id: sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Frame inference failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Upload and process a video file.
 */
export async function uploadVideo(
  file: File,
  sessionId: string
): Promise<VideoAIResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('session_id', sessionId);

  const response = await fetch(`${API_BASE_URL}/api/inference/video`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Video upload failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Start a new training session.
 */
export async function startSession(
  request: SessionStartRequest
): Promise<SessionStartResponse> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to start session: ${response.statusText}`);
  }

  return response.json();
}

/**
 * End a training session.
 */
export async function endSession(
  sessionId: string,
  request: SessionEndRequest
): Promise<SessionEndResponse> {
  const response = await fetch(
    `${API_BASE_URL}/api/sessions/${sessionId}/end`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to end session: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all sessions for a user.
 */
export async function getUserSessions(
  userId: string
): Promise<TrainingSession[]> {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${userId}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch sessions: ${response.statusText}`);
  }

  return response.json();
}
