// =============================================================================
// Données de démonstration MentorConnect
// Usage : npm run seed
//
// 1. Supprime TOUS les comptes dont l'email se termine par @example.com
//    (comptes de test des scripts + anciens comptes de démo). Les comptes
//    créés avec une vraie adresse email ne sont JAMAIS touchés.
// 2. Recrée des mentors et mentorés fictifs avec une histoire réaliste :
//    messages, séances (passées et à venir), évaluations, objectifs.
//
// Nécessite dans .env.local : SUPABASE_SECRET_KEY et DEMO_PASSWORD.
// La clé secrète contourne la sécurité RLS : ce script ne s'exécute qu'en local.
// Toutes les personnes et organisations sont FICTIVES.
// =============================================================================
import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY?.trim();
const PASSWORD = process.env.DEMO_PASSWORD ?? "";

if (!SECRET || SECRET.startsWith("sb_publishable_")) {
  console.error("⛔ SUPABASE_SECRET_KEY manquante ou invalide dans .env.local (voir .env.example).");
  process.exit(1);
}
if (PASSWORD.length < 12) {
  console.error("⛔ DEMO_PASSWORD manquant ou trop court (12 caractères minimum) dans .env.local.");
  process.exit(1);
}

const admin = createClient(URL_, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });
const DEMO_DOMAIN = "@example.com";

