import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Retour de Supabase après une connexion Google / GitHub ou un lien
 * « mot de passe oublié » : on échange le code contre une session (cookies).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/dashboard";
  // Pas de redirection vers un autre site
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  const failed = next === "/reset-password" ? "/forgot-password?error=link" : "/login?error=oauth";
  return NextResponse.redirect(new URL(failed, origin));
}
