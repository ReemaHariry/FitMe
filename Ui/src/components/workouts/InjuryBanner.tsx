/**
 * Injury Banner Component
 * Displays active injury mode warning
 */

import { AlertTriangle } from "lucide-react";
import { InjuryMode } from "../../types/workout.types";

interface InjuryBannerProps {
  injuryMode: InjuryMode;
  swappedExercises?: Array<{ original: string; replacement: string }>;
}

/**
 * Shows warning banner when injury mode is active
 */
export function InjuryBanner({
  injuryMode,
  swappedExercises,
}: InjuryBannerProps) {
  if (injuryMode === "none") {
    return null;
  }

  const injuryLabels: Record<Exclude<InjuryMode, "none">, string> = {
    knee: "Knee Injury",
    back: "Back Injury",
    shoulder: "Shoulder Injury",
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
            {injuryLabels[injuryMode]} Mode Active
          </h3>
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Exercises have been adapted to avoid stress on your{" "}
            {injuryMode === "knee" ? "knees" : injuryMode}.
            {swappedExercises && swappedExercises.length > 0 && (
              <>
                {" "}
                Swapped: {swappedExercises.map((s) => s.original).join(", ")}
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
