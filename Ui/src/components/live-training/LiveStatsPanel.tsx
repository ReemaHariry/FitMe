/**
 * Container for the three stat boxes.
 */
import { ExerciseBox } from './ExerciseBox';
import { TimerBox } from './TimerBox';
import { FeedbackBox } from './FeedbackBox';

interface LiveStatsPanelProps {
  exercise: string;
  confidence?: number;
  formattedTime: string;
  elapsedSeconds: number;
  feedback: string[];
}

export function LiveStatsPanel({
  exercise,
  confidence,
  formattedTime,
  elapsedSeconds,
  feedback,
}: LiveStatsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <ExerciseBox exercise={exercise} confidence={confidence} />
      <TimerBox formattedTime={formattedTime} elapsedSeconds={elapsedSeconds} />
      <FeedbackBox feedback={feedback} />
    </div>
  );
}
