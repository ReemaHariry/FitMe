/**
 * Exercise Detail Modal
 * Shows progression levels for normal exercises.
 * For injury-safe alternatives: shows a single flat view (no tabs).
 */

import { X, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Exercise, DifficultyLevel, InjurySafeExercise } from "../../types/workout.types";
import { isInjurySafeExercise } from "../../utils/injuryAdapter";
import Button from "../ui/Button";

interface ExerciseDetailModalProps {
  exercise: Exercise | InjurySafeExercise | null;
  open: boolean;
  onClose: () => void;
}

export function ExerciseDetailModal({
  exercise,
  open,
  onClose,
}: ExerciseDetailModalProps) {
  const [activeLevel, setActiveLevel] = useState<DifficultyLevel>("beginner");

  if (!exercise || !open) return null;

  const isSafe = isInjurySafeExercise(exercise);

  // For injury-safe exercises, use the flat fields directly
  const videoUrl = isSafe
    ? (exercise as InjurySafeExercise).videoUrl
    : (exercise as Exercise).levels[activeLevel].videoUrl;

  const steps = isSafe
    ? (exercise as InjurySafeExercise).steps
    : (exercise as Exercise).levels[activeLevel].steps;

  const tips = isSafe
    ? (exercise as InjurySafeExercise).tips
    : (exercise as Exercise).levels[activeLevel].tips;

  const levelLabel = isSafe
    ? "Injury-Safe Version"
    : (exercise as Exercise).levels[activeLevel].label;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-start justify-between z-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {exercise.name}
              </h2>
              {isSafe && (
                <div className="flex items-center gap-2 mt-2">
                  <ShieldCheck className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    Injury-Safe Alternative
                  </span>
                </div>
              )}
              {isSafe && (exercise as InjurySafeExercise).replacesExercise && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Replaces: {(exercise as InjurySafeExercise).replacesExercise}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">

            {/* Injury-safe notice */}
            {isSafe && (
              <div className="mb-5 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This exercise was selected to protect your injury. It has no progression levels — perform it as shown.
                </p>
              </div>
            )}

            {/* Level Tabs — only for normal exercises */}
            {!isSafe && (
              <div className="flex gap-2 mb-6">
                {(["beginner", "intermediate", "advanced"] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setActiveLevel(level)}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-all ${
                      activeLevel === level
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            )}

            {/* Level Label */}
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {levelLabel}
            </h3>

            {/* YouTube Video */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-xl mb-6">
              <iframe
                src={videoUrl}
                title={levelLabel}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>

            {/* Steps */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Steps</h4>
              <ol className="space-y-2">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tips</h4>
              <ul className="space-y-2">
                {tips.map((tip, i) => (
                  <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300">
                    <span className="text-primary font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Metadata */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Sets</p>
                <p className="font-bold text-gray-900 dark:text-white">{exercise.sets}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reps</p>
                <p className="font-bold text-gray-900 dark:text-white">{exercise.reps}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Rest</p>
                <p className="font-bold text-gray-900 dark:text-white">{exercise.restSeconds}s</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
            <Button onClick={onClose} variant="secondary" className="w-full">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