// --- Personnages --------------------------------------------------------------
const MENTORS = [
  {
    key: "fatoumata", email: "fatoumata.demo", full_name: "Fatoumata Binta Diallo",
    headline: "J'ai fait mes études en France grâce à Campus France : je vous aide à réussir les vôtres",
    job_title: "Conseillère en orientation internationale", organization: "Cabinet d'orientation à Conakry",
    years_experience: 11, city: "Conakry", availability: "Mardi et jeudi soir, samedi matin",
    bio: "Diplômée d'un master en ingénierie informatique à Lyon, j'ai accompagné plus de 80 étudiants guinéens dans leur projet d'études en France : choix des formations, lettre de motivation, préparation de l'entretien Campus France.",
    domains: ["campus-france", "orientation-insertion"],
  },
  {
    key: "thierno", email: "thierno.demo", full_name: "Thierno Madiou Diallo",
    headline: "Docteur en économie, ancien étudiant à Paris",
    job_title: "Enseignant-chercheur en économie", organization: "Université (fictive) de Conakry",
    years_experience: 10, city: "Conakry", availability: "Le week-end",
    bio: "Après une licence à Conakry et un doctorat en France, j'enseigne l'économie. J'aide les étudiants à construire un projet d'études cohérent et à valoriser leur parcours académique.",
    domains: ["campus-france", "gestion-finance"],
  },
  {
    key: "mamadou", email: "mamadou.demo", full_name: "Mamadou Saliou Bah",
    headline: "Entrepreneur agritech : de l'idée au premier client",
    job_title: "Fondateur d'une startup agritech", organization: "Startup de transformation agricole",
    years_experience: 9, city: "Kindia", availability: "Mercredi soir",
    bio: "J'ai créé une entreprise de transformation de fruits locaux qui emploie aujourd'hui 25 personnes. Je partage ce que j'ai appris : business model, premiers clients, recherche de financement.",
    domains: ["entrepreneuriat", "gestion-finance"],
  },
  {
    key: "alpha", email: "alpha.demo", full_name: "Alpha Oumar Sow",
    headline: "Expert-comptable : structurer et financer votre projet",
    job_title: "Expert-comptable", organization: "Cabinet comptable indépendant",
    years_experience: 15, city: "Conakry", availability: "Lundi et vendredi en fin de journée",
    bio: "J'accompagne les petites entreprises et les porteurs de projet : statut juridique, plan de financement, gestion de trésorerie et dossiers de demande de financement.",
    domains: ["gestion-finance", "entrepreneuriat"],
  },
  {
    key: "kadiatou", email: "kadiatou.demo", full_name: "Kadiatou Camara",
    headline: "Développeuse senior : se lancer dans les métiers du numérique",
    job_title: "Ingénieure logiciel senior", organization: "Entreprise de services numériques",
    years_experience: 8, city: "Conakry", availability: "Mardi soir, en visio",
    bio: "Développeuse web et mobile depuis 8 ans, j'aide les jeunes à choisir une spécialité, construire un portfolio et décrocher un premier stage dans la tech.",
    domains: ["numerique"],
  },
  {
    key: "aminata", email: "aminata.demo", full_name: "Aminata Keïta",
    headline: "Cybersécurité : un métier d'avenir, accessible",
    job_title: "Consultante en cybersécurité", organization: "Cabinet de conseil en sécurité",
    years_experience: 7, city: "Conakry", availability: "Jeudi soir",
    bio: "Je sensibilise les entreprises aux risques numériques et forme de jeunes analystes. Certifications, premiers pas, ressources gratuites : je vous oriente.",
    domains: ["numerique"],
  },
  {
    key: "mariama", email: "mariama.demo", full_name: "Mariama Condé",
    headline: "Responsable RH : CV, entretiens et premiers pas en entreprise",
    job_title: "Responsable des ressources humaines", organization: "Groupe industriel",
    years_experience: 12, city: "Conakry", availability: "Mercredi midi",
    bio: "Je recrute depuis 12 ans. Je vous aide à rédiger un CV qui se démarque, à préparer vos entretiens et à réussir votre intégration.",
    domains: ["orientation-insertion", "developpement-personnel"],
  },
  {
    key: "oumar", email: "oumar.demo", full_name: "Oumar Barry",
    headline: "Prise de parole et leadership : gagner en confiance",
    job_title: "Coach en leadership", organization: "Indépendant",
    years_experience: 14, city: "Labé", availability: "Samedi après-midi",
    bio: "Ancien manager devenu coach, j'accompagne les jeunes leaders : prise de parole en public, gestion du temps, conduite d'équipe.",
    domains: ["developpement-personnel"],
  },
  {
    key: "ibrahima_sory", email: "ibrahimasory.demo", full_name: "Ibrahima Sory Touré",
    headline: "Éditeur jeunesse : écrire, publier, vivre de sa plume",
    job_title: "Éditeur et auteur jeunesse", organization: "Maison d'édition indépendante",
    years_experience: 18, city: "Conakry", availability: "Mardi après-midi",
    bio: "Auteur de livres pour enfants et éditeur, je conseille les jeunes auteurs : écriture, recherche d'éditeur, métiers du livre et entrepreneuriat culturel.",
    domains: ["culture-creation", "entrepreneuriat"],
  },
  {
    key: "hawa", email: "hawa.demo", full_name: "Hawa Soumah",
    headline: "Création de contenu et marketing digital",
    job_title: "Productrice audiovisuelle", organization: "Studio de production",
    years_experience: 6, city: "Conakry", availability: "Vendredi soir",
    bio: "Vidéaste et créatrice de contenu, j'aide les jeunes créateurs et les entreprises à raconter leur histoire sur les réseaux sociaux.",
    domains: ["culture-creation", "numerique"],
  },
];

const MENTEES = [
  {
    key: "aissatou", email: "aissatou.demo", full_name: "Aïssatou Baldé",
    headline: "Étudiante en L3 informatique", city: "Conakry", mentee_status: "etudiant",
    goals_summary: "Préparer mon dossier Campus France pour un master en informatique ou en data en France.",
    bio: "Passionnée de données et d'intelligence artificielle, je termine ma licence et je veux poursuivre en master.",
    domains: ["campus-france", "numerique"],
  },
  {
    key: "ibrahima", email: "ibrahima.demo", full_name: "Ibrahima Kaba",
    headline: "Porteur d'un projet de transformation de mangues", city: "Kindia", mentee_status: "porteur_projet",
    goals_summary: "Structurer mon projet de séchage de mangues, trouver un financement et mes premiers clients.",
    bio: "Fils d'agriculteurs, je veux valoriser les mangues de Kindia qui se perdent chaque saison.",
    domains: ["entrepreneuriat", "gestion-finance"],
  },
  {
    key: "nene", email: "nene.demo", full_name: "Néné Oumou Sylla",
    headline: "Jeune diplômée en gestion", city: "Conakry", mentee_status: "jeune_diplome",
    goals_summary: "Trouver mon premier emploi en gestion et réussir mes entretiens d'embauche.",
    bio: "Diplômée en gestion des entreprises, je cherche mon premier poste et je veux gagner en confiance à l'oral.",
    domains: ["orientation-insertion", "developpement-personnel"],
  },
];

