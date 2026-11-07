/**
 * fetch « tolérant » pour les appels serveur vers Supabase.
 *
 * Sur un réseau instable (partage de connexion, Wi-Fi d'un salon), une
 * connexion restée inactive peut être coupée : la requête suivante échoue
 * aussitôt (« TypeError: fetch failed ») sans même atteindre Supabase.
 *
 * On retente alors, après une courte pause, UNIQUEMENT :
 * - les lectures (GET / HEAD), jamais les écritures (pas de doublon possible) ;
 * - les erreurs réseau, jamais une réponse d'erreur de Supabase (400, 401…).
 */
const RETRY_DELAYS_MS = [250, 750];

export const resilientFetch: typeof fetch = async (input, init) => {
  const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
  const idempotent = method === "GET" || method === "HEAD";

  for (let attempt = 0; ; attempt++) {
    try {
      return await fetch(input, init);
    } catch (error) {
      const aborted = init?.signal?.aborted || (error instanceof Error && error.name === "AbortError");
      if (!idempotent || aborted || attempt >= RETRY_DELAYS_MS.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
    }
  }
};
