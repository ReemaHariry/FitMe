import { ChevronDown } from "lucide-react";
import { UserSettings, UserMode, InjuryType } from "../../types/workout.types";

interface SmartModeBarProps {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

const MODES: { value: UserMode; label: string; emoji: string }[] = [
  { value: "normal",   label: "Normal",     emoji: "💪" },
  { value: "injury",   label: "Injury",     emoji: "🩹" },
  { value: "pregnant", label: "Pregnancy",  emoji: "🤰" },
  { value: "child",    label: "Kids",       emoji: "🌟" },
];

const INJURY_TYPES: { value: InjuryType; label: string }[] = [
  { value: "knee",     label: "Knee" },
  { value: "shoulder", label: "Shoulder" },
  { value: "back",     label: "Back" },
];

const modeColors: Record<UserMode, string> = {
  normal:   "bg-primary/10 text-primary border-primary/30",
  injury:   "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/30",
  pregnant: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-500/30",
  child:    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
};

const modeDescriptions: Partial<Record<UserMode, string>> = {
  injury:   "Select your injury area — affected exercises will be automatically replaced.",
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

        {settings.mode === "injury" && (
          <div className="relative">
            <select
              value={settings.injuryType ?? ""}
              onChange={(e) => onUpdate({ injuryType: (e.target.value as InjuryType) || null })}
              className="input appearance-none pr-10 py-2 text-sm"
            >
              <option value="">Select injury area</option>
              {INJURY_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        )}
      </div>

      {settings.mode !== "normal" && modeDescriptions[settings.mode] && (
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          {settings.mode === "injury" && settings.injuryType
            ? `Exercises that stress your ${settings.injuryType} will be automatically replaced with safe alternatives.`
            : modeDescriptions[settings.mode]}
        </p>
      )}
    </div>
  );
}
