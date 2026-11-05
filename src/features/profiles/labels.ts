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
  "culture-creation": "Culture & littérature",
  "gestion-finance": "Gestion & finance",
  "developpement-personnel": "Leadership",
  "campus-france": "Campus France",
};

/** Pictogrammes des domaines (page « Domaines »). */
export const DOMAIN_ICONS: Record<string, string> = {
  entrepreneuriat: "🚀",
  numerique: "💻",
  "orientation-insertion": "🧭",
  "culture-creation": "📚",
  "gestion-finance": "📊",
  "developpement-personnel": "🌱",
  "campus-france": "🎓",
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

/**
 * Thèmes de chaque domaine, repris du cahier des charges (§5). Liste
 * indicative : les mentors la complètent avec leurs compétences précises.
 */
export const DOMAIN_THEMES: Record<string, string[]> = {
  entrepreneuriat: [
    "Création et développement d'entreprise",
    "Structuration des projets entrepreneuriaux",
    "Gestion administrative et financière",
    "Recherche de financements et développement commercial",
  ],
  numerique: [
    "Développement informatique",
    "Intelligence artificielle",
    "Cybersécurité",
    "Marketing digital",
    "Design et création numérique",
  ],
  "orientation-insertion": [
    "Construction du parcours professionnel",
    "Préparation aux entretiens d'embauche",
    "Rédaction de CV et de lettres de motivation",
    "Recherche d'emploi et développement du réseau professionnel",
    "Préparation à la vie en entreprise",
  ],
  "culture-creation": [
    "Écriture et édition",
    "Métiers du livre",
    "Communication et création de contenu",
    "Production audiovisuelle",
    "Entrepreneuriat culturel et artistique",
  ],
  "gestion-finance": [
    "Comptabilité et gestion",
    "Gestion de projets",
    "Management et ressources humaines",
    "Finance et analyse économique",
  ],
  "developpement-personnel": [
    "Prise de parole en public",
    "Confiance en soi",
    "Leadership et gestion d'équipe",
    "Gestion du temps et organisation",
    "Développement des capacités relationnelles",
  ],
  "campus-france": [
    "Orientation et choix des formations et établissements adaptés au profil",
    "Définition et cohérence du projet d'études et du projet professionnel",
    "Constitution et préparation du dossier de candidature",
    "Rédaction du CV et de la lettre de motivation",
    "Préparation à l'entretien Campus France",
    "Présentation du parcours académique et valorisation des expériences",
    "Information sur les démarches administratives liées à la mobilité étudiante",
    "Partage d'expériences d'anciens étudiants en France",
  ],
};

/** Objectif de l'accompagnement Campus France (cahier des charges §5.7). */
export const CAMPUS_FRANCE_OBJECTIVE =
  "Mieux préparer son projet de mobilité académique, renforcer la qualité de sa candidature et aborder chaque étape de la procédure avec davantage de confiance.";