// Compétences précises (mentors) et besoins précis (mentorés) — migration 0004.
// Le moteur de recommandation rapproche les besoins des compétences.
const SKILLS = {
  fatoumata: ["Dossier Campus France", "Lettre de motivation", "Préparation d'entretien", "Choix de formation"],
  thierno: ["Projet d'études", "Lettre de motivation", "Économie"],
  mamadou: ["Business plan", "Premiers clients", "Recherche de financement", "Agritech"],
  alpha: ["Comptabilité", "Business plan", "Recherche de financement", "Fiscalité"],
  kadiatou: ["Développement web", "Data", "Entretien technique"],
  aminata: ["Cybersécurité", "Reconversion vers la tech"],
  mariama: ["CV", "Préparation d'entretien", "Recherche d'emploi"],
  oumar: ["Prise de parole", "Confiance en soi", "Leadership"],
  ibrahima_sory: ["Écriture", "Édition", "Autoédition"],
  hawa: ["Production vidéo", "Création de contenu", "Montage"],
  aissatou: ["Dossier Campus France", "Lettre de motivation", "Data"],
  ibrahima: ["Business plan", "Recherche de financement", "Premiers clients"],
  nene: ["CV", "Préparation d'entretien", "Prise de parole"],
};
for (const person of [...MENTORS, ...MENTEES]) person.skills = SKILLS[person.key] ?? [];

// --- Outils -------------------------------------------------------------------
const DAY = 86_400_000;
/** Date à J+offset (jours), à l'heure de Conakry (= UTC) donnée. */
const at = (dayOffset, hour, minute = 0) => {
  const d = new Date(Date.now() + dayOffset * DAY);
  d.setUTCHours(hour, minute, 0, 0);
  return d.toISOString();
};
const dateOnly = (dayOffset) => new Date(Date.now() + dayOffset * DAY).toISOString().slice(0, 10);

function must(result, what) {
  if (result.error) throw new Error(`${what} : ${result.error.message}`);
  return result.data;
}

async function cleanup() {
  let removed = 0;
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`Lecture des comptes : ${error.message}`);
    const targets = data.users.filter((u) => u.email?.toLowerCase().endsWith(DEMO_DOMAIN));
    for (const u of targets) {
      const { error: e } = await admin.auth.admin.deleteUser(u.id);
      if (e) throw new Error(`Suppression de ${u.email} : ${e.message}`);
      removed++;
    }
    if (data.users.length < 1000) break;
    // Des comptes ont été supprimés : on relit la même page
    if (targets.length) page--;
  }
  return removed;
}

async function createPerson(person, role, domainIds) {
  const created = must(
    await admin.auth.admin.createUser({
      email: `${person.email}${DEMO_DOMAIN}`,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: person.full_name, role },
    }),
    `Création de ${person.full_name}`,
  );
  const id = created.user.id;
  // Le trigger SQL a créé le profil : on le complète
  const PROFILE_FIELDS = [
    "full_name", "headline", "bio", "city", "job_title", "organization",
    "years_experience", "availability", "mentee_status", "goals_summary", "skills",
  ];
  const fields = Object.fromEntries(PROFILE_FIELDS.filter((f) => f in person).map((f) => [f, person[f]]));
  const { domains } = person;
  must(
    await admin.from("profiles").update({ ...fields, onboarded: true, is_available: true }).eq("id", id),
    `Profil de ${person.full_name}`,
  );
  must(
    await admin.from("profile_domains").insert(domains.map((slug) => ({ profile_id: id, domain_id: domainIds[slug] }))),
    `Domaines de ${person.full_name}`,
  );
  return id;
}

