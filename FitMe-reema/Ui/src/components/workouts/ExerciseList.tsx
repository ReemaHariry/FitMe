/**
 * Exercise List Component
 * Displays all exercises in a workout with timer controls
 */

import { Play } from "lucide-react";
import { Exercise, InjurySafeExercise } from "../../types/workout.types";
import { isInjurySafeExercise } from "../../data/injuryData";

interface ExerciseListProps {
  exercises: (Exercise | InjurySafeExercise)[];
  onExerciseClick: (exercise: Exercise | InjurySafeExercise) => void;
  onStartTimer: (exercise: Exercise | InjurySafeExercise) => void;
  isKidsMode?: boolean;
}

/**
 * List of exercises with clickable names and timer buttons
 */
export function ExerciseList({
  exercises,
  onExerciseClick,
  onStartTimer,
  isKidsMode = false,
}: ExerciseListProps) {
  return (
    <div className="space-y-3">
      {exercises.map((exercise, index) => {
        const safe = isInjurySafeExercise(exercise);
        return (
          <div
            key={exercise.id}
            className={`flex items-center justify-between p-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors group ${
              isKidsMode
                ? "bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800"
                : "bg-gray-50 dark:bg-gray-700"
            }`}
          >
            <button onClick={() => onExerciseClick(exercise)} className="flex-1 text-left">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {exercise.name}
                    </h4>
                    {safe && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 font-medium">
                        Safe Alt
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 mt-1">
                    <span>{exercise.sets} sets × {exercise.reps} reps</span>
                    <span>•</span>
                    <span>Rest: {exercise.restSeconds}s</span>
                  </div>
                </div>
              </div>
            </button>
            <button
              onClick={() => onStartTimer(exercise)}
              className="p-2 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all ml-4"
              aria-label="start timer"
            >
              <Play className="w-5 h-5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
