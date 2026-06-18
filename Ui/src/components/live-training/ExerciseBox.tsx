/**
 * Exercise display box showing current exercise and confidence.
 */
interface ExerciseBoxProps {
  exercise: string;
  confidence?: number;
}

export function ExerciseBox({ exercise, confidence }: ExerciseBoxProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 transition-all duration-300">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Exercise</h3>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-gray-900 transition-opacity duration-300">
          {exercise}
        </p>
        {confidence !== undefined && confidence > 0 && (
          <p className="text-sm text-gray-600">
            Confidence: {Math.round(confidence * 100)}%
          </p>
        )}
      </div>
    </div>
  );
}