async function mentorship(mentor, mentee, domainId, message, status, createdDaysAgo) {
  return must(
    await admin
      .from("mentorships")
      .insert({
        mentor_id: mentor, mentee_id: mentee, domain_id: domainId, message, status,
        created_at: at(-createdDaysAgo, 9),
        responded_at: status === "pending" ? null : at(-createdDaysAgo + 1, 10),
      })
      .select("id")
      .single(),
    "Création d'un mentorat",
  ).id;
}

// --- Exécution ----------------------------------------------------------------
console.log("1/4 Nettoyage des comptes @example.com…");
console.log(`    ${await cleanup()} compte(s) supprimé(s)`);

console.log("2/4 Création des mentors et mentorés…");
const domainRows = must(await admin.from("domains").select("id, slug"), "Lecture des domaines");
const D = Object.fromEntries(domainRows.map((d) => [d.slug, d.id]));
const id = {};
for (const m of MENTORS) id[m.key] = await createPerson(m, "mentor", D);
for (const m of MENTEES) id[m.key] = await createPerson(m, "mentee", D);
console.log(`    ${MENTORS.length} mentors, ${MENTEES.length} mentorés`);

console.log("3/4 Création des histoires de mentorat…");
// Aïssatou ↔ Fatoumata : mentorat actif complet (la démo principale)
const msAissatou = await mentorship(id.fatoumata, id.aissatou, D["campus-france"],
  "Bonjour Madame Diallo, je suis en L3 informatique et je souhaite candidater en master en France l'année prochaine. Votre parcours à Lyon m'inspire beaucoup : accepteriez-vous de m'accompagner ?",
  "accepted", 12);
must(await admin.from("messages").insert([
  [id.fatoumata, "Bonjour Aïssatou, avec plaisir ! Pour commencer, quelles formations avez-vous repérées ?", -11, 10],
  [id.aissatou, "Merci beaucoup ! J'hésite entre un master data science à Lyon et un master IA à Grenoble.", -11, 11],
  [id.fatoumata, "Les deux sont cohérents avec votre licence. Faisons une première séance pour construire votre projet d'études.", -11, 12],
  [id.aissatou, "J'ai retravaillé ma lettre de motivation après notre séance, je vous l'envoie ici.", -2, 20],
  [id.fatoumata, "C'est beaucoup plus clair ! Ajoutez votre projet de fin d'études en exemple concret.", -1, 9],
  [id.aissatou, "C'est fait. Est-ce qu'on peut préparer l'entretien Campus France à la prochaine séance ?", -1, 18],
  [id.fatoumata, "Bien sûr, je vous ai planifié une séance demain à 18 h. Préparez une présentation de 2 minutes.", 0, -1],
].map(([sender, content, d, h]) => ({
  mentorship_id: msAissatou, sender_id: sender, content,
  created_at: h < 0 ? new Date(Date.now() - 30 * 60_000).toISOString() : at(d, h, 15),
}))), "Messages");
const pastSession = must(await admin.from("sessions").insert({
  mentorship_id: msAissatou, scheduled_at: at(-8, 18), duration_min: 60, created_by: id.fatoumata,
  topic: "Construire le projet d'études", created_at: at(-10, 12),
}).select("id").single(), "Séance passée").id;
must(await admin.from("sessions").insert({
  mentorship_id: msAissatou, scheduled_at: at(1, 18), duration_min: 60, created_by: id.fatoumata,
  topic: "Simulation d'entretien Campus France",
}), "Séance à venir");
must(await admin.from("session_reviews").insert([
  { session_id: pastSession, reviewer_id: id.aissatou, rating: 5, comment: "Très claire et bienveillante, j'ai enfin un projet cohérent !" },
  { session_id: pastSession, reviewer_id: id.fatoumata, rating: 5, comment: "Aïssatou était très bien préparée." },
]), "Évaluations");
must(await admin.from("goals").insert([
  { mentorship_id: msAissatou, title: "Choisir 3 formations cibles", status: "done" },
  { mentorship_id: msAissatou, title: "Rédiger la lettre de motivation", status: "done" },
  { mentorship_id: msAissatou, title: "Préparer l'entretien Campus France", status: "in_progress", due_date: dateOnly(7) },
  { mentorship_id: msAissatou, title: "Déposer le dossier sur la plateforme Études en France", status: "todo", due_date: dateOnly(21) },
]), "Objectifs");

