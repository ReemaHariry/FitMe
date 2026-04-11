import { useState, useMemo } from "react";
import { FilterState, SmartWorkout, Workout } from "../../types/workout.types";
import { WORKOUTS } from "../../data/workoutData";
import { KIDS_WORKOUTS } from "../../data/kidsWorkoutData";
import { useWorkoutFilters } from "../../hooks/useWorkoutFilters";
import { useFavorites } from "../../hooks/useFavorites";
import { useUserSettings } from "../../hooks/useUserSettings";
import { generateAllWorkouts } from "../../utils/smartEngine";
import { FiltersBar } from "../../components/workouts/FiltersBar";
import { WorkoutGrid } from "../../components/workouts/WorkoutGrid";
import { WorkoutDetailModal } from "../../components/workouts/WorkoutDetailModal";
import { SmartModeBar } from "../../components/workouts/SmartModeBar";
import { KidsAvatar } from "../../components/workouts/KidsAvatar";

// All workouts combined — engine filters by isKidsWorkout flag
const ALL_WORKOUTS: Workout[] = [...WORKOUTS, ...KIDS_WORKOUTS];

export default function Workouts() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    muscleGroups: [],
    difficulty: "all",
    injuryMode: "none",
  });

  const [selectedWorkout, setSelectedWorkout] = useState<SmartWorkout | null>(null);
  const [originalWorkout, setOriginalWorkout] = useState<Workout | null>(null);

  const { favorites, toggleFavorite } = useFavorites();
  const { settings, updateSettings } = useUserSettings();

  const isKidsMode = settings.mode === "child";

  // Smart engine — returns kids workouts OR adult workouts based on mode
  const smartWorkouts = useMemo(
    () => generateAllWorkouts(ALL_WORKOUTS, settings),
    [settings]
  );

  // Standard filters applied always; kids mode just ignores them (no filter bar shown)
  const allFiltered = useWorkoutFilters(
    smartWorkouts as unknown as Workout[],
    filters
  ) as unknown as SmartWorkout[];

  const filteredWorkouts = isKidsMode ? smartWorkouts : allFiltered;

  const handleViewWorkout = (workout: SmartWorkout) => {
    setSelectedWorkout(workout);
    const original = ALL_WORKOUTS.find((w) => w.id === workout.id) ?? null;
    setOriginalWorkout(original);
  };

  return (
    <div className="space-y-6">
      {/* Header — changes for kids mode */}
      {isKidsMode ? (
        <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-yellow-500/10 rounded-2xl border border-purple-200 dark:border-purple-800">
          <KidsAvatar pose="jumping" size={100} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              🌟 Kids Workout Zone!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fun exercises just for you! Pick a workout and let's move! 🎉
            </p>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Workouts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Smart adaptive workouts — automatically adjusted for your needs
          </p>
        </div>
      )}

      {/* Smart Mode Selector */}
      <SmartModeBar settings={settings} onUpdate={updateSettings} />

      {/* Standard Filters — hidden in kids mode */}
      {!isKidsMode && (
        <FiltersBar filters={filters} onFiltersChange={setFilters} />
      )}

      {/* Results Count */}
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {isKidsMode
          ? `${filteredWorkouts.length} fun workouts ready for you! 🎉`
          : `${filteredWorkouts.length} workout${filteredWorkouts.length !== 1 ? "s" : ""} found`}
      </p>

      {/* Workout Grid */}
      {filteredWorkouts.length > 0 ? (
        <WorkoutGrid
          workouts={filteredWorkouts}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onViewWorkout={handleViewWorkout}
          isKidsMode={isKidsMode}
        />
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No workouts found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or mode
          </p>
        </div>
      )}

      {/* Workout Detail Modal */}
      <WorkoutDetailModal
        workout={selectedWorkout}
        originalWorkout={originalWorkout ?? undefined}
        open={!!selectedWorkout}
        onClose={() => { setSelectedWorkout(null); setOriginalWorkout(null); }}
        userSettings={settings}
      />
    </div>
  );
}
