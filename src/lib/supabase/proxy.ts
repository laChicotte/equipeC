import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "./env";

/** Pages réservées aux utilisateurs connectés. */
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/onboarding",
  "/mentors",
  "/mentorships",
  "/profile",
];

/** Pages inutiles quand on est déjà connecté. */
const AUTH_PAGES = ["/login", "/signup"];

function matches(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Exécuté avant chaque page :
 * 1. rafraîchit la session Supabase (cookies) si elle a expiré ;
 * 2. redirige vers /login si la page est protégée et l'utilisateur non connecté.
 *
 * ⚠️ Ce n'est qu'une première barrière : chaque page et chaque Server Action
 * revérifie l'utilisateur, et la base de données applique ses propres règles (RLS).
 */
export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
        // En-têtes anti-cache : empêchent un CDN de servir la session
        // d'un utilisateur à un autre.
        Object.entries(headers ?? {}).forEach(([key, value]) =>
          response.headers.set(key, value),
        );
      },
    },
  });

  // getClaims() vérifie la signature du jeton (contrairement à getSession()).
  // Ne rien placer entre createServerClient et cet appel.
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const { pathname, search } = request.nextUrl;

  const redirectTo = (path: string) => {
    const target = NextResponse.redirect(new URL(path, request.url));
    // Conserver les cookies de session éventuellement rafraîchis
    response.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
    return target;
  };

  if (!isLoggedIn && matches(pathname, PROTECTED_PREFIXES)) {
    return redirectTo(`/login?next=${encodeURIComponent(pathname + search)}`);
  }

  if (isLoggedIn && matches(pathname, AUTH_PAGES)) {
    return redirectTo("/dashboard");
  }

  return response;
}
