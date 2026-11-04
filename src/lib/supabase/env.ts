/**
 * Lit les variables d'environnement Supabase et échoue avec un message clair
 * si elles manquent (au lieu d'une erreur obscure plus loin).
 *
 * Les variables NEXT_PUBLIC_* doivent être écrites en toutes lettres
 * (process.env.NEXT_PUBLIC_...) pour que Next.js les injecte côté navigateur.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error(
      "Variables Supabase manquantes : renseignez NEXT_PUBLIC_SUPABASE_URL et " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY dans .env.local (voir .env.example).",
    );
  }

  return { url, publishableKey };
}
