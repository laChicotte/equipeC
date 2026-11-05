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
  /** Besoins précis saisis par le mentoré (ex. « Lettre de motivation ») */
  needs?: string[];
};

export type MentorInput = {
  id: string;
  domains: { id: number; slug: string; name: string }[];
  /** Poste, titre, organisation, présentation, compétences… */
  text: string;
  /** Compétences précises déclarées par le mentor (ex. « Business plan ») */
  skills?: string[];
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

/**
 * Besoins du mentoré couverts par un mentor : tous les mots significatifs du
 * besoin se retrouvent (même racine) dans ses compétences ou son profil.
 * Un besoin très court (ex. « CV ») est cherché mot pour mot.
 */
export function coveredNeeds(needs: string[], mentor: Pick<MentorInput, "text" | "skills">): string[] {
  const haystack = `${(mentor.skills ?? []).join(" ")} ${mentor.text}`;
  const mentorWords = keywords(haystack);
  const mentorTokens = new Set(normalize(haystack).match(/[a-z0-9]+/g) ?? []);
  return needs.filter((need) => {
    const words = keywords(need);
    if (words.length === 0) {
      const tokens = normalize(need).match(/[a-z0-9]+/g) ?? [];
      return tokens.length > 0 && tokens.every((t) => mentorTokens.has(t));
    }
    return words.every((w) => mentorWords.some((m) => sameRoot(w, m)));
  });
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

  // 3. Besoins précis du mentoré couverts par les compétences du mentor
  const covered = coveredNeeds(mentee.needs ?? [], mentor);
  if (covered.length > 0) {
    score += Math.min(20, covered.length * 10);
    reasons.push(
      `Répond à ${covered.length > 1 ? "vos besoins" : "votre besoin"} : ${covered
        .slice(0, 3)
        .map((n) => `« ${n} »`)
        .join(", ")}`,
    );
  }

  // 4. Affinité avec la situation du mentoré
  if (mentee.menteeStatus) {
    const affinity = STATUS_AFFINITY[mentee.menteeStatus];
    if (mentor.domains.some((d) => affinity.slugs.includes(d.slug))) {
      score += 10;
      reasons.push(`Expertise adaptée ${affinity.label}`);
    }
  }

  // 5. Qualité : note moyenne (au-dessus de 3/5) et expérience
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

/**
 * Mot ↔ indice de domaine : même racine, et pour deux mots longs 6 lettres
 * communes (sinon « entreprise » et « entretien » se confondraient).
 */
function hintMatches(word: string, hint: string) {
  if (!sameRoot(word, hint)) return false;
  return word.length < 7 || hint.length < 7 || word.slice(0, 6) === hint.slice(0, 6);
}

/** Domaines évoqués dans un texte, avec les mots qui les ont déclenchés. */
export function inferDomainMatches(text: string): Map<string, string[]> {
  // Mots d'origine (accents conservés pour l'affichage), comparés sans accents
  const originals = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const matches = new Map<string, string[]>();
  const add = (slug: string, word: string) => {
    const list = matches.get(slug) ?? [];
    if (!list.includes(word)) list.push(word);
    matches.set(slug, list);
  };
  for (const original of originals) {
    const word = normalize(original);
    if (SHORT_HINTS[word]) add(SHORT_HINTS[word], original);
    if (word.length < 4) continue;
    for (const [slug, hints] of Object.entries(DOMAIN_HINTS)) {
      if (hints.some((hint) => hintMatches(word, hint))) add(slug, original);
    }
  }
  return matches;
}

export function inferDomainSlugs(text: string): string[] {
  return [...inferDomainMatches(text).keys()];
}

export type DomainAdvice = { slug: string; reason: string };

/**
 * Orientation d'un bénéficiaire (TDR §7.2 « orienter les bénéficiaires ») :
 * à partir d'une phrase libre et, s'il est connu, de son profil, propose les
 * domaines par lesquels commencer, chacun avec sa justification.
 * 1. Domaines évoqués dans la phrase (les plus cités d'abord)
 * 2. Puis domaines souvent utiles pour sa situation (étudiant, entrepreneur…)
 */
export function orientDomains(text: string, menteeStatus: MenteeStatus | null): DomainAdvice[] {
  const advice: DomainAdvice[] = [...inferDomainMatches(text)]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([slug, words]) => ({
      slug,
      reason: `Vous parlez de ${words
        .slice(0, 3)
        .map((w) => `« ${w} »`)
        .join(", ")}`,
    }));
  if (menteeStatus) {
    const affinity = STATUS_AFFINITY[menteeStatus];
    for (const slug of affinity.slugs) {
      if (!advice.some((a) => a.slug === slug)) {
        advice.push({ slug, reason: `Souvent utile ${affinity.label}` });
      }
    }
  }
  return advice;
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
