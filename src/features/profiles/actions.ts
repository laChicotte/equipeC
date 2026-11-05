"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/queries";
import { MAX_MENTOR_DOMAINS, MIN_MENTOR_YEARS } from "./constants";

export type ProfileFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Texte facultatif : une chaîne vide devient null en base. */
const optionalText = (max: number) =>
  z.string().trim().max(max, `${max} caractères maximum`).transform((v) => v || null);

const commonSchema = z.object({
  full_name: z.string().trim().min(2, "Au moins 2 caractères").max(100),
  headline: optionalText(120),
  city: optionalText(80),
  bio: optionalText(2000),
  domain_ids: z
    .array(z.coerce.number().int().positive())
    .min(1, "Choisissez au moins un domaine")
    .max(7),
  // Compétences (mentor) ou besoins précis (mentoré), saisis librement
  skills: z
    .array(z.string().trim().min(2, "2 caractères minimum par élément").max(40, "40 caractères maximum par élément"))
    .max(10, "10 éléments maximum")
    // Sans doublons (insensible à la casse)
    .transform((list) =>
      list.filter((s, i) => list.findIndex((o) => o.toLowerCase() === s.toLowerCase()) === i),
    ),
});

const mentorSchema = commonSchema.extend({
  // Un mentor se concentre sur les domaines qu'il maîtrise vraiment
  domain_ids: z
    .array(z.coerce.number().int().positive())
    .min(1, "Choisissez au moins un domaine")
    .max(MAX_MENTOR_DOMAINS, `${MAX_MENTOR_DOMAINS} domaines maximum : choisissez ceux que vous maîtrisez le mieux`),
  job_title: z.string().trim().min(2, "Indiquez votre poste").max(120),
  organization: optionalText(120),
  years_experience: z.coerce
    .number("Nombre attendu")
    .int("Nombre entier attendu")
    .min(MIN_MENTOR_YEARS, `Le programme mobilise des professionnels expérimentés : ${MIN_MENTOR_YEARS} ans d'expérience minimum`)
    .max(60, "Valeur invalide"),
  availability: optionalText(300),
  is_available: z.boolean(),
});

const menteeSchema = commonSchema.extend({
  mentee_status: z.enum(
    ["etudiant", "jeune_diplome", "entrepreneur", "porteur_projet", "reconversion", "autre"],
    "Choisissez votre situation",
  ),
  goals_summary: z
    .string()
    .trim()
    .min(10, "Décrivez vos objectifs en quelques mots (10 caractères minimum)")
    .max(1000),
});

/**
 * Enregistre le profil de l'utilisateur connecté (onboarding ou modification).
 * Le rôle est lu en base, jamais dans le formulaire : on ne fait pas confiance
 * à ce que le navigateur envoie.
 */
export async function saveProfile(
  _prev: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expirée. Reconnectez-vous." };

  const raw = {
    ...Object.fromEntries(formData),
    domain_ids: formData.getAll("domain_ids"),
    skills: formData.getAll("skills"),
    is_available: formData.get("is_available") === "on",
  };

  const schema = profile.role === "mentor" ? mentorSchema : menteeSchema;
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Certains champs sont à corriger.",
      // Erreur générique : le schéma varie selon le rôle (mentor / mentoré)
      fieldErrors: z.flattenError(parsed.error as z.ZodError<Record<string, unknown>>)
        .fieldErrors,
    };
  }

  const { domain_ids, skills, ...fields } = parsed.data;
  const supabase = await createClient();

  // 1. Champs du profil (RLS : uniquement sa propre ligne)
  let { error } = await supabase
    .from("profiles")
    .update({ ...fields, skills, onboarded: true })
    .eq("id", profile.id);
  // Colonne `skills` absente (migration 0004 non exécutée) : on enregistre le reste
  let skillsSkipped = false;
  if (error?.message.includes("skills")) {
    skillsSkipped = true;
    ({ error } = await supabase.from("profiles").update({ ...fields, onboarded: true }).eq("id", profile.id));
  }
  if (error) return { error: "Enregistrement impossible. Réessayez." };

  // 2. Domaines : on remplace l'ancienne sélection par la nouvelle
  const { error: deleteError } = await supabase
    .from("profile_domains")
    .delete()
    .eq("profile_id", profile.id);
  if (deleteError) return { error: "Enregistrement des domaines impossible." };

  const { error: insertError } = await supabase
    .from("profile_domains")
    .insert(domain_ids.map((domain_id) => ({ profile_id: profile.id, domain_id })));
  if (insertError) return { error: "Enregistrement des domaines impossible." };

  // Rafraîchit les pages qui affichent le profil (en-tête, tableau de bord…)
  revalidatePath("/", "layout");

  // Premier remplissage → tableau de bord ; modification → rester sur la page
  if (formData.get("mode") === "onboarding") redirect("/dashboard");
  return {
    success: skillsSkipped
      ? "Profil enregistré (compétences non enregistrées : migration 0004 à exécuter)."
      : "Profil enregistré.",
  };
}
