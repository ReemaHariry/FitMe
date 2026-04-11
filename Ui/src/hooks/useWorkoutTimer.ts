/**
 * Workout Timer Hook
 * Manages countdown timers for exercises and rest periods
 */

import { useState, useEffect, useCallback, useRef } from "react";

export type TimerStatus = "idle" | "running" | "paused" | "completed";

interface UseWorkoutTimerReturn {
  timeRemaining: number;
  status: TimerStatus;
  start: () => void;
  pause: () => void;
  reset: () => void;
  resume: () => void;
}

/**
 * Hook for managing workout timers
 * @param durationSeconds - Total duration in seconds
 * @param onComplete - Callback when timer reaches zero
 * @returns Timer state and controls
 */
export function useWorkoutTimer(
  durationSeconds: number,
  onComplete?: () => void
): UseWorkoutTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(durationSeconds);
  const [status, setStatus] = useState<TimerStatus>("idle");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Handle timer countdown
  useEffect(() => {
    if (status === "running") {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setStatus("completed");
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            onComplete?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
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
  }, [status, onComplete]);

  const start = useCallback(() => {
    setStatus("running");
  }, []);

  const pause = useCallback(() => {
    setStatus("paused");
  }, []);

  const resume = useCallback(() => {
    setStatus("running");
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setTimeRemaining(durationSeconds);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [durationSeconds]);

  return {
    timeRemaining,
    status,
    start,
    pause,
    reset,
    resume,
  };
}
