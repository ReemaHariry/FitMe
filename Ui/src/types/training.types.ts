/**
 * Type definitions for live training feature.
 */

export type TrainingStatus = "idle" | "camera-ready" | "live" | "processing" | "done";
export type InputMode = "camera" | "upload";

export interface AIResponse {
  exercise: string;
  confidence?: number;
  feedback: string[];
}

export interface VideoAIResponse extends AIResponse {
  duration_seconds: number;
}

export interface TrainingState {
  status: TrainingStatus;
  inputMode: InputMode;
  currentExercise: string;
  confidence?: number;
  feedbackList: string[];
  elapsedSeconds: number;
  sessionId?: string;
}

export interface SessionStartRequest {
  user_id: string;
  mode: InputMode;
}

export interface SessionStartResponse {
  session_id: string;
}

export interface SessionEndRequest {
  duration_seconds: number;
  exercise: string;
  feedback: string[];
  confidence?: number;
}

export interface SessionEndResponse {
  success: boolean;
}

export interface TrainingSession {
  id: string;
  user_id: string;
  mode: string;
  exercise?: string;
  confidence?: number;
  feedback?: string[];
  duration_seconds?: number;
  started_at: string;
  ended_at?: string;
  status: string;
}
