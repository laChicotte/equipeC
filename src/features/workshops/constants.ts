/** Durées proposées pour un atelier (en minutes). */
export const WORKSHOP_DURATIONS = [45, 60, 90, 120] as const;

export const WORKSHOP_DURATION_LABELS: Record<(typeof WORKSHOP_DURATIONS)[number], string> = {
  45: "45 min",
  60: "1 h",
  90: "1 h 30",
  120: "2 h",
};
