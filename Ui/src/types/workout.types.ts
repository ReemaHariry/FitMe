// ─────────────────────────────────────────────────────────────
// Workout Type Definitions — Smart Adaptive System
// ─────────────────────────────────────────────────────────────

import { InjuryType } from "../data/injuryData";

export type WorkoutType = "upper" | "lower" | "full" | "crossfit" | "calisthenics";
export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type MuscleGroup =
  | "chest" | "back" | "shoulders" | "arms"
  | "legs" | "core" | "full-body" | "cardio" | "bodyweight";

// Legacy — kept for backward compat with filters
export type InjuryMode = "none" | "knee" | "back" | "shoulder";

// ── User Settings ──────────────────────────────────────────
// CHANGED: Removed "injury" from UserMode - injury is now a filter within Normal mode
export type UserMode = "normal" | "pregnant" | "child";
export type UserGoal = "fat_loss" | "muscle_gain" | "mobility";
export type Equipment = "none" | "dumbbells" | "full_gym";

export interface UserSettings {
  mode: UserMode;
  injuryType: string | null; // Now uses InjuryType from injuryData
  goal: UserGoal | null;
  time: number | null;
  equipment: Equipment;
}

// ── Contraindication keys ──────────────────────────────────
export type ContraindicationKey =
  | "knee_injury"
  | "shoulder_injury"
  | "back_injury"
  | "pregnant"
  | "child";

// ── Exercise Level ─────────────────────────────────────────
export interface ExerciseLevel {
  label: string;
  videoUrl: string;
  steps: string[];
  tips: string[];
}

// ── Safe / Replacement Exercise (flat — no levels) ─────────
export interface InjurySafeExercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  restSeconds: number;
  videoUrl: string;
  steps: string[];
  tips: string[];
  isInjurySafe: true;
  noLevels: true;
  replacesExercise?: string;
  replacementReason?: ContraindicationKey;
}

// ── Core Exercise ──────────────────────────────────────────
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number | string;
  restSeconds: number;
  muscles?: string[];
  contraindications?: ContraindicationKey[];
  alternatives?: Partial<Record<ContraindicationKey, InjurySafeExercise>>;
  levels: {
    beginner: ExerciseLevel;
    intermediate: ExerciseLevel;
    advanced: ExerciseLevel;
  };
  isInjurySafe?: false;
  noLevels?: false;
  // Legacy field — still supported
  injurySafeAlternative?: {
    forInjury: InjuryMode[];
    exercise: InjurySafeExercise;
  };
}

// ── Runtime exercise after smart engine runs ──────────────
export type RuntimeExercise = Exercise | InjurySafeExercise;

// ── Workout ────────────────────────────────────────────────
export interface Workout {
  id: string;
  title: string;
  type: WorkoutType;
  targets: MuscleGroup[];
  difficulty: DifficultyLevel;
  durationMinutes: number;
  exercises: Exercise[];
  isFavorite?: boolean;
  isKidsWorkout?: boolean; // only shown in Kids mode
}

// ── Smart-processed workout (after generateWorkout) ────────
export interface SmartWorkout extends Omit<Workout, "exercises"> {
  exercises: RuntimeExercise[];
  isModified: boolean;
  modificationReasons: ContraindicationKey[];
  modeBadge: string | null; // e.g. "Modified for Knee Injury"
}

// ── Filter State ───────────────────────────────────────────
export interface FilterState {
  search: string;
  muscleGroups: MuscleGroup[];
  difficulty: DifficultyLevel | "all";
  injuryMode: string; // Now uses InjuryType from injuryData
}
