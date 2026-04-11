/**
 * Workout Filtering Hook
 * Composable filter logic using Strategy Pattern
 */

import { useMemo } from "react";
import { Workout, FilterState } from "../types/workout.types";
import { adaptWorkoutForInjury } from "../utils/injuryAdapter";

/**
 * Filters workouts based on current filter state
 * @param workouts - Array of all workouts
 * @param filters - Current filter state
 * @returns Filtered and adapted workouts
 */
export function useWorkoutFilters(
  workouts: Workout[],
  filters: FilterState
): Workout[] {
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

    // Injury adaptation: replace exercises with safe alternatives
    if (filters.injuryMode !== "none") {
      filtered = filtered.map((workout) =>
        adaptWorkoutForInjury(workout, filters.injuryMode)
      );
    }

    return filtered;
  }, [workouts, filters]);
}
