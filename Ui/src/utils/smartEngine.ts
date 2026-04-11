// ─────────────────────────────────────────────────────────────
// Smart Workout Engine
// ─────────────────────────────────────────────────────────────

import {
  Workout,
  SmartWorkout,
  Exercise,
  InjurySafeExercise,
  RuntimeExercise,
  UserSettings,
  ContraindicationKey,
} from "../types/workout.types";

function getActiveContraindications(settings: UserSettings): ContraindicationKey[] {
  const keys: ContraindicationKey[] = [];
  if (settings.mode === "pregnant") keys.push("pregnant");
  if (settings.mode === "injury" && settings.injuryType) {
    keys.push(`${settings.injuryType}_injury` as ContraindicationKey);
  }
  return keys;
}

function buildBadge(settings: UserSettings): string | null {
  if (settings.mode === "normal")   return null;
  if (settings.mode === "pregnant") return "Pregnancy Safe";
  if (settings.mode === "child")    return "⭐ Kids Workout";
  if (settings.mode === "injury" && settings.injuryType) {
    const label = settings.injuryType.charAt(0).toUpperCase() + settings.injuryType.slice(1);
    return `Modified for ${label} Injury`;
  }
  return null;
}

function processExercise(
  exercise: Exercise,
  contraindications: ContraindicationKey[]
): RuntimeExercise | null {
  if (contraindications.length === 0) return exercise;

  for (const key of contraindications) {
    if (exercise.alternatives?.[key]) {
      return { ...exercise.alternatives[key] };
    }
  }

  if (exercise.injurySafeAlternative) {
    const { forInjury, exercise: alt } = exercise.injurySafeAlternative;
    const legacyMap: Record<string, ContraindicationKey> = {
      knee: "knee_injury", back: "back_injury", shoulder: "shoulder_injury",
    };
    if (forInjury.some((inj) => contraindications.includes(legacyMap[inj]))) {
      return { ...alt };
    }
  }

  if (exercise.contraindications?.some((c) => contraindications.includes(c))) {
    return null;
  }

  return exercise;
}

export function generateWorkout(workout: Workout, settings: UserSettings): SmartWorkout {
  const contraindications = getActiveContraindications(settings);
  const badge = buildBadge(settings);
  const modificationReasons: ContraindicationKey[] = [];
  const processedExercises: RuntimeExercise[] = [];

  for (const exercise of workout.exercises) {
    const result = processExercise(exercise, contraindications);
    if (result === null) {
      const reason = exercise.contraindications?.find((c) => contraindications.includes(c));
      if (reason && !modificationReasons.includes(reason)) modificationReasons.push(reason);
      continue;
    }
    if (result !== exercise) {
      const reason = (result as InjurySafeExercise).replacementReason;
      if (reason && !modificationReasons.includes(reason)) modificationReasons.push(reason);
    }
    processedExercises.push(result);
  }

  return {
    ...workout,
    exercises: processedExercises,
    isModified: modificationReasons.length > 0,
    modificationReasons,
    modeBadge: badge,
  };
}

/**
 * Returns the correct workout list based on mode:
 * - Kids mode → only isKidsWorkout workouts
 * - All other modes → only non-kids workouts, processed by engine
 */
export function generateAllWorkouts(workouts: Workout[], settings: UserSettings): SmartWorkout[] {
  if (settings.mode === "child") {
    return workouts
      .filter((w) => w.isKidsWorkout === true)
      .map((w) => ({
        ...w,
        exercises: w.exercises as RuntimeExercise[],
        isModified: false,
        modificationReasons: [],
        modeBadge: "⭐ Kids Workout",
      }));
  }

  return workouts
    .filter((w) => !w.isKidsWorkout)
    .map((w) => generateWorkout(w, settings));
}

export function isInjurySafeExercise(ex: RuntimeExercise): ex is InjurySafeExercise {
  return (ex as InjurySafeExercise).isInjurySafe === true;
}
