import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";
import { resilientFetch } from "./resilient-fetch";

/**
 * Client Supabase pour le code serveur : Server Components,
 * Server Actions et Route Handlers.
 *
 * Créez un nouveau client à chaque requête (ne pas le stocker globalement),
 * car il dépend des cookies de l'utilisateur courant.
 */
export async function createClient() {
  const { url, publishableKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    // Lectures retentées en cas de coupure réseau passagère (voir resilient-fetch.ts)
    global: { fetch: resilientFetch },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Appelé depuis un Server Component : l'écriture de cookies y est
          // interdite. Sans conséquence si un proxy rafraîchit la session
          // (à mettre en place avec la fonctionnalité d'authentification).
        }
      },
    },
  });
}
