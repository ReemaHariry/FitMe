// ─────────────────────────────────────────────────────────────
// useUserSettings — persisted user mode/injury/goal settings
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { UserSettings } from "../types/workout.types";

const DEFAULT: UserSettings = {
  mode: "normal",
  injuryType: null,
  goal: null,
  time: null,
  equipment: "none",
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem("fitapp_user_settings");
      return stored ? { ...DEFAULT, ...JSON.parse(stored) } : DEFAULT;
    } catch {
      return DEFAULT;
    }
  });

  const updateSettings = useCallback((patch: Partial<UserSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      // CHANGED: Don't auto-clear injuryType - it's now a filter that persists across mode changes
      // Users can manually clear it via the Injury Mode dropdown in Normal mode
      try {
        localStorage.setItem("fitapp_user_settings", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
