// Tests unitaires du score de recommandation (src/features/mentors/matching.ts).
// Lancement : npm test   (lanceur de tests intégré à Node, aucune dépendance)
import { test } from "node:test";
import assert from "node:assert/strict";
import { coveredNeeds, inferDomainSlugs, orientDomains, keywords, recommendMentors, scoreMentor } from "../src/features/mentors/matching.ts";

test("recherche intelligente : « valider mon idée de fintech »", () => {
  const slugs = inferDomainSlugs("Je souhaite valider mon idée de fintech");
  assert.ok(slugs.includes("entrepreneuriat"), slugs.join(","));
  assert.ok(slugs.includes("numerique"), slugs.join(","));
});

test("recherche intelligente : Campus France et CV", () => {
  assert.deepEqual(inferDomainSlugs("préparer mon dossier Campus France").sort(), ["campus-france"]);
  assert.ok(inferDomainSlugs("améliorer mon CV").includes("orientation-insertion"));
});

test("recherche intelligente : phrase sans rapport → aucun domaine", () => {
  assert.deepEqual(inferDomainSlugs("bonjour à tous"), []);
});

const D = {
  entrepreneuriat: { id: 1, slug: "entrepreneuriat", name: "Entrepreneuriat et gestion d'entreprise" },
  numerique: { id: 2, slug: "numerique", name: "Numérique et technologies" },
  orientation: { id: 3, slug: "orientation-insertion", name: "Orientation et insertion professionnelle" },
  finance: { id: 5, slug: "gestion-finance", name: "Gestion, finance et administration" },
  campus: { id: 7, slug: "campus-france", name: "Accompagnement Campus France" },
};

const mentor = (id, domains, text = "", extra = {}) => ({
  id, domains, text, yearsExperience: null, rating: null, ...extra,
});

const aissatou = {
  domainIds: [D.campus.id],
  menteeStatus: "etudiant",
  text: "Je souhaite préparer mon dossier Campus France pour un master en informatique.",
};

test("keywords : sans accents, sans mots courants ni mots courts", () => {
  assert.deepEqual(keywords("Préparer mon dossier pour la FRANCE"), ["preparer", "dossier", "france"]);
});

test("un domaine en commun rapporte 40 points et une raison", () => {
  const r = scoreMentor({ domainIds: [1], menteeStatus: null, text: "" }, mentor("m", [D.entrepreneuriat]));
  assert.equal(r.score, 40);
  assert.match(r.reasons[0], /Domaine en commun : Entrepreneuriat/);
});

test("plusieurs domaines en commun : 40 + 10 par domaine supplémentaire", () => {
  const r = scoreMentor({ domainIds: [1, 5], menteeStatus: null, text: "" }, mentor("m", [D.entrepreneuriat, D.finance]));
  assert.equal(r.score, 50);
  assert.match(r.reasons[0], /^Domaines en commun/);
});

test("les mots-clés des objectifs sont reconnus (même racine)", () => {
  const r = scoreMentor(
    { domainIds: [], menteeStatus: null, text: "Je veux devenir entrepreneur dans l'agriculture" },
    mentor("m", [D.entrepreneuriat], "Fondatrice d'une coopérative agricole"),
  );
  assert.ok(r.reasons.some((x) => x.includes("« entrepreneur »") && x.includes("« agriculture »")), r.reasons.join(" | "));
});

test("affinité avec la situation : un étudiant et un mentor Campus France", () => {
  const r = scoreMentor({ domainIds: [], menteeStatus: "etudiant", text: "" }, mentor("m", [D.campus]));
  assert.equal(r.score, 10);
  assert.deepEqual(r.reasons, ["Expertise adaptée aux étudiants"]);
});

test("le mentor le plus pertinent arrive en premier, les autres sont filtrés", () => {
  const mentors = [
    mentor("dev", [D.numerique], "Développeur web"),
    mentor("campus", [D.campus, D.orientation], "Ancienne étudiante en master informatique en France", { yearsExperience: 12, rating: { avg: 4.8, count: 6 } }),
    mentor("orient", [D.orientation], "Conseillère d'orientation"),
  ];
  const recos = recommendMentors(aissatou, mentors);
  assert.equal(recos[0].mentorId, "campus");
  assert.ok(recos[0].score >= 70, `score ${recos[0].score}`);
  assert.ok(recos[0].reasons.some((x) => x.startsWith("Très bien noté")));
  assert.ok(!recos.some((r) => r.mentorId === "dev"), "le développeur web n'est pas pertinent");
});

test("le score ne dépasse jamais 100", () => {
  const many = Object.values(D);
  const r = scoreMentor(
    { domainIds: many.map((d) => d.id), menteeStatus: "entrepreneur", text: "entrepreneuriat finance gestion numerique orientation campus france" },
    mentor("m", many, "entrepreneuriat finance gestion numerique orientation campus france", { yearsExperience: 40, rating: { avg: 5, count: 10 } }),
  );
  assert.equal(r.score, 100);
});

