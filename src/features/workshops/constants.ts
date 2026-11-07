/** Durées proposées pour un atelier (en minutes). */
export const WORKSHOP_DURATIONS = [45, 60, 90, 120] as const;

export const WORKSHOP_DURATION_LABELS: Record<(typeof WORKSHOP_DURATIONS)[number], string> = {
  45: "45 min",
  60: "1 h",
  90: "1 h 30",
  120: "2 h",
};

/** Niveau déclaré à l'inscription (migration 0008). */
export const WORKSHOP_LEVELS = ["debutant", "intermediaire", "avance"] as const;
export type WorkshopLevel = (typeof WORKSHOP_LEVELS)[number];

export const WORKSHOP_LEVEL_LABELS: Record<WorkshopLevel, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};
