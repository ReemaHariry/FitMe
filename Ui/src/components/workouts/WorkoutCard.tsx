import { Heart, Clock, Dumbbell, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { SmartWorkout } from "../../types/workout.types";
import { KidsAvatar } from "./KidsAvatar";
import Button from "../ui/Button";
import Card from "../ui/Card";

interface WorkoutCardProps {
  workout: SmartWorkout;
  isFavorite: boolean;
  onToggleFavorite: (workoutId: string) => void;
  onViewWorkout: (workout: SmartWorkout) => void;
  isKidsMode?: boolean;
}

// Map workout title to avatar pose
const titleToPose: Record<string, "jumping" | "squatting" | "running" | "stretching" | "dancing" | "pushup" | "default"> = {
  "Adventure Quest": "jumping",
  "Animal Kingdom":  "squatting",
  "Space Explorer":  "running",
  "Ninja Training":  "pushup",
  "Dance Party":     "dancing",
};

const kidsGradients = [
  "from-purple-400 to-pink-400",
  "from-yellow-400 to-orange-400",
  "from-blue-400 to-cyan-400",
  "from-green-400 to-teal-400",
  "from-pink-400 to-rose-400",
];

export function WorkoutCard({
  workout,
  isFavorite,
  onToggleFavorite,
  onViewWorkout,
  isKidsMode = false,
}: WorkoutCardProps) {
  const typeLabels: Record<string, string> = {
    upper: "Upper Body", lower: "Lower Body", full: "Full Body",
    crossfit: "Cardio", calisthenics: "Calisthenics",
  };

  const difficultyColors: Record<string, string> = {
    beginner:     "bg-green-500/10 text-green-600 dark:text-green-400",
    intermediate: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    advanced:     "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const visibleTargets = workout.targets.slice(0, 3);
  const remainingCount = workout.targets.length - 3;

  // ── Kids Card ──────────────────────────────────────────────
  if (isKidsMode) {
    const pose = titleToPose[workout.title] ?? "default";
    const gradientIndex = Object.keys(titleToPose).indexOf(workout.title) % kidsGradients.length;
    const gradient = kidsGradients[Math.max(0, gradientIndex)];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.04, y: -6 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="h-full flex flex-col relative overflow-hidden cursor-pointer border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600 transition-all">
          {/* Colorful gradient header */}
          <div className={`bg-gradient-to-r ${gradient} p-4 flex items-center justify-between rounded-t-xl -mx-6 -mt-6 mb-4 px-6 pt-6`}>
            <div>
              <h3 className="text-xl font-bold text-white drop-shadow">
                {workout.title}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {workout.durationMinutes} min • {workout.exercises.length} activities
              </p>
            </div>
            <KidsAvatar pose={pose} size={80} />
          </div>

          {/* Favorite */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(workout.id); }}
            className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/30 hover:bg-white/60 transition-all"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500 text-red-500" : "text-white"}`} />
          </button>

          <div className="flex-1">
            {/* Exercise names preview */}
            <div className="space-y-1.5 mb-4">
              {workout.exercises.slice(0, 3).map((ex) => (
                <div key={ex.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="text-base">{ex.name.split(" ")[0]}</span>
                  <span className="font-medium">{ex.name.split(" ").slice(1).join(" ")}</span>
                </div>
              ))}
              {workout.exercises.length > 3 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  +{workout.exercises.length - 3} more activities!
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={() => onViewWorkout(workout)}
            className={`w-full bg-gradient-to-r ${gradient} hover:opacity-90 transition-opacity text-white font-bold`}
          >
            🎮 Let's Go!
          </Button>
        </Card>
      </motion.div>
    );
  }

  // ── Normal Card ────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col relative overflow-hidden group">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(workout.id); }}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-all"
        >
          <Heart className={`w-5 h-5 transition-all ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-red-500"}`} />
        </button>

        <div className="flex-1 pt-4">
          {workout.isModified && workout.modeBadge && (
            <div className="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 w-fit">
              <Shield className="w-4 h-4" />
              <span className="text-xs font-medium">{workout.modeBadge}</span>
            </div>
          )}

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 pr-10">
            {workout.title}
          </h3>

          <div className="flex gap-2 mb-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {typeLabels[workout.type]}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${difficultyColors[workout.difficulty]}`}>
              {workout.difficulty.charAt(0).toUpperCase() + workout.difficulty.slice(1)}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {visibleTargets.map((target) => (
              <span key={target} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {target.charAt(0).toUpperCase() + target.slice(1)}
              </span>
            ))}
            {remainingCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                +{remainingCount} more
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{workout.durationMinutes} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Dumbbell className="w-4 h-4" />
              <span>{workout.exercises.length} exercises</span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => onViewWorkout(workout)}
          className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          View Workout
        </Button>
      </Card>
    </motion.div>
  );
}
