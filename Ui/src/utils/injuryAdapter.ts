// Re-exports for backward compatibility.
// New code should import from smartEngine directly.

export { isInjurySafeExercise, generateWorkout } from "./smartEngine";

import { Workout, InjuryMode, InjurySafeExercise, Exercise } from "../types/workout.types";

/** Returns list of exercises swapped between two workout versions. */
export function getSwappedExercises(
  original: Workout,
  adapted: { exercises: (Exercise | InjurySafeExercise)[] }
): Array<{ original: string; replacement: string }> {
  return original.exercises
    .map((orig, i) => {
      const adapted_ = adapted.exercises[i];
      if (!adapted_ || orig.name === adapted_.name) return null;
      return { original: orig.name, replacement: adapted_.name };
    })
    .filter(Boolean) as Array<{ original: string; replacement: string }>;
}

/** Legacy adapter — maps old InjuryMode to UserSettings and runs engine. */
export function adaptWorkoutForInjury(workout: Workout, injury: InjuryMode): Workout {
  if (injury === "none") return workout;
  const { generateWorkout: gen } = require("./smartEngine");
  const result = gen(workout, {
    mode: "injury",
    injuryType: injury,
    goal: null,
    time: null,
    equipment: "none",
  });
  return { ...result } as unknown as Workout;
}
