import { SmartWorkout } from "../../types/workout.types";
import { WorkoutCard } from "./WorkoutCard";

interface WorkoutGridProps {
  workouts: SmartWorkout[];
  favorites: string[];
  onToggleFavorite: (workoutId: string) => void;
  onViewWorkout: (workout: SmartWorkout) => void;
  isKidsMode?: boolean;
}

export function WorkoutGrid({
  workouts,
  favorites,
  onToggleFavorite,
  onViewWorkout,
  isKidsMode = false,
}: WorkoutGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {workouts.map((workout) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          isFavorite={favorites.includes(workout.id)}
          onToggleFavorite={onToggleFavorite}
          onViewWorkout={onViewWorkout}
          isKidsMode={isKidsMode}
        />
      ))}
    </div>
  );
}
