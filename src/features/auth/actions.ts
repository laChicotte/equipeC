"use server";

import { headers } from "next/headers";
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

/** Adresse du site (http://localhost:3000 en dev, le domaine en production). */
async function siteOrigin(): Promise<string> {
  const h = await headers();
  const origin = h.get("origin");
  if (origin) return origin;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

const resetRequestSchema = z.object({
  email: z.email("Adresse email invalide").trim().toLowerCase(),
});

/** Envoie l'email de réinitialisation du mot de passe. */
export async function requestPasswordReset(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = resetRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const origin = await siteOrigin();
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  });

  // Limite de débit : on le signale. Sinon, même message que le compte existe
  // ou non (ne pas révéler quels emails sont inscrits).
  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { error: translateAuthError(error.code) };
  }
  return {
    info: "Si un compte existe avec cette adresse, vous allez recevoir un lien pour choisir un nouveau mot de passe.",
  };
}

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Au moins 8 caractères").max(72),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    path: ["confirm"],
    message: "Les deux mots de passe ne correspondent pas",
  });

/** Enregistre le nouveau mot de passe (session ouverte par le lien reçu). */
export async function updatePassword(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = newPasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return { error: "Lien expiré. Refaites une demande de réinitialisation." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return {
      error:
        error.code === "same_password"
          ? "Choisissez un mot de passe différent de l'ancien."
          : translateAuthError(error.code),
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