test("une note médiocre n'ajoute aucun point", () => {
  const base = scoreMentor({ domainIds: [1], menteeStatus: null, text: "" }, mentor("m", [D.entrepreneuriat]));
  const bad = scoreMentor({ domainIds: [1], menteeStatus: null, text: "" }, mentor("m", [D.entrepreneuriat], "", { rating: { avg: 2, count: 3 } }));
  assert.equal(bad.score, base.score);
});

test("besoins précis : couverts par les compétences du mentor (+10 par besoin)", () => {
  const needs = ["Business plan", "Recherche de financement", "Lettre de motivation"];
  const m = mentor("m", [], "", { skills: ["Business plan", "Recherche de financement"] });
  assert.deepEqual(coveredNeeds(needs, m), ["Business plan", "Recherche de financement"]);
  const r = scoreMentor({ domainIds: [], menteeStatus: null, text: "", needs }, m);
  assert.equal(r.score, 20);
  assert.match(r.reasons.at(-1), /^Répond à vos besoins : « Business plan », « Recherche de financement »/);
});

test("besoins précis : un besoin court (« CV ») est cherché mot pour mot", () => {
  assert.deepEqual(coveredNeeds(["CV"], mentor("rh", [], "", { skills: ["CV", "Recrutement"] })), ["CV"]);
  assert.deepEqual(coveredNeeds(["CV"], mentor("dev", [], "Développeur web chevronné")), []);
});

test("besoins précis : tous les mots du besoin doivent être présents", () => {
  // « Lettre de motivation » ne correspond pas à un mentor qui parle seulement de « motivation »
  assert.deepEqual(coveredNeeds(["Lettre de motivation"], mentor("coach", [], "Coach en motivation")), []);
});

test("besoins précis : départage deux mentors du même domaine", () => {
  const ibrahima = {
    domainIds: [D.entrepreneuriat.id],
    menteeStatus: null,
    text: "",
    needs: ["Business plan", "Recherche de financement"],
  };
  const recos = recommendMentors(ibrahima, [
    mentor("auteur", [D.entrepreneuriat], "Éditeur indépendant", { skills: ["Écriture"] }),
    mentor("agritech", [D.entrepreneuriat], "Fondateur d'une startup", { skills: ["Business plan", "Recherche de financement"] }),
  ]);
  assert.equal(recos[0].mentorId, "agritech");
  assert.ok(recos[0].score > recos[1].score);
});

test("orientation : domaines évoqués d'abord, avec les mots déclencheurs (accents conservés)", () => {
  const advice = orientDomains("Je veux lancer mon idée de fintech et trouver un financement", null);
  assert.ok(advice.length >= 2);
  assert.equal(advice[0].slug, "entrepreneuriat");
  assert.match(advice[0].reason, /« idée »/);
  assert.ok(advice.some((a) => a.slug === "gestion-finance" && a.reason.includes("« financement »")));
});

test("orientation : la situation complète les domaines évoqués, sans doublon", () => {
  const advice = orientDomains("préparer mon dossier Campus France", "etudiant");
  assert.deepEqual(advice.map((a) => a.slug), ["campus-france", "orientation-insertion"]);
  assert.equal(advice[1].reason, "Souvent utile aux étudiants");
});

test("orientation : phrase sans rapport et sans situation → aucun conseil", () => {
  assert.deepEqual(orientDomains("bonjour à tous", null), []);
});

test("détection : « entreprise » ne déclenche pas « entretien » (orientation)", () => {
  assert.deepEqual(inferDomainSlugs("créer une entreprise"), ["entrepreneuriat"]);
  assert.ok(inferDomainSlugs("préparer un entretien d'embauche").includes("orientation-insertion"));
});

test("orientation : vocabulaire du cahier des charges (§5) reconnu", () => {
  const cases = [
    ["Je veux me former au marketing digital", "numerique"],
    ["Rédiger ma lettre de motivation", "orientation-insertion"],
    ["Développer mon réseau professionnel", "orientation-insertion"],
    ["Améliorer la communication de mon association", "culture-creation"],
    ["Comprendre les ressources humaines et le management", "gestion-finance"],
    ["Préparer ma mobilité étudiante en France", "campus-france"],
    ["Mieux gérer mon stress à l'oral", "developpement-personnel"],
    ["Me lancer dans l'intelligence artificielle", "numerique"],
  ];
  for (const [phrase, slug] of cases) {
    assert.ok(inferDomainSlugs(phrase).includes(slug), `${phrase} → ${inferDomainSlugs(phrase).join(",")}`);
  }
});
