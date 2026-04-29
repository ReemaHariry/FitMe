/**
 * Pregnancy Workout Zone
 * A completely separate, warm, and supportive workout experience
 * for pregnant women with trimester-specific programs
 */

import { useState } from "react";
import { Heart, Clock, AlertCircle, Play, X, CheckCircle, ChevronRight } from "lucide-react";
import { pregnancyWorkouts, PregnancyCategory, PregnancyExercise } from "../../data/pregnancyWorkouts";

export function PregnancyWorkoutZone() {
  const [selectedTrimester, setSelectedTrimester] = useState<1 | 2 | 3>(1);
  const [selectedWorkout, setSelectedWorkout] = useState<PregnancyCategory | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<PregnancyExercise | null>(null);

  const currentTrimester = pregnancyWorkouts[selectedTrimester];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div
        className="relative overflow-hidden rounded-3xl p-8 md:p-12"
        style={{
          background: `linear-gradient(135deg, ${currentTrimester.gradientFrom} 0%, ${currentTrimester.gradientTo} 100%)`,
        }}
      >
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            🤰 Pregnancy Wellness Program
          </h1>
          <p className="text-xl text-gray-700 mb-6 font-medium">
            Safe, expert-curated workouts for every stage of your journey
          </p>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 max-w-3xl">
            <p className="text-gray-800 leading-relaxed">
              Every pregnancy is unique. These workouts are designed with your
              changing body in mind. Always listen to your body and consult
              your doctor if you have any concerns.{" "}
              <span className="font-semibold text-rose-600">
                You are doing amazingly.
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Trimester Selector */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Trimester
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {([1, 2, 3] as const).map((trimester) => {
            const data = pregnancyWorkouts[trimester];
            const isSelected = selectedTrimester === trimester;
            return (
              <button
                key={trimester}
                onClick={() => setSelectedTrimester(trimester)}
                className={`relative p-6 rounded-2xl border-2 transition-all text-left ${
                  isSelected
                    ? "border-current shadow-lg scale-105"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md"
                }`}
                style={{
                  backgroundColor: isSelected
                    ? `${data.color}15`
                    : "transparent",
                  borderColor: isSelected ? data.color : undefined,
                }}
              >
                <div className="text-4xl mb-3">
                  {trimester === 1 ? "🌸" : trimester === 2 ? "🌟" : "🤰"}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {data.label}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {data.weeks}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  {data.subtitle}
                </p>
                {isSelected && (
                  <div
                    className="absolute top-4 right-4 w-3 h-3 rounded-full"
                    style={{ backgroundColor: data.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Trimester Goals */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Goals for {currentTrimester.label}
        </h3>
        <ul className="space-y-2">
          {currentTrimester.goals.map((goal, index) => (
            <li
              key={index}
              className="flex items-start gap-3 text-gray-700 dark:text-gray-300"
            >
              <span className="text-blue-500 mt-1">✓</span>
              <span>{goal}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Safety Reminder Banner */}
      <div className="flex items-start gap-3 p-5 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl">
        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
            ⚕️ Important Safety Reminder
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Always consult your healthcare provider before starting any exercise
            program during pregnancy. Stop if you feel pain, dizziness, or
            shortness of breath.
          </p>
          {currentTrimester.extraWarning && (
            <p className="text-sm text-amber-900 dark:text-amber-100 font-medium mt-2">
              {currentTrimester.extraWarning}
            </p>
          )}
        </div>
      </div>

      {/* Benefits Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          What This Program Targets
        </h3>
        <div className="flex flex-wrap gap-3">
          {currentTrimester.benefits.map((benefit, index) => (
            <span
              key={index}
              className="px-4 py-2 rounded-full text-sm font-medium"
              style={{
                backgroundColor: `${currentTrimester.color}20`,
                color: currentTrimester.color,
                border: `1.5px solid ${currentTrimester.color}40`,
              }}
            >
              {benefit}
            </span>
          ))}
        </div>
      </div>

      {/* Workout Categories */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Your Workouts
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentTrimester.categories.map((category) => (
            <PregnancyWorkoutCard
              key={category.id}
              category={category}
              trimesterColor={currentTrimester.color}
              onStartWorkout={() => setSelectedWorkout(category)}
            />
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          These workouts were designed following{" "}
          <span className="font-semibold text-gray-900 dark:text-white">
            ACOG (American College of Obstetricians and Gynecologists)
          </span>{" "}
          guidelines for exercise in pregnancy.
        </p>
      </div>

      {/* Workout Detail Modal */}
      {selectedWorkout && (
        <PregnancyWorkoutModal
          workout={selectedWorkout}
          trimesterColor={currentTrimester.color}
          trimesterLabel={currentTrimester.label}
          onClose={() => setSelectedWorkout(null)}
          onExerciseClick={(exercise) => setSelectedExercise(exercise)}
        />
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <PregnancyExerciseModal
          exercise={selectedExercise}
          trimesterColor={currentTrimester.color}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </div>
  );
}

interface PregnancyWorkoutCardProps {
  category: PregnancyCategory;
  trimesterColor: string;
  onStartWorkout: () => void;
}

function PregnancyWorkoutCard({
  category,
  trimesterColor,
  onStartWorkout,
}: PregnancyWorkoutCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const displayedExercises = category.exercises.slice(0, 3);
  const remainingCount = category.exercises.length - 3;

  return (
    <div
      className="relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md hover:shadow-xl transition-all border-2"
      style={{
        borderColor: `${trimesterColor}30`,
      }}
    >
      {/* Favorite Heart */}
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle favorite"
      >
        <Heart
          className={`w-5 h-5 ${
            isFavorite
              ? "fill-rose-500 text-rose-500"
              : "text-gray-400 dark:text-gray-500"
          }`}
        />
      </button>

      {/* Emoji Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
        style={{
          backgroundColor: `${trimesterColor}20`,
        }}
      >
        {category.emoji}
      </div>

      {/* Category Name */}
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {category.name}
      </h3>

      {/* Duration */}
      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
        <Clock className="w-4 h-4" />
        <span className="text-sm font-medium">{category.duration} minutes</span>
      </div>

      {/* Description */}
      <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm leading-relaxed">
        {category.description}
      </p>

      {/* Exercise List */}
      <div className="space-y-2 mb-6">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Includes:
        </h4>
        {displayedExercises.map((exercise, index) => (
          <div
            key={index}
            className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <span className="flex-shrink-0">{exercise.emoji}</span>
            <div>
              <span className="font-medium">{exercise.name}</span>
              <span className="text-gray-500 dark:text-gray-400">
                {" "}
                — {exercise.benefit}
              </span>
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic pl-6">
            +{remainingCount} more exercise{remainingCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Start Button */}
      <button
        onClick={onStartWorkout}
        className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg flex items-center justify-center gap-2"
        style={{
          backgroundColor: trimesterColor,
        }}
      >
        <Play className="w-5 h-5" />
        Start Workout
      </button>
    </div>
  );
}

interface PregnancyWorkoutModalProps {
  workout: PregnancyCategory;
  trimesterColor: string;
  trimesterLabel: string;
  onClose: () => void;
  onExerciseClick: (exercise: PregnancyExercise) => void;
}

function PregnancyWorkoutModal({
  workout,
  trimesterColor,
  trimesterLabel,
  onClose,
  onExerciseClick,
}: PregnancyWorkoutModalProps) {
  const handleMarkCompleted = () => {
    const history = JSON.parse(
      localStorage.getItem("fitapp_workout_history") || "[]"
    );
    history.push({
      workoutId: workout.id,
      completedAt: new Date().toISOString(),
      title: workout.name,
      type: "pregnancy",
    });
    localStorage.setItem("fitapp_workout_history", JSON.stringify(history));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div
            className="sticky top-0 p-6 flex items-start justify-between z-10 border-b border-gray-200 dark:border-gray-700"
            style={{
              background: `linear-gradient(135deg, ${trimesterColor}15 0%, ${trimesterColor}05 100%)`,
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                  style={{
                    backgroundColor: `${trimesterColor}30`,
                  }}
                >
                  {workout.emoji}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {workout.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {trimesterLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-lg">
                  <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {workout.duration} minutes
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {workout.exercises.length} exercises
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                {workout.description}
              </p>
            </div>

            {/* Safety Reminder */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Listen to your body. Stop if you feel any pain, dizziness, or
                  discomfort. Stay hydrated and breathe naturally throughout.
                </p>
              </div>
            </div>

            {/* Exercise List */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Exercises
              </h3>
              <div className="space-y-3">
                {workout.exercises.map((exercise, index) => (
                  <button
                    key={index}
                    onClick={() => onExerciseClick(exercise)}
                    className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{
                          backgroundColor: `${trimesterColor}20`,
                        }}
                      >
                        {exercise.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-current transition-colors">
                              {exercise.name}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {exercise.benefit}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500 mt-2">
                              <span>{exercise.sets} sets × {exercise.reps} reps</span>
                              <span>•</span>
                              <span>Rest: {exercise.restSeconds}s</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-sm font-medium px-2 py-1 rounded-lg"
                              style={{
                                backgroundColor: `${trimesterColor}15`,
                                color: trimesterColor,
                              }}
                            >
                              #{index + 1}
                            </span>
                            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-current transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Helpful Tips
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Move at your own pace — there's no rush</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Keep water nearby and sip between exercises</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Use pillows or cushions for extra support</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>
                    It's okay to skip exercises that don't feel right today
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleMarkCompleted}
              className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:shadow-lg flex items-center justify-center gap-2"
              style={{
                backgroundColor: trimesterColor,
              }}
            >
              <CheckCircle className="w-5 h-5" />
              Mark as Completed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface PregnancyExerciseModalProps {
  exercise: PregnancyExercise;
  trimesterColor: string;
  onClose: () => void;
}

function PregnancyExerciseModal({
  exercise,
  trimesterColor,
  onClose,
}: PregnancyExerciseModalProps) {
  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div
            className="sticky top-0 p-6 flex items-start justify-between z-10 border-b border-gray-200 dark:border-gray-700"
            style={{
              background: `linear-gradient(135deg, ${trimesterColor}15 0%, ${trimesterColor}05 100%)`,
            }}
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                  style={{
                    backgroundColor: `${trimesterColor}30`,
                  }}
                >
                  {exercise.emoji}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {exercise.name}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {exercise.benefit}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-4"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Video */}
            <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-900">
              <iframe
                src={exercise.videoUrl}
                title={exercise.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
              />
            </div>

            {/* Metadata */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Sets
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {exercise.sets}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Reps
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {exercise.reps}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Rest
                </p>
                <p className="font-bold text-gray-900 dark:text-white text-lg">
                  {exercise.restSeconds}s
                </p>
              </div>
            </div>

            {/* Steps */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                How to Perform
              </h3>
              <ol className="space-y-3">
                {exercise.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-gray-700 dark:text-gray-300">
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                      style={{ backgroundColor: trimesterColor }}
                    >
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Tips */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Pregnancy-Safe Tips
              </h3>
              <ul className="space-y-2">
                {exercise.tips.map((tip, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-gray-700 dark:text-gray-300"
                  >
                    <span
                      className="font-bold"
                      style={{ color: trimesterColor }}
                    >
                      •
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Safety Note */}
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Remember:</strong> Every pregnancy is different. If
                  this exercise doesn't feel right today, skip it and try
                  another. Always listen to your body.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-6">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl font-semibold bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
