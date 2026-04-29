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
import { AlertTriangle, X } from "lucide-react";
import { INJURY_DATA } from "../../data/injuryData";

// All workouts combined — engine filters by isKidsWorkout flag
const ALL_WORKOUTS: Workout[] = [...WORKOUTS, ...KIDS_WORKOUTS];

export default function Workouts() {
  const { favorites, toggleFavorite } = useFavorites();
  const { settings, updateSettings } = useUserSettings();

  // CHANGED: Initialize filters with injuryMode from settings.injuryType
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    muscleGroups: [],
    difficulty: "all",
    injuryMode: settings.injuryType || "none",
  });

  const [selectedWorkout, setSelectedWorkout] = useState<SmartWorkout | null>(null);
  const [originalWorkout, setOriginalWorkout] = useState<Workout | null>(null);

  const isKidsMode = settings.mode === "child";

  // CHANGED: Sync injury filter changes to settings.injuryType
  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    // Sync injuryMode to settings.injuryType
    if (newFilters.injuryMode !== filters.injuryMode) {
      updateSettings({ 
        injuryType: newFilters.injuryMode === "none" ? null : newFilters.injuryMode 
      });
    }
  };

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

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      search: "",
      muscleGroups: [],
      difficulty: "all",
      injuryMode: "none",
    });
    updateSettings({ injuryType: null });
  };

  // Check if injury mode is active
  const hasInjurySelected = filters.injuryMode !== "none";
  const injuryLabel = hasInjurySelected ? INJURY_DATA[filters.injuryMode].label : "";

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
        <FiltersBar filters={filters} onFiltersChange={handleFiltersChange} />
      )}

      {/* Injury Safety Banner — shown when injury is selected */}
      {!isKidsMode && hasInjurySelected && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
              {injuryLabel} Mode Active
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Workouts have been filtered to show exercises safe for your injury. 
              Some exercises may be replaced with safer alternatives. Always consult 
              with a healthcare professional before exercising with an injury.
            </p>
          </div>
          <button
            onClick={() => handleFiltersChange({ ...filters, injuryMode: "none" })}
            className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
            aria-label="Clear injury filter"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
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
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No workouts found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {hasInjurySelected
                ? "No workouts match your current filters and injury settings. Try adjusting your filters or clearing the injury mode."
                : "No workouts match your current filters. Try adjusting your search or filter criteria."}
            </p>
            <button
              onClick={handleClearFilters}
              className="btn-primary"
            >
              Clear all filters
            </button>
          </div>
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
