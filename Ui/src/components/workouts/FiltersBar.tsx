/**
 * Filters Bar Component
 * All workout filters in one horizontal bar
 */

import { Search, ChevronDown } from "lucide-react";
import {
  MuscleGroup,
  DifficultyLevel,
  InjuryMode,
  FilterState,
} from "../../types/workout.types";

interface FiltersBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
  "full-body",
  "cardio",
  "bodyweight",
];

/**
 * Comprehensive filter bar for workouts
 */
export function FiltersBar({ filters, onFiltersChange }: FiltersBarProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleMuscleGroupToggle = (group: MuscleGroup) => {
    const newGroups = filters.muscleGroups.includes(group)
      ? filters.muscleGroups.filter((g) => g !== group)
      : [...filters.muscleGroups, group];
    onFiltersChange({ ...filters, muscleGroups: newGroups });
  };

  const handleDifficultyChange = (value: DifficultyLevel | "all") => {
    onFiltersChange({ ...filters, difficulty: value });
  };

  const handleInjuryModeChange = (value: InjuryMode) => {
    onFiltersChange({ ...filters, injuryMode: value });
  };

  return (
    <div className="card space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search workouts or exercises..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
        />
      </div>

      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Muscle Groups Dropdown */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target Muscle Groups
          </label>
          <div className="relative">
            <select
              value={filters.muscleGroups[0] || ""}
              onChange={(e) => {
                const value = e.target.value as MuscleGroup;
                if (value) {
                  handleMuscleGroupToggle(value);
                }
              }}
              className="input appearance-none pr-10"
            >
              <option value="">All Muscle Groups</option>
              {MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          {/* Selected Pills */}
          {filters.muscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {filters.muscleGroups.map((group) => (
                <span
                  key={group}
                  onClick={() => handleMuscleGroupToggle(group)}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                >
                  {group.charAt(0).toUpperCase() + group.slice(1)}
                  <span className="ml-1">×</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Difficulty Dropdown */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Difficulty Level
          </label>
          <div className="relative">
            <select
              value={filters.difficulty}
              onChange={(e) =>
                handleDifficultyChange(e.target.value as DifficultyLevel | "all")
              }
              className="input appearance-none pr-10"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Injury Mode Dropdown */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Injury Mode
          </label>
          <div className="relative">
            <select
              value={filters.injuryMode}
              onChange={(e) => handleInjuryModeChange(e.target.value as InjuryMode)}
              className="input appearance-none pr-10"
            >
              <option value="none">No Injury</option>
              <option value="knee">Knee Injury</option>
              <option value="back">Back Injury</option>
              <option value="shoulder">Shoulder Injury</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
