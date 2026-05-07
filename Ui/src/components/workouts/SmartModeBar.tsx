// CHANGED: Removed separate Injury mode - injury is now handled as a filter in Normal mode
import { UserSettings, UserMode } from "../../types/workout.types";

interface SmartModeBarProps {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

// CHANGED: Removed Injury mode from MODES array
const MODES: { value: UserMode; label: string; emoji: string }[] = [
  { value: "normal",   label: "Normal",     emoji: "💪" },
  { value: "pregnant", label: "Pregnancy",  emoji: "🤰" },
  { value: "child",    label: "Kids",       emoji: "🌟" },
];

// CHANGED: Updated modeColors to remove injury mode
const modeColors: Record<UserMode, string> = {
  normal:   "bg-primary/10 text-primary border-primary/30",
  pregnant: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/30",
  child:    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
};

// CHANGED: Updated modeDescriptions to remove injury mode
const modeDescriptions: Partial<Record<UserMode, string>> = {
  pregnant: "High-impact and core-compression exercises are replaced with pregnancy-safe alternatives.",
  child:    "A completely separate set of fun, age-appropriate workouts just for kids! 🎉",
};

export function SmartModeBar({ settings, onUpdate }: SmartModeBarProps) {
  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 shrink-0">
          Workout Mode:
        </span>

        <div className="flex flex-wrap gap-2 flex-1">
          {MODES.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => onUpdate({ mode: value })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                settings.mode === value
                  ? modeColors[value]
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {emoji} {label}
            </button>
          ))}
        </div>

        {/* CHANGED: Removed separate injury selector - now handled in FiltersBar */}
      </div>

      {/* CHANGED: Updated description logic to remove injury mode */}
      {settings.mode !== "normal" && modeDescriptions[settings.mode] && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {modeDescriptions[settings.mode]}
        </p>
      )}
    </div>
  );
}