// Néné → Fatoumata : demande EN ATTENTE (le mentor l'accepte en direct pendant la démo)
await mentorship(id.fatoumata, id.nene, D["orientation-insertion"],
  "Bonjour, je viens d'obtenir mon diplôme en gestion et je me sens perdue pour mes premières candidatures. Pourriez-vous m'aider à préparer mes entretiens ?",
  "pending", 1);

// Ibrahima : mentorat actif avec Alpha (noté) + demande en attente vers Mamadou
const msIbrahima = await mentorship(id.alpha, id.ibrahima, D["gestion-finance"],
  "Bonjour, j'ai un projet de séchage de mangues à Kindia et j'ai besoin d'aide pour mon plan de financement.",
  "accepted", 20);
const s2 = must(await admin.from("sessions").insert({
  mentorship_id: msIbrahima, scheduled_at: at(-14, 17), duration_min: 90, created_by: id.alpha, topic: "Plan de financement",
}).select("id").single(), "Séance Ibrahima").id;
must(await admin.from("session_reviews").insert({ session_id: s2, reviewer_id: id.ibrahima, rating: 4, comment: "Des conseils très concrets." }), "Évaluation Ibrahima");
must(await admin.from("goals").insert([
  { mentorship_id: msIbrahima, title: "Choisir le statut juridique", status: "done" },
  { mentorship_id: msIbrahima, title: "Établir le budget de démarrage", status: "in_progress", due_date: dateOnly(10) },
]), "Objectifs Ibrahima");
await mentorship(id.mamadou, id.ibrahima, D["entrepreneuriat"],
  "Bonjour Monsieur Bah, votre parcours dans la transformation agricole est exactement ce que je vise. J'aimerais votre avis sur mon business model.",
  "pending", 2);

// Néné ↔ Mariama : mentorat terminé et bien noté (historique crédible)
const msNene = await mentorship(id.mariama, id.nene, D["orientation-insertion"],
  "Bonjour, pouvez-vous m'aider à améliorer mon CV ?", "accepted", 30);
const s3 = must(await admin.from("sessions").insert({
  mentorship_id: msNene, scheduled_at: at(-25, 12), duration_min: 45, created_by: id.mariama, topic: "Relecture du CV",
}).select("id").single(), "Séance Néné").id;
must(await admin.from("session_reviews").insert({ session_id: s3, reviewer_id: id.nene, rating: 5, comment: "Mon CV est méconnaissable, merci !" }), "Évaluation Néné");
must(await admin.from("mentorships").update({ status: "ended" }).eq("id", msNene), "Fin du mentorat de Néné");

