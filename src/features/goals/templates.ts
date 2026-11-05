/**
 * « Parcours suggéré » (TDR §7.2 : personnaliser les parcours d'accompagnement).
 * Objectifs types par domaine, inspirés des sous-thèmes du §5 du cahier des
 * charges. Ils s'ajoutent en un clic puis s'adaptent librement.
 */
export const GOAL_TEMPLATES: Record<string, string[]> = {
  entrepreneuriat: [
    "Formuler le problème et la solution en une phrase",
    "Interroger 10 clients potentiels",
    "Construire le business model",
    "Établir le budget de démarrage",
    "Identifier les sources de financement",
  ],
  numerique: [
    "Choisir une spécialité (web, data, IA, cybersécurité…)",
    "Suivre une formation en ligne gratuite",
    "Réaliser et publier un premier projet",
    "Constituer un portfolio",
    "Postuler à un stage",
  ],
  "orientation-insertion": [
    "Clarifier mon projet professionnel",
    "Mettre à jour mon CV",
    "Rédiger une lettre de motivation type",
    "Préparer mes entretiens d'embauche",
    "Développer mon réseau professionnel",
  ],
  "culture-creation": [
    "Définir mon projet créatif",
    "Constituer un portfolio ou un manuscrit",
    "Identifier les éditeurs, diffuseurs ou plateformes cibles",
    "Présenter mon projet à un professionnel",
  ],
  "gestion-finance": [
    "Choisir le statut juridique",
    "Établir un plan de financement sur 3 ans",
    "Mettre en place un suivi de trésorerie",
    "Préparer un dossier de demande de financement",
  ],
  "developpement-personnel": [
    "Identifier mes forces et mes axes de progrès",
    "Préparer une prise de parole de 2 minutes",
    "Organiser ma semaine avec des priorités",
    "Animer une réunion ou un atelier",
  ],
  "campus-france": [
    "Choisir 3 formations cibles",
    "Clarifier mon projet d'études et mon projet professionnel",
    "Rédiger la lettre de motivation",
    "Mettre à jour mon CV",
    "Préparer l'entretien Campus France",
    "Constituer et déposer mon dossier",
  ],
};

/** Suggestions pour un domaine, sans celles déjà présentes (comparaison souple). */
export function suggestedGoals(domainSlug: string | null | undefined, existingTitles: string[]) {
  const norm = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const existing = new Set(existingTitles.map(norm));
  return (GOAL_TEMPLATES[domainSlug ?? ""] ?? []).filter((t) => !existing.has(norm(t)));
}
