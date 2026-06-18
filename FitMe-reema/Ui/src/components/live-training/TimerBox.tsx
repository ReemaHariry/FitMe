/**
 * Timer display box with elapsed time and progress bar.
 */
interface TimerBoxProps {
  formattedTime: string;
  elapsedSeconds: number;
}

export function TimerBox({ formattedTime, elapsedSeconds }: TimerBoxProps) {
  const progressPercent = (elapsedSeconds % 60) * (100 / 60);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500 mb-2">Duration</h3>
      <p className="text-2xl font-bold text-gray-900 font-mono mb-4">
        {formattedTime}
      </p>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-1000 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
