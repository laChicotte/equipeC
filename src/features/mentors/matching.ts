/**
 * Recommandation de mentors : score de compatibilité EXPLICABLE (0 à 100).
 *
 * Fonction pure (aucun accès réseau ni base) : facile à tester
 * (tests/matching.test.mjs) et à expliquer au jury. Chaque point attribué
 * produit une « raison » affichée à l'utilisateur.
 *
 * ⚠️ Pas d'import d'exécution ici (seulement des `import type`) pour que les
 * tests puissent charger ce fichier directement avec Node.
 */
import type { MenteeStatus } from "@/types/database";

export type MenteeInput = {
  domainIds: number[];
  menteeStatus: MenteeStatus | null;
  /** Objectifs, titre et présentation du mentoré */
  text: string;
};

export type MentorInput = {
  id: string;
  domains: { id: number; slug: string; name: string }[];
  /** Poste, titre, organisation, présentation… */
  text: string;
  yearsExperience: number | null;
  rating: { avg: number; count: number } | null;
};

export type Recommendation = { mentorId: string; score: number; reasons: string[] };

/** Domaines naturellement liés à chaque situation de mentoré (TDR §2.3 et §5). */
const STATUS_AFFINITY: Record<MenteeStatus, { slugs: string[]; label: string }> = {
  etudiant: { slugs: ["campus-france", "orientation-insertion"], label: "aux étudiants" },
  jeune_diplome: { slugs: ["orientation-insertion", "developpement-personnel"], label: "aux jeunes diplômés" },
  entrepreneur: { slugs: ["entrepreneuriat", "gestion-finance"], label: "aux entrepreneurs" },
  porteur_projet: { slugs: ["entrepreneuriat", "gestion-finance"], label: "aux porteurs de projet" },
  reconversion: { slugs: ["orientation-insertion", "numerique"], label: "aux personnes en reconversion" },
  autre: { slugs: [], label: "" },
};

/** Mots trop courants pour être significatifs. */
const STOPWORDS = new Set([
  "avec", "dans", "pour", "mais", "plus", "tres", "sans", "sous", "vers", "chez", "cette", "ceux",
  "elle", "elles", "nous", "vous", "leur", "leurs", "donc", "comme", "faire", "etre",
  "avoir", "mon", "mes", "notre", "votre", "aussi", "bien", "tout", "tous", "toute", "toutes",
  "souhaite", "voudrais", "aimerais", "besoin", "aider", "aide", "trouver", "projet", "projets",
]);

/** Minuscules, sans accents. */
export function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** Mots significatifs d'un texte (4 lettres ou plus, hors mots courants). */
export function keywords(text: string): string[] {
  const words = normalize(text).match(/[a-z0-9]+/g) ?? [];
  return [...new Set(words.filter((w) => w.length >= 4 && !STOPWORDS.has(w)))];
}

/** Deux mots « se ressemblent » s'ils partagent leurs 5 premières lettres
 *  (ex. entrepreneur / entrepreneuriat, informatique / informaticien). */
function sameRoot(a: string, b: string) {
  if (a.length < 5 || b.length < 5) return a === b;
  return a.slice(0, 5) === b.slice(0, 5);
}

