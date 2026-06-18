/**
 * Injury Data - Pure ES Module
 * Maps injury types to affected muscle groups for workout filtering
 */

export type InjuryType = 
  | "none" 
  | "shoulder" 
  | "knee" 
  | "lower_back" 
  | "upper_back" 
  | "wrist" 
  | "hip" 
  | "ankle" 
  | "elbow";

export interface InjuryInfo {
  label: string;
  affectedMuscles: string[];
  contraindicationKeys: string[];
}

/**
 * Comprehensive injury-to-muscle mapping
 * Used to filter out exercises that stress injured areas
 */
export const INJURY_DATA: Record<InjuryType, InjuryInfo> = {
  none: {
    label: "No Injury",
    affectedMuscles: [],
    contraindicationKeys: [],
  },
  shoulder: {
    label: "Shoulder Injury",
    affectedMuscles: ["shoulders", "chest", "triceps", "upper back"],
    contraindicationKeys: ["shoulder_injury"],
  },
  knee: {
    label: "Knee Injury",
    affectedMuscles: ["quads", "hamstrings", "legs"],
    contraindicationKeys: ["knee_injury"],
  },
  lower_back: {
    label: "Lower Back Injury",
    affectedMuscles: ["lower back", "back", "core"],
    contraindicationKeys: ["back_injury"],
  },
  upper_back: {
    label: "Upper Back Injury",
    affectedMuscles: ["upper back", "back", "shoulders"],
    contraindicationKeys: ["back_injury"],
  },
  wrist: {
    label: "Wrist Injury",
    affectedMuscles: ["wrist", "forearms"],
    contraindicationKeys: ["wrist_injury"],
  },
  hip: {
    label: "Hip Injury",
    affectedMuscles: ["hip", "glutes", "legs"],
    contraindicationKeys: ["hip_injury"],
  },
  ankle: {
    label: "Ankle Injury",
    affectedMuscles: ["ankle", "calves", "legs"],
    contraindicationKeys: ["ankle_injury"],
  },
  elbow: {
    label: "Elbow Injury",
    affectedMuscles: ["elbow", "biceps", "triceps", "forearms"],
    contraindicationKeys: ["elbow_injury"],
  },
};

/**
 * Get all injury options for dropdown
 */
export function getInjuryOptions(): Array<{ value: InjuryType; label: string }> {
  return Object.entries(INJURY_DATA).map(([value, info]) => ({
    value: value as InjuryType,
    label: info.label,
  }));
}

/**
 * Check if an exercise is safe for a given injury
 * @param exerciseContraindications - Array of contraindication keys from exercise
 * @param injuryType - Selected injury type
 * @returns true if exercise is safe, false if it should be filtered/replaced
 */
export function isExerciseSafeForInjury(
  exerciseContraindications: string[] | undefined,
  injuryType: InjuryType
): boolean {
  if (injuryType === "none" || !exerciseContraindications) {
    return true;
  }

  const injuryInfo = INJURY_DATA[injuryType];
  
  // Check if exercise has contraindications matching this injury
  return !exerciseContraindications.some((contraindication) =>
    injuryInfo.contraindicationKeys.includes(contraindication)
  );
}

/**
 * Type guard to check if an exercise is an injury-safe alternative
 * @param exercise - Exercise or InjurySafeExercise
 * @returns true if it's an InjurySafeExercise
 */
export function isInjurySafeExercise(exercise: any): boolean {
  return exercise && exercise.isInjurySafe === true;
}
