// Fichier serveur uniquement : qui est administrateur ?
// Liste d'adresses e-mail dans la variable ADMIN_EMAILS (séparées par des virgules).
// Sans cette variable, personne n'est administrateur : la page reste introuvable.
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/** L'utilisateur connecté est-il administrateur ? (e-mail vérifié par Supabase Auth) */
export const isCurrentUserAdmin = cache(async (): Promise<boolean> => {
  const allowed = adminEmails();
  if (allowed.length === 0) return false;
  const supabase = await createClient();
  // getUser() interroge Supabase Auth : l'e-mail ne peut pas être falsifié par le navigateur
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();
  return Boolean(email && allowed.includes(email));
});