export function scoreMentor(mentee: MenteeInput, mentor: MentorInput): Recommendation {
  const reasons: string[] = [];
  let score = 0;

  // 1. Domaines en commun (critère principal)
  const shared = mentor.domains.filter((d) => mentee.domainIds.includes(d.id));
  if (shared.length > 0) {
    score += Math.min(60, 40 + (shared.length - 1) * 10);
    reasons.push(
      `${shared.length > 1 ? "Domaines" : "Domaine"} en commun : ${shared.map((d) => d.name).join(", ")}`,
    );
  }

  // 2. Mots-clés des objectifs retrouvés dans le profil du mentor
  const mentorWords = keywords(
    `${mentor.text} ${mentor.domains.map((d) => d.name).join(" ")}`,
  );
  const matched = keywords(mentee.text).filter((w) => mentorWords.some((m) => sameRoot(w, m)));
  if (matched.length > 0) {
    score += Math.min(20, matched.length * 5);
    reasons.push(
      `Correspond à vos objectifs : ${matched.slice(0, 3).map((w) => `« ${w} »`).join(", ")}`,
    );
  }

  // 3. Affinité avec la situation du mentoré
  if (mentee.menteeStatus) {
    const affinity = STATUS_AFFINITY[mentee.menteeStatus];
    if (mentor.domains.some((d) => affinity.slugs.includes(d.slug))) {
      score += 10;
      reasons.push(`Expertise adaptée ${affinity.label}`);
    }
  }

  // 4. Qualité : note moyenne (au-dessus de 3/5) et expérience
  if (mentor.rating && mentor.rating.count > 0 && mentor.rating.avg > 3) {
    score += Math.round((mentor.rating.avg - 3) * 3);
    if (mentor.rating.avg >= 4) {
      reasons.push(`Très bien noté (${mentor.rating.avg.toLocaleString("fr-FR")}/5)`);
    }
  }
  if (mentor.yearsExperience) {
    score += Math.min(5, Math.floor(mentor.yearsExperience / 4));
    if (mentor.yearsExperience >= 10) reasons.push(`${mentor.yearsExperience} ans d'expérience`);
  }

  return { mentorId: mentor.id, score: Math.min(100, score), reasons };
}

/**
 * « Recherche intelligente » : déduit les domaines évoqués dans une phrase
 * libre (ex. « valider mon idée de fintech » → entrepreneuriat, numérique).
 * Comparaison par racine de mot (5 premières lettres), sans accents.
 */
const DOMAIN_HINTS: Record<string, string[]> = {
  entrepreneuriat: [
    "entreprise", "entrepreneur", "startup", "fintech", "agritech", "business", "creer", "creation",
    "client", "commercial", "vendre", "idee", "projet", "marche", "lancer",
  ],
  numerique: [
    "informatique", "developpeur", "developpement", "code", "coder", "programmation", "web",
    "application", "data", "donnees", "intelligence", "cybersecurite", "securite", "digital",
    "numerique", "design", "fintech", "tech",
  ],
  "orientation-insertion": [
    "emploi", "travail", "stage", "entretien", "embauche", "recrutement", "candidature", "orientation",
    "carriere", "reconversion", "metier",
  ],
  "culture-creation": [
    "livre", "ecrire", "ecriture", "edition", "auteur", "video", "contenu", "audiovisuel", "musique",
    "culture", "artiste", "createur",
  ],
  "gestion-finance": [
    "finance", "financement", "comptabilite", "budget", "gestion", "investissement", "banque",
    "subvention", "tresorerie", "fintech",
  ],
  "developpement-personnel": [
    "confiance", "leadership", "parole", "public", "timidite", "organisation", "temps", "equipe",
    "manager", "motivation",
  ],
  "campus-france": [
    "campus", "france", "master", "licence", "etudes", "etudiant", "universite", "visa", "dossier",
    "admission", "ecole",
  ],
};

/** Raccourci « cv » : trop court pour la règle des 5 lettres, traité à part. */
const SHORT_HINTS: Record<string, string> = { cv: "orientation-insertion", ia: "numerique" };

export function inferDomainSlugs(text: string): string[] {
  const words = normalize(text).match(/[a-z0-9]+/g) ?? [];
  const slugs = new Set<string>();
  for (const word of words) {
    if (SHORT_HINTS[word]) slugs.add(SHORT_HINTS[word]);
    if (word.length < 4) continue;
    for (const [slug, hints] of Object.entries(DOMAIN_HINTS)) {
      if (hints.some((hint) => sameRoot(word, hint))) slugs.add(slug);
    }
  }
  return [...slugs];
}

/**
 * Les meilleurs mentors pour un mentoré. Ne garde que les mentors pertinents :
 * au moins un domaine en commun OU des mots-clés communs (score ≥ 20).
 */
export function recommendMentors(
  mentee: MenteeInput,
  mentors: MentorInput[],
  { limit = 3, minScore = 20 } = {},
): Recommendation[] {
  return mentors
    .map((mentor) => scoreMentor(mentee, mentor))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
