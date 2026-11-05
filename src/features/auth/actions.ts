"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/** État renvoyé aux formulaires (affichage des erreurs). */
export type AuthFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  info?: string;
};

// --- Validation côté serveur (on ne fait jamais confiance au navigateur) ---

const signupSchema = z.object({
  full_name: z.string().trim().min(2, "Au moins 2 caractères").max(100),
  email: z.email("Adresse email invalide").trim().toLowerCase(),
  password: z.string().min(8, "Au moins 8 caractères").max(72),
  role: z.enum(["mentor", "mentee"], "Choisissez un rôle"),
  // Case à cocher : le navigateur envoie « on » uniquement si elle est cochée
  charter: z.literal("on", "Vous devez accepter la charte du mentorat"),
});

const loginSchema = z.object({
  email: z.email("Adresse email invalide").trim().toLowerCase(),
  password: z.string().min(1, "Mot de passe requis"),
});

/** Traduit les erreurs Supabase en messages compréhensibles. */
function translateAuthError(code: string | undefined): string {
  switch (code) {
    case "invalid_credentials":
      return "Email ou mot de passe incorrect.";
    case "user_already_exists":
    case "email_exists":
      return "Un compte existe déjà avec cet email.";
    case "weak_password":
      return "Mot de passe trop faible.";
    case "email_not_confirmed":
      return "Confirmez d'abord votre adresse email.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Trop de tentatives. Réessayez dans quelques minutes.";
    default:
      return "Une erreur est survenue. Réessayez.";
  }
}

/** Empêche les redirections vers un site externe (ex. ?next=//site-pirate.com). */
function safeNextPath(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

export async function signup(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password, full_name, role } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // Lu par le trigger SQL handle_new_user pour créer le profil
    options: { data: { full_name, role } },
  });

  if (error) return { error: translateAuthError(error.code) };

  // Pas de session = la confirmation par email est activée dans Supabase
  if (!data.session) {
    return { info: "Compte créé. Vérifiez votre boîte email pour le confirmer." };
  }

  redirect("/onboarding");
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: translateAuthError(error.code) };

  redirect(safeNextPath(formData.get("next")));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
