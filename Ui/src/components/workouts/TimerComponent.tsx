/**
 * Timer Component
 * Countdown timer with visual progress indicator
 */

import { Play, Pause, RotateCcw } from "lucide-react";
import { useWorkoutTimer } from "../../hooks/useWorkoutTimer";

interface TimerComponentProps {
  durationSeconds: number;
  label: string;
  onComplete: () => void;
}

/**
 * Displays countdown timer with play/pause/reset controls
 */
export function TimerComponent({
  durationSeconds,
  label,
  onComplete,
}: TimerComponentProps) {
  const { timeRemaining, status, start, pause, reset, resume } =
    useWorkoutTimer(durationSeconds, onComplete);

  const progress = ((durationSeconds - timeRemaining) / durationSeconds) * 100;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 p-6 card">
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </h3>

      {/* Circular Progress */}
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r="54"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx="64"
            cy="64"
            r="54"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={`transition-all duration-1000 ${
              status === "running"
                ? "text-primary"
                : status === "completed"
                ? "text-green-500"
                : "text-gray-400"
            }`}
            strokeLinecap="round"
          />
        </svg>
        {/* Time display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {status === "idle" && (
          <button
            onClick={start}
            className="p-3 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            <Play className="w-6 h-6" />
          </button>
        )}

        {status === "running" && (
          <button
            onClick={pause}
            className="p-3 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
          >
            <Pause className="w-6 h-6" />
          </button>
        )}

        {status === "paused" && (
          <>
            <button
              onClick={resume}
              className="p-3 rounded-full bg-primary hover:bg-primary/90 text-white transition-colors"
            >
              <Play className="w-6 h-6" />
            </button>
            <button
              onClick={reset}
              className="p-3 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </>
        )}

        {status === "completed" && (
          <button
            onClick={reset}
            className="p-3 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
