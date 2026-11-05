// Test des règles de sécurité (RLS) avec de vrais utilisateurs connectés.
// Usage : npm run test:rls
//
// Crée 3 comptes de test (adresses @example.com, aucun email envoyé si la
// confirmation par email est désactivée) puis vérifie que chaque utilisateur
// ne peut faire QUE ce qui lui est permis. N'affiche jamais les clés.
// Les comptes créés peuvent être supprimés dans Supabase > Authentication > Users.

import { createClient } from "@supabase/supabase-js";

process.loadEnvFile(".env.local");
const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const run = Date.now().toString(36);
let passed = 0;
let failed = 0;

function check(label, condition, detail = "") {
  if (condition) {
    passed++;
    console.log(`  ✅ ${label}`);
  } else {
    failed++;
    console.log(`  ❌ ${label}${detail ? ` → ${detail}` : ""}`);
  }
}

async function newUser(label, role) {
  const client = createClient(URL_, KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client.auth.signUp({
    email: `rls-${role}-${label}-${run}@example.com`,
    password: `Test-${run}-${Math.random().toString(36).slice(2)}`,
    options: { data: { full_name: `Test RLS ${label}`, role } },
  });
  if (error) throw new Error(`Inscription impossible (${error.code ?? error.message})`);
  if (!data.session) {
    throw new Error(
      "Pas de session après l'inscription : la confirmation par email est encore activée.\n" +
        "   Désactivez-la : Authentication > Sign In / Providers > Email > Confirm email.",
    );
  }
  return { client, id: data.user.id };
}

async function main() {
  console.log("Création des comptes de test…");
  const M = await newUser("mentor", "mentor"); // s'arrête ici si confirmation activée
  const A = await newUser("menteeA", "mentee");
  const C = await newUser("menteeC", "mentee");
  // Rôle "admin" inventé : doit être ramené à "mentee" par le trigger
  const H = await newUser("hacker", "admin");

  console.log("\n1. Profils et rôles");
  {
    const { data } = await A.client.from("profiles").select("role").eq("id", A.id).single();
    check("Le profil est créé automatiquement avec le bon rôle", data?.role === "mentee");
    const { data: h } = await H.client.from("profiles").select("role").eq("id", H.id).single();
    check("Un rôle inventé à l'inscription est refusé (ramené à mentee)", h?.role === "mentee");

    const { error } = await A.client.from("profiles").update({ role: "mentor" }).eq("id", A.id);
    check("Un mentoré ne peut pas se promouvoir mentor", Boolean(error), "modification acceptée !");

    const { data: other } = await A.client
      .from("profiles").update({ full_name: "Piraté" }).eq("id", M.id).select();
    check("On ne peut pas modifier le profil d'un autre", (other ?? []).length === 0);

    const { error: e2 } = await M.client
      .from("profiles").update({ onboarded: true, job_title: "Testeur" }).eq("id", M.id);
    check("On peut modifier son propre profil", !e2, e2?.message);
  }

  console.log("\n2. Visibilité des profils (protection des mentorés)");
  {
    const { data } = await A.client.from("profiles").select("id").eq("id", M.id);
    check("Un mentoré voit les mentors", data?.length === 1);
    const { data: d2 } = await C.client.from("profiles").select("id").eq("id", A.id);
    check("Un mentoré ne voit pas le profil d'un autre mentoré", d2?.length === 0);
    const { data: d3 } = await M.client.from("profiles").select("id").eq("id", A.id);
    check("Un mentor ne voit pas un mentoré sans relation", d3?.length === 0);
  }

  console.log("\n3. Demandes de mentorat");
  let mentorshipId;
  {
    const { data, error } = await A.client
      .from("mentorships")
      .insert({ mentor_id: M.id, mentee_id: A.id, message: "Bonjour, test RLS" })
      .select("id")
      .single();
    check("Un mentoré peut envoyer une demande à un mentor", !error, error?.message);
    mentorshipId = data?.id;

    const { error: e2 } = await A.client
      .from("mentorships").insert({ mentor_id: C.id, mentee_id: A.id });
    check("Impossible d'envoyer une demande à un non-mentor", Boolean(e2));

    const { error: e3 } = await A.client
      .from("mentorships").insert({ mentor_id: M.id, mentee_id: C.id });
    check("Impossible de créer une demande au nom d'un autre", Boolean(e3));

    const { error: e4 } = await A.client
      .from("mentorships").insert({ mentor_id: M.id, mentee_id: A.id });
    check("Pas de doublon de demande active", Boolean(e4));

    const { data: d5 } = await M.client.from("profiles").select("id").eq("id", A.id);
    check("Le mentor voit le profil du mentoré qui l'a sollicité", d5?.length === 1);

    const { data: d6 } = await C.client.from("mentorships").select("id").eq("id", mentorshipId);
    check("Un tiers ne voit pas la demande", d6?.length === 0);

    const { error: e7 } = await A.client
      .from("mentorships").update({ status: "accepted" }).eq("id", mentorshipId);
    check("Le mentoré ne peut pas accepter sa propre demande", Boolean(e7));

    const { error: e8 } = await A.client.from("messages")
      .insert({ mentorship_id: mentorshipId, sender_id: A.id, content: "trop tôt" });
    check("Pas de message avant acceptation", Boolean(e8));

    const { error: e9 } = await M.client
      .from("mentorships").update({ status: "accepted" }).eq("id", mentorshipId);
    check("Le mentor peut accepter la demande", !e9, e9?.message);
  }

  console.log("\n4. Messagerie");
  {
    const { error } = await A.client.from("messages")
      .insert({ mentorship_id: mentorshipId, sender_id: A.id, content: "Bonjour mentor !" });
    check("Le mentoré peut écrire dans une relation acceptée", !error, error?.message);

    const { error: e2 } = await A.client.from("messages")
      .insert({ mentorship_id: mentorshipId, sender_id: M.id, content: "usurpation" });
    check("Impossible d'envoyer un message au nom d'un autre", Boolean(e2));

    const { data } = await M.client.from("messages").select("id").eq("mentorship_id", mentorshipId);
    check("Le mentor lit le message", data?.length === 1);

    const { data: d3 } = await C.client.from("messages").select("id").eq("mentorship_id", mentorshipId);
    check("Un tiers ne lit pas les messages", d3?.length === 0);

    const { error: e4 } = await C.client.from("messages")
      .insert({ mentorship_id: mentorshipId, sender_id: C.id, content: "intrusion" });
    check("Un tiers ne peut pas écrire dans la conversation", Boolean(e4));
  }

  console.log("\n5. Séances et évaluations");
  {
    const inOneDay = new Date(Date.now() + 86_400_000).toISOString();
    const { error } = await A.client.from("sessions").insert({
      mentorship_id: mentorshipId, scheduled_at: inOneDay, created_by: A.id,
      meeting_url: "https://site-pirate.example",
    });
    check("Impossible d'imposer un lien de visio arbitraire", Boolean(error));

    const { data: s, error: e2 } = await A.client
      .from("sessions")
      .insert({ mentorship_id: mentorshipId, scheduled_at: inOneDay, created_by: A.id, topic: "Test" })
      .select("id, meeting_url")
      .single();
    check("Une séance peut être planifiée", !e2, e2?.message);
    check("Le lien de visio est généré par la base", s?.meeting_url?.startsWith("https://meet.jit.si/"));

    const { error: e3 } = await A.client
      .from("session_reviews").insert({ session_id: s?.id, reviewer_id: A.id, rating: 5 });
    check("Impossible d'évaluer une séance future", Boolean(e3));

    const { data: d4 } = await C.client.from("sessions").select("id").eq("mentorship_id", mentorshipId);
    check("Un tiers ne voit pas les séances", d4?.length === 0);
  }

  console.log("\n6. Objectifs");
  {
    const { error } = await A.client
      .from("goals").insert({ mentorship_id: mentorshipId, title: "Préparer mon CV" });
    check("Le mentoré peut créer un objectif", !error, error?.message);
    const { data } = await C.client.from("goals").select("id").eq("mentorship_id", mentorshipId);
    check("Un tiers ne voit pas les objectifs", data?.length === 0);
  }

  console.log("\n7. Ressources et opportunités (migration 0002)");
  {
    const resource = { kind: "guide", title: "Ressource de test", description: "Description de test suffisante" };
    const { data: r, error } = await M.client
      .from("resources").insert({ ...resource, author_id: M.id }).select("id").single();
    check("Un mentor publie une ressource", !error, error?.message);
    const { error: e2 } = await A.client.from("resources").insert({ ...resource, author_id: A.id });
    check("Un mentoré ne peut pas publier de ressource", Boolean(e2));
    const { error: e3 } = await M.client
      .from("resources").insert({ ...resource, author_id: M.id, url: "javascript:alert(1)" });
    check("Lien non https refusé par la base", Boolean(e3));
    const { data: seen } = await C.client.from("resources").select("id").eq("id", r?.id);
    check("Tout membre connecté lit les ressources", seen?.length === 1);
    const { data: delOther } = await A.client.from("resources").delete().eq("id", r?.id).select("id");
    check("Impossible de supprimer la ressource d'un autre", (delOther ?? []).length === 0);

    const opportunity = { kind: "stage", title: "Stage de test", description: "Description de test suffisante" };
    const { data: o, error: e4 } = await A.client
      .from("opportunities").insert({ ...opportunity, author_id: A.id }).select("id").single();
    check("Un mentoré partage une opportunité", !e4, e4?.message);
    const { error: e5 } = await A.client.from("opportunities").insert({ ...opportunity, author_id: M.id });
    check("Impossible de publier au nom d'un autre", Boolean(e5));
    const { data: delO } = await C.client.from("opportunities").delete().eq("id", o?.id).select("id");
    check("Impossible de supprimer l'opportunité d'un autre", (delO ?? []).length === 0);
    const { data: own } = await A.client.from("opportunities").delete().eq("id", o?.id).select("id");
    check("L'auteur supprime son opportunité", own?.length === 1);
    await M.client.from("resources").delete().eq("id", r?.id);
  }

  // Le mentor de test passe indisponible pour ne pas polluer le catalogue
  await M.client.from("profiles").update({ is_available: false }).eq("id", M.id);
}

try {
  await main();
} catch (e) {
  console.error(`\n⛔ Test interrompu : ${e.message}`);
  failed++;
}

console.log(`\nRésultat : ${passed} réussi(s), ${failed} échec(s).`);
process.exitCode = failed === 0 ? 0 : 1;
