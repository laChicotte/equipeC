/**
 * Base de connaissances de l'assistant MentorConnect.
 *
 * Réponses rédigées à partir du fonctionnement RÉEL de l'application (aucune
 * promesse inventée). Fonctionne sans IA : la question est comparée aux mots-clés
 * de chaque fiche. Fichier sans dépendance d'exécution : utilisable côté client
 * comme côté serveur.
 */

export type AssistantLink = { label: string; href: string };
export type KnowledgeEntry = {
  id: string;
  /** Question telle qu'affichée dans les suggestions */
  question: string;
  /** Mots-clés (sans accents, minuscules) ; les racines suffisent (« mentor » couvre « mentors ») */
  keywords: string[];
  answer: string;
  links?: AssistantLink[];
};

export const KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: "trouver",
    question: "Comment trouver un mentor ?",
    keywords: ["trouver un mentor", "chercher un mentor", "quel mentor", "recherche", "decouvrir", "recommand", "compatib"],
    answer:
      "Ouvrez « Découvrir » : filtrez par domaine, cherchez par mot-clé, ou décrivez votre objectif en une phrase. Les mentors sont classés par compatibilité et chaque recommandation est expliquée. Depuis « Domaines », l'orientation intelligente vous conseille aussi par où commencer.",
    links: [
      { label: "Découvrir les mentors", href: "/mentors" },
      { label: "Orientation par domaine", href: "/domains" },
    ],
  },
  {
    id: "demande",
    question: "Comment envoyer une demande de mentorat ?",
    keywords: ["demande", "demander", "envoyer", "contacter", "accompagne", "postuler", "accepte", "refus"],
    answer:
      "Sur la fiche d'un mentor, choisissez le sujet, présentez-vous (20 caractères minimum) puis « Envoyer ma demande ». Le mentor accepte ou refuse ; vous suivez vos demandes dans « Mentorat ». Il faut un profil de mentoré complet : si on vous le demande, cliquez sur « Compléter mon profil ».",
    links: [
      { label: "Mes demandes", href: "/mentorships" },
      { label: "Compléter mon profil", href: "/onboarding" },
    ],
  },
  {
    id: "devenir-mentor",
    question: "Comment devenir mentor ?",
    keywords: ["devenir", "devenir mentor", "etre mentor", "transmettre", "benevol", "partager mon", "experience", "inscrire comme mentor"],
    answer:
      "Inscrivez-vous en choisissant « Transmettre », puis complétez votre profil : domaines d'expertise (3 au maximum), compétences, disponibilités. Le programme demande au moins 3 ans d'expérience professionnelle et l'acceptation de la charte du mentorat.",
    links: [
      { label: "Créer un compte mentor", href: "/signup?role=mentor" },
      { label: "Charte du mentorat", href: "/charte" },
    ],
  },
  {
    id: "visio",
    question: "Comment rejoindre une séance en visio ?",
    keywords: ["visio", "video", "camera", "micro", "appel", "rejoindre", "jitsi", "conference", "son"],
    answer:
      "Dans « Mentorat » ou « Rendez-vous », ouvrez la séance puis « Rejoindre la visio » (ou « Tester la visio » avant l'heure). Autorisez la caméra et le micro quand le navigateur le demande : l'appel passe directement entre vous deux, sans compte ni installation. Si le réseau bloque l'appel, un lien « salle de secours (Jitsi) » est proposé sous la vidéo.",
    links: [{ label: "Mes rendez-vous", href: "/sessions" }],
  },
  {
    id: "chat",
    question: "Comment échanger avec mon mentor ?",
    keywords: ["chat", "message", "discuter", "ecrire", "conversation", "echanger", "parler"],
    answer:
      "Une fois la demande acceptée, ouvrez le mentorat dans « Mentorat » : la discussion est en temps réel, et les messages arrivent même après une coupure de réseau.",
    links: [{ label: "Mes mentorats", href: "/mentorships" }],
  },
  {
    id: "seance",
    question: "Comment planifier une séance ?",
    keywords: ["planifier", "seance", "rendez", "rdv", "date", "horaire", "programmer", "reserver", "calendrier"],
    answer:
      "Dans l'espace d'un mentorat actif, utilisez le panneau « Séances » pour proposer une date, une heure et un sujet. La séance apparaît pour vous deux, avec son lien de visio, dans « Rendez-vous » et sur le tableau de bord.",
    links: [{ label: "Mes rendez-vous", href: "/sessions" }],
  },
  {
    id: "objectifs",
    question: "Comment suivre mes objectifs ?",
    keywords: ["objectif", "progression", "progres", "etape", "suivi", "avancer", "parcours"],
    answer:
      "« Mes objectifs » regroupe les étapes fixées avec votre mentor (À faire, En cours, Fait) et la progression de chaque parcours. Le tableau de bord affiche votre prochaine étape.",
    links: [{ label: "Mes objectifs", href: "/goals" }],
  },
  {
    id: "evaluation",
    question: "Comment évaluer une séance ?",
    keywords: ["evaluer", "evaluation", "note", "avis", "etoile", "noter"],
    answer:
      "Après une séance passée, une note sur 5 et un commentaire vous sont proposés dans la liste des séances. Les notes forment la moyenne publique du mentor.",
    links: [{ label: "Mes rendez-vous", href: "/sessions" }],
  },
  {
    id: "ressources",
    question: "Où trouver des ressources ?",
    keywords: ["ressource", "bibliotheque", "guide", "lecture", "livre", "conseil", "document", "lire"],
    answer:
      "La « Bibliothèque » réunit les guides, lectures, outils et conseils partagés par les mentors, classés par domaine et par type.",
    links: [{ label: "Bibliothèque", href: "/resources" }],
  },
  {
    id: "ateliers",
    question: "Que sont les ateliers ?",
    keywords: ["atelier", "evenement", "collectif", "groupe", "workshop", "inscrire atelier"],
    answer:
      "Les ateliers sont des séances thématiques collectives animées par des mentors, à places limitées. Inscrivez-vous depuis « Ateliers » ; le lien de visio est accessible aux inscrits.",
    links: [{ label: "Ateliers", href: "/workshops" }],
  },
  {
    id: "opportunites",
    question: "Où voir les opportunités ?",
    keywords: ["opportunite", "stage", "emploi", "travail", "bourse", "financement", "offre", "job"],
    answer:
      "« Opportunités » rassemble les stages, emplois, bourses, financements et appels à projets partagés par la communauté, avec leur date limite.",
    links: [{ label: "Opportunités", href: "/opportunities" }],
  },
  {
    id: "campus-france",
    question: "Que couvre l'accompagnement Campus France ?",
    keywords: ["campus", "france", "visa", "etudes", "master", "licence", "admission", "dossier", "etranger"],
    answer:
      "Des mentors vous aident à choisir vos formations, construire votre projet d'études, préparer votre dossier, votre CV, votre lettre de motivation et l'entretien Campus France. Important : cet accompagnement relève du conseil et du partage d'expériences ; il ne garantit ni l'admission dans un établissement, ni l'obtention d'un visa.",
    links: [{ label: "Mentors Campus France", href: "/mentors?domain=campus-france" }],
  },
  {
    id: "domaines",
    question: "Quels sont les domaines proposés ?",
    keywords: ["domaine", "secteur", "expertise", "theme", "categorie"],
    answer:
      "Sept domaines : entrepreneuriat et gestion d'entreprise ; numérique et technologies ; orientation et insertion professionnelle ; culture, littérature et industries créatives ; gestion, finance et administration ; développement personnel et leadership ; accompagnement Campus France.",
    links: [{ label: "Voir les domaines", href: "/domains" }],
  },
  {
    id: "mot-de-passe",
    question: "J'ai oublié mon mot de passe",
    keywords: ["mot de passe", "oublie", "connexion", "connecter", "reinitialiser", "acces", "login"],
    answer:
      "Sur la page de connexion, cliquez sur « Mot de passe oublié ? » et indiquez votre e-mail : vous recevez un lien pour en choisir un nouveau. Vous pouvez aussi vous connecter avec Google ou GitHub.",
    links: [
      { label: "Mot de passe oublié", href: "/forgot-password" },
      { label: "Se connecter", href: "/login" },
    ],
  },
  {
    id: "profil",
    question: "Comment modifier mon profil ?",
    keywords: ["profil", "photo", "modifier", "role", "mode", "double", "compte", "informations"],
    answer:
      "« Mon profil » permet de changer votre photo, vos informations, vos domaines et vos objectifs. Une même personne peut être mentor ET mentorée : quand les deux profils sont complets, un bouton en bas du menu permet de changer de mode.",
    links: [{ label: "Mon profil", href: "/profile" }],
  },
  {
    id: "gratuit",
    question: "MentorConnect est-il gratuit ?",
    keywords: ["gratuit", "prix", "pay", "cout", "tarif", "argent", "abonnement", "frais", "combien"],
    answer: "Oui, MentorConnect est gratuit pour les jeunes accompagnés comme pour les mentors bénévoles.",
  },
  {
    id: "securite",
    question: "Mes données sont-elles protégées ?",
    keywords: ["securite", "donnees", "prive", "confidentiel", "protection", "visible", "voit"],
    answer:
      "Un profil de mentoré n'est visible que par ses propres mentors. Les règles d'accès sont appliquées par la base de données elle-même et vérifiées par des tests automatisés. Les échanges et la visio restent dans l'application, dans le cadre de la charte du mentorat.",
    links: [{ label: "Charte du mentorat", href: "/charte" }],
  },
  {
    id: "application",
    question: "Puis-je installer l'application sur mon téléphone ?",
    keywords: ["installer", "application", "telephone", "mobile", "ecran d'accueil", "android", "iphone", "app"],
    answer:
      "Oui. Ouvrez le site dans le navigateur de votre téléphone, puis « Ajouter à l'écran d'accueil » (menu ⋮ sur Android, bouton Partager sur iPhone). MentorConnect s'ouvre alors en plein écran, comme une application.",
  },
];

/** Suggestions affichées à l'ouverture */
export const STARTER_QUESTIONS = ["trouver", "demande", "visio", "devenir-mentor"].map(
  (id) => KNOWLEDGE.find((k) => k.id === id)!.question,
);

/** Minuscules, sans accents. */
export function normalize(text: string) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export type KnowledgeMatch = { entry: KnowledgeEntry; score: number };

/**
 * Fiches les plus proches de la question. Score = mots-clés retrouvés
 * (une expression de plusieurs mots compte double).
 */
export function searchKnowledge(question: string, limit = 3): KnowledgeMatch[] {
  const q = ` ${normalize(question).replace(/[^a-z0-9' ]+/g, " ")} `;
  return KNOWLEDGE.map((entry) => {
    let score = 0;
    for (const k of entry.keywords) {
      if (k.includes(" ") ? q.includes(` ${k}`) : new RegExp(`\\b${k}`).test(q)) score += k.includes(" ") ? 2 : 1;
    }
    // Question identique à une suggestion : correspondance certaine
    if (normalize(entry.question) === normalize(question).trim()) score += 10;
    return { entry, score };
  })
    .filter((m) => m.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
