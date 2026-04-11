/**
 * Status indicator component showing current training state.
 */
import type { TrainingStatus } from '../../types/training.types';

interface StatusIndicatorProps {
  status: TrainingStatus;
}

const statusConfig: Record<
  TrainingStatus,
  { color: string; label: string; pulse: boolean }
> = {
  idle: { color: 'bg-gray-400', label: 'Ready', pulse: false },
  'camera-ready': { color: 'bg-blue-500', label: 'Camera Ready', pulse: false },
  live: { color: 'bg-green-500', label: 'Live', pulse: true },
  processing: { color: 'bg-yellow-500', label: 'Processing...', pulse: false },
  done: { color: 'bg-gray-400', label: 'Session Complete', pulse: false },
};

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${config.color} ${
            config.pulse ? 'animate-pulse' : ''
          }`}
        />
      </div>
      <span className="text-sm font-medium text-gray-700">{config.label}</span>
    </div>
  );
}
