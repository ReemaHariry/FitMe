import { X, Clock, Dumbbell, CheckCircle, Shield } from "lucide-react";
import { useState } from "react";
import { SmartWorkout, Workout, RuntimeExercise, UserSettings } from "../../types/workout.types";
import { ExerciseList } from "./ExerciseList";
import { ExerciseDetailModal } from "./ExerciseDetailModal";
import { TimerComponent } from "./TimerComponent";
import { InjuryBanner } from "./InjuryBanner";
import { KidsAvatar } from "./KidsAvatar";
import Button from "../ui/Button";

/**
 * Helper function to get swapped exercises between original and adapted workout
 */
function getSwappedExercises(
  original: Workout,
  adapted: { exercises: RuntimeExercise[] }
): Array<{ original: string; replacement: string }> {
  return original.exercises
    .map((orig, i) => {
      const adapted_ = adapted.exercises[i];
      if (!adapted_ || orig.name === adapted_.name) return null;
      return { original: orig.name, replacement: adapted_.name };
    })
    .filter(Boolean) as Array<{ original: string; replacement: string }>;
}

interface WorkoutDetailModalProps {
  workout: SmartWorkout | null;
  originalWorkout?: Workout;
  open: boolean;
  onClose: () => void;
  userSettings: UserSettings;
}

export function WorkoutDetailModal({
  workout,
  originalWorkout,
  open,
  onClose,
  userSettings,
}: WorkoutDetailModalProps) {
  const [selectedExercise, setSelectedExercise] = useState<RuntimeExercise | null>(null);
  const [timerExercise, setTimerExercise] = useState<RuntimeExercise | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);

  if (!workout || !open) return null;

  const swappedExercises = originalWorkout && workout.isModified
    ? getSwappedExercises(originalWorkout, workout)
    : [];

  const handleMarkCompleted = () => {
    const history = JSON.parse(localStorage.getItem("fitapp_workout_history") || "[]");
    history.push({ workoutId: workout.id, completedAt: new Date().toISOString(), title: workout.title });
    localStorage.setItem("fitapp_workout_history", JSON.stringify(history));
    onClose();
  };

  const isKidsMode = userSettings.mode === "child";

  // CHANGED: Legacy injuryMode for InjuryBanner - now just checks injuryType directly
  const legacyInjuryMode =
    userSettings.injuryType && userSettings.injuryType !== "none"
      ? userSettings.injuryType
      : "none";

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        <div className="flex min-h-full items-center justify-center p-4">
          <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${isKidsMode ? "border-4 border-purple-300 dark:border-purple-600" : ""}`}>

            {/* Header */}
            <div className={`sticky top-0 border-b border-gray-200 dark:border-gray-700 p-6 flex items-start justify-between z-10 ${isKidsMode ? "bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10 dark:from-purple-900/30 dark:via-pink-900/30 dark:to-yellow-900/30" : "bg-white dark:bg-gray-800"}`}>
              <div className="flex-1 flex items-center gap-4">
                {isKidsMode && <KidsAvatar pose="dancing" size={70} />}
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                    {isKidsMode ? `🌟 ${workout.title}` : workout.title}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {workout.durationMinutes} min
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Dumbbell className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {workout.exercises.length} {isKidsMode ? "activities" : "exercises"}
                      </span>
                    </div>
                    {!isKidsMode && (
                      <span className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium">
                        {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
                      </span>
                    )}
                    {workout.isModified && workout.modeBadge && !isKidsMode && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 rounded-lg text-sm font-medium">
                        <Shield className="w-4 h-4" />
                        {workout.modeBadge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-4">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Injury Banner */}
              {legacyInjuryMode !== "none" && (
                <InjuryBanner injuryMode={legacyInjuryMode} swappedExercises={swappedExercises} />
              )}

              {/* Pregnancy notice */}
              {userSettings.mode === "pregnant" && (
                <div className="p-4 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl">
                  <p className="text-sm text-pink-800 dark:text-pink-200">
                    This workout has been adapted for pregnancy. All high-impact and core-compression exercises have been replaced.
                  </p>
                </div>
              )}

              {/* Kids encouragement banner */}
              {isKidsMode && (
                <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200 dark:border-purple-800 rounded-xl flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                    You're going to be amazing! Do your best and have fun! Remember: every superhero started somewhere! 💪
                  </p>
                </div>
              )}

              {/* Timers */}
              {timerExercise && !showRestTimer && (
                <TimerComponent
                  durationSeconds={60}
                  label={`${isKidsMode ? "🏃 Activity" : "Exercise"}: ${timerExercise.name}`}
                  onComplete={() => setShowRestTimer(true)}
                />
              )}
              {showRestTimer && timerExercise && (
                <TimerComponent
                  durationSeconds={timerExercise.restSeconds}
                  label={isKidsMode ? "😮‍💨 Catch your breath!" : "Rest Period"}
                  onComplete={() => { setShowRestTimer(false); setTimerExercise(null); }}
                />
              )}

              {/* Exercise List */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {isKidsMode ? "🎮 Activities" : "Exercises"}
                </h3>
                <ExerciseList
                  exercises={workout.exercises}
                  onExerciseClick={setSelectedExercise}
                  onStartTimer={(ex) => { setTimerExercise(ex); setShowRestTimer(false); }}
                  isKidsMode={isKidsMode}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
              <Button onClick={onClose} variant="secondary" className="flex-1">Close</Button>
              <Button onClick={handleMarkCompleted} className={`flex-1 ${isKidsMode ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gradient-to-r from-primary to-accent"}`}>
                <CheckCircle className="w-5 h-5 mr-2" />
                {isKidsMode ? "🏆 I Did It!" : "Mark as Completed"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ExerciseDetailModal
        exercise={selectedExercise}
        open={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </>
  );
}
