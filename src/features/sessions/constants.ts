/** Durées proposées pour une séance (en minutes). */
export const DURATIONS = [30, 45, 60, 90, 120] as const;

export const DURATION_LABELS: Record<(typeof DURATIONS)[number], string> = {
  30: "30 min",
  45: "45 min",
  60: "1 h",
  90: "1 h 30",
  120: "2 h",
};