console.log("3b/4 Ressources et opportunités…");
const resources = [
  [id.fatoumata, "campus-france", "guide", "Les grandes étapes de la procédure Études en France",
    "Création du compte, choix des formations, saisie du dossier, entretien, réponses des établissements : le calendrier complet expliqué, et les erreurs que je vois le plus souvent.",
    "https://www.campusfrance.org/fr"],
  [id.mariama, "orientation-insertion", "modele", "Structure d'un CV efficace en une page",
    "Titre clair, compétences en haut, expériences avec résultats chiffrés, formations, langues. Évitez la photo de vacances et les CV de 3 pages : un recruteur y passe moins d'une minute.", null],
  [id.kadiatou, "numerique", "formation", "Apprendre le développement web gratuitement",
    "Un parcours complet et gratuit (HTML, CSS, JavaScript) avec certifications. Conseil : un petit projet publié vaut mieux que dix tutoriels terminés.",
    "https://www.freecodecamp.org"],
  [id.aminata, "numerique", "formation", "Se former aux bases de la cybersécurité",
    "Un MOOC public et gratuit pour comprendre les risques numériques et les bons réflexes. Idéal avant de viser une certification.",
    "https://secnumacademie.gouv.fr"],
  [id.alpha, "gestion-finance", "outil", "Plan de financement sur 3 ans : la méthode",
    "Listez vos besoins (équipement, stock, fonds de roulement) face à vos ressources (apport, prêts, subventions). Les deux colonnes doivent être égales chaque année.", null],
  [id.oumar, "developpement-personnel", "guide", "Préparer un pitch de 2 minutes",
    "Problème, solution, preuve, demande. Répétez à voix haute 10 fois, chronomètre en main, et filmez-vous une fois : c'est inconfortable mais très efficace.", null],
  [id.ibrahima_sory, "culture-creation", "article", "Publier son premier livre jeunesse",
    "Lisez ce que publie l'éditeur visé, envoyez un manuscrit terminé et relu, soignez la lettre d'accompagnement. Et rejoignez un atelier d'écriture pour avancer en groupe.", null],
].map(([author_id, slug, kind, title, description, url], i) => ({
  author_id, domain_id: D[slug], kind, title, description, url, created_at: at(-i - 1, 10),
}));
const opportunities = [
  [id.kadiatou, "stage", "Stage développeur web (6 mois)", "Entreprise de services numériques (exemple)", "Conakry",
    "Stage de fin d'études : développement d'applications web avec React. Profil : L3 ou master en informatique, curiosité et rigueur.", 20],
  [id.mamadou, "financement", "Appel à projets : jeunes entrepreneurs agricoles", "Programme d'appui (exemple)", "Kindia",
    "Subvention et accompagnement pour des projets de transformation agricole portés par des moins de 35 ans. Dossier : présentation du projet et budget prévisionnel.", 5],
  [id.thierno, "bourse", "Bourse d'excellence pour un master (exemple)", "Fondation partenaire (exemple)", "France",
    "Bourse couvrant les frais de scolarité pour des étudiants admis en master. Critères : résultats académiques et projet professionnel.", 30],
  [id.mariama, "atelier", "Atelier « Réussir son entretien d'embauche »", "MentorConnect", "Conakry",
    "Atelier gratuit de 2 heures : simulations d'entretien en petits groupes et retours personnalisés.", 3],
  [id.ibrahima, "emploi", "Recrutement d'agents de tri saisonniers", "Coopérative de mangues (exemple)", "Kindia",
    "Recrutement pour la saison des mangues : tri et conditionnement. Partagé par un mentoré de la plateforme.", 12],
].map(([author_id, kind, title, organization, location, description, inDays], i) => ({
  author_id, kind, title, organization, location, description, deadline: dateOnly(inDays), created_at: at(-i, 8),
}));
const r1 = await admin.from("resources").insert(resources);
if (r1.error?.code === "PGRST205" || r1.error?.code === "42P01") {
  console.log("    ⚠️ Tables absentes : exécutez supabase/migrations/0002_resources_opportunities.sql puis relancez npm run seed");
} else {
  must(r1, "Ressources");
  must(await admin.from("opportunities").insert(opportunities), "Opportunités");
  console.log(`    ${resources.length} ressources, ${opportunities.length} opportunités`);
}

console.log("4/4 Vérification…");
const { count } = await admin.from("profiles").select("id", { count: "exact", head: true }).eq("role", "mentor").eq("is_available", true);
console.log(`    ${count} mentor(s) disponible(s) dans le catalogue`);

console.log(`
🎉 Données de démo prêtes. Comptes (mot de passe = DEMO_PASSWORD de .env.local) :
   Mentorée : ${MENTEES[0].email}${DEMO_DOMAIN}    (Aïssatou : mentorat actif complet)
   Mentore  : ${MENTORS[0].email}${DEMO_DOMAIN}   (Fatoumata : 1 demande à accepter en direct)
   Mentoré  : ${MENTEES[1].email}${DEMO_DOMAIN}    (Ibrahima : porteur de projet)
   Mentorée : ${MENTEES[2].email}${DEMO_DOMAIN}        (Néné : jeune diplômée)
   Autres mentors : <prénom>.demo${DEMO_DOMAIN}`);
