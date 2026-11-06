// Fichier serveur uniquement : client Supabase avec la clé SECRÈTE.
// ⚠️ Il contourne les règles d'accès (RLS) : à n'utiliser QU'APRÈS avoir
// vérifié que l'utilisateur est administrateur (features/admin/access.ts),
// et jamais dans un composant client.
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

export function createAdminClient() {
  const { url } = getSupabaseEnv();
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("SUPABASE_SECRET_KEY manquante : nécessaire à la page d'administration (côté serveur).");
  }
  return createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** La page d'administration peut-elle lire les données ? (clé secrète configurée) */
export const hasAdminKey = () => Boolean(process.env.SUPABASE_SECRET_KEY);
