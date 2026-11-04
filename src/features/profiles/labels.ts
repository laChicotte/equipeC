import type { MenteeStatus, UserRole } from "@/types/database";

/** Libellés français affichés dans l'interface. */
export const ROLE_LABELS: Record<UserRole, string> = {
  mentor: "Mentor",
  mentee: "Mentoré",
};

export const MENTEE_STATUS_LABELS: Record<MenteeStatus, string> = {
  etudiant: "Étudiant(e)",
  jeune_diplome: "Jeune diplômé(e)",
  entrepreneur: "Entrepreneur(e)",
  porteur_projet: "Porteur(se) de projet",
  reconversion: "En reconversion",
  autre: "Autre",
};
