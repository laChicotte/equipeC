// Fichier serveur uniquement (il utilise les cookies via lib/supabase/server).
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

/**
 * Renvoie l'identifiant de l'utilisateur connecté (jeton vérifié), ou null.
 * `cache` évite de refaire la vérification plusieurs fois dans une même requête.
 */
export const getCurrentUserId = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  return data?.claims.sub ?? null;
});

/** Profil de l'utilisateur connecté, ou null (non connecté / profil absent). */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Profile>();
  return data;
});

/** À utiliser dans les pages protégées : redirige vers /login si besoin. */
export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) redirect("/login");
  return userId;
}
