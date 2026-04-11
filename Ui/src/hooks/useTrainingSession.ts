/**
 * Hook for managing training session state and API interactions.
 */
import { useState, useCallback } from 'react';
import type { TrainingState, InputMode, AIResponse } from '../types/training.types';
import * as trainingApi from '../services/trainingApi';

export function useTrainingSession(userId: string) {
  const [state, setState] = useState<TrainingState>({
    status: 'idle',
    inputMode: 'camera',
    currentExercise: 'Waiting...',
    confidence: undefined,
    feedbackList: [],
    elapsedSeconds: 0,
    sessionId: undefined,
  });

  const [error, setError] = useState<string | null>(null);

  const setInputMode = useCallback((mode: InputMode) => {
    setState((prev) => ({ ...prev, inputMode: mode }));
  }, []);

  const setStatus = useCallback((status: TrainingState['status']) => {
    setState((prev) => ({ ...prev, status }));
  }, []);

  const startSession = useCallback(async () => {
    try {
      setError(null);
      const response = await trainingApi.startSession({
        user_id: userId,
        mode: state.inputMode,
      });

      setState((prev) => ({
        ...prev,
        sessionId: response.session_id,
        status: 'live',
      }));

      return response.session_id;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start session';
      setError(message);
      throw err;
    }
  }, [userId, state.inputMode]);

  const sendFrame = useCallback(
    async (frame: string) => {
      if (!state.sessionId) {
        throw new Error('No active session');
      }

      try {
        setError(null);
        setState((prev) => ({ ...prev, status: 'processing' }));

        const response = await trainingApi.sendFrame(frame, state.sessionId);

        setState((prev) => ({
          ...prev,
          status: 'live',
          currentExercise: response.exercise,
          confidence: response.confidence,
          feedbackList: response.feedback,
        }));

        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Frame processing failed';
        setError(message);
        setState((prev) => ({ ...prev, status: 'live' }));
        throw err;
      }
    },
    [state.sessionId]
  );

  const uploadVideo = useCallback(
    async (file: File) => {
      if (!state.sessionId) {
        throw new Error('No active session');
      }

      try {
        setError(null);
        setState((prev) => ({ ...prev, status: 'processing' }));

        const response = await trainingApi.uploadVideo(file, state.sessionId);

        setState((prev) => ({
          ...prev,
          status: 'done',
          currentExercise: response.exercise,
          confidence: response.confidence,
          feedbackList: response.feedback,
        }));

        return response;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Video upload failed';
        setError(message);
        setState((prev) => ({ ...prev, status: 'idle' }));
        throw err;
      }
    },
    [state.sessionId]
  );

  const endSession = useCallback(
    async (durationSeconds: number) => {
      if (!state.sessionId) {
        return;
      }

      try {
        setError(null);
        await trainingApi.endSession(state.sessionId, {
          duration_seconds: durationSeconds,
          exercise: state.currentExercise,
          feedback: state.feedbackList,
          confidence: state.confidence,
        });

        setState((prev) => ({
          ...prev,
          status: 'done',
        }));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to end session';
        setError(message);
      }
    },
    [state.sessionId, state.currentExercise, state.feedbackList, state.confidence]
  );

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      inputMode: 'camera',
      currentExercise: 'Waiting...',
      confidence: undefined,
      feedbackList: [],
      elapsedSeconds: 0,
      sessionId: undefined,
    });
    setError(null);
  }, []);

  return {
    state,
    error,
    setInputMode,
    setStatus,
    startSession,
    sendFrame,
    uploadVideo,
    endSession,
    reset,
  };
}
