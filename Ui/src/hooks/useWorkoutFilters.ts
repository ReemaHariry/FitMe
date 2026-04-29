/**
 * Workout Filtering Hook
 * Pure client-side filtering with no external dependencies
 */

import { useMemo } from "react";
import { Workout, FilterState, SmartWorkout } from "../types/workout.types";
import { InjuryType, isExerciseSafeForInjury } from "../data/injuryData";

/**
 * Filters workouts based on current filter state
 * @param workouts - Array of all workouts
 * @param filters - Current filter state
 * @returns Filtered workouts
 */
export function useWorkoutFilters(
  workouts: Workout[],
  filters: FilterState
): Workout[] | SmartWorkout[] {
  return useMemo(() => {
    let filtered = [...workouts];

    // Search filter: case-insensitive match on title or exercise names
    if (filters.search.trim()) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((workout) => {
        const titleMatch = workout.title.toLowerCase().includes(searchLower);
        const exerciseMatch = workout.exercises.some((ex) =>
          ex.name.toLowerCase().includes(searchLower)
        );
        return titleMatch || exerciseMatch;
      });
    }

    // Muscle group filter: workout targets must include ANY selected group
    if (filters.muscleGroups.length > 0) {
      filtered = filtered.filter((workout) =>
        filters.muscleGroups.some((group) => workout.targets.includes(group))
      );
    }

    // Difficulty filter: exact match
    if (filters.difficulty !== "all") {
      filtered = filtered.filter(
        (workout) => workout.difficulty === filters.difficulty
      );
    }

    // Injury filter: filter out workouts with unsafe exercises
    // The smart engine will handle exercise replacements
    if (filters.injuryMode !== "none") {
      const injuryType = filters.injuryMode as InjuryType;
      
      // Filter workouts that have at least some safe exercises
      filtered = filtered.filter((workout) => {
        // Check if workout has any exercises that are safe for this injury
        const hasSafeExercises = workout.exercises.some((exercise) =>
          isExerciseSafeForInjury(exercise.contraindications, injuryType)
        );
        
        // Keep workouts that have safe exercises OR have alternatives defined
        const hasAlternatives = workout.exercises.some((exercise) =>
          exercise.alternatives && Object.keys(exercise.alternatives).length > 0
        );
        
        return hasSafeExercises || hasAlternatives;
      });
    }

    return filtered;
  }, [workouts, filters]);
}
