import type {
  MenteeStatus,
  MentorshipStatus,
  OpportunityKind,
  ResourceKind,
  UserRole,
} from "@/types/database";

/** Noms courts des domaines (affichages compacts : page d'accueil, pastilles). */
export const DOMAIN_SHORT_LABELS: Record<string, string> = {
  entrepreneuriat: "Entrepreneuriat",
  numerique: "Numérique & tech",
  "orientation-insertion": "Orientation & emploi",
  "culture-creation": "Industries créatives",
  "gestion-finance": "Gestion & finance",
  "developpement-personnel": "Leadership",
  "campus-france": "Campus France",
};

export const RESOURCE_KIND_LABELS: Record<ResourceKind, { label: string; icon: string }> = {
  guide: { label: "Guide", icon: "📘" },
  article: { label: "Article", icon: "📰" },
  video: { label: "Vidéo", icon: "🎬" },
  outil: { label: "Outil", icon: "🛠️" },
  modele: { label: "Modèle", icon: "📄" },
  formation: { label: "Formation", icon: "🎓" },
};

export const OPPORTUNITY_KIND_LABELS: Record<OpportunityKind, { label: string; icon: string }> = {
  emploi: { label: "Emploi", icon: "💼" },
  stage: { label: "Stage", icon: "🧑‍💻" },
  bourse: { label: "Bourse", icon: "🎓" },
  financement: { label: "Financement", icon: "💰" },
  concours: { label: "Concours", icon: "🏆" },
  formation: { label: "Formation", icon: "📚" },
  evenement: { label: "Événement", icon: "📅" },
  atelier: { label: "Atelier thématique", icon: "🧑‍🏫" },
};

export const MENTORSHIP_STATUS_LABELS: Record<MentorshipStatus, string> = {
  pending: "En attente",
  accepted: "Active",
  declined: "Refusée",
  ended: "Terminée",
  cancelled: "Annulée",
};

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
  // 6e public du cahier des charges (§2.3) ; valeur « autre » en base
  autre: "Développer de nouvelles compétences",
};

/** Mention obligatoire (TDR §5.7) partout où Campus France apparaît. */
export const CAMPUS_FRANCE_NOTICE =
  "L'accompagnement Campus France relève du conseil, de l'orientation et du partage d'expérience : il ne garantit ni l'admission dans un établissement, ni l'obtention d'un visa.";
