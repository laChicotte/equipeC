// Lectures liées aux profils (exécutées côté serveur).
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Domain } from "@/types/database";

/** Catalogue des domaines, dans l'ordre du cahier des charges. */
export const getDomains = cache(async (): Promise<Domain[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("domains")
    .select("id, slug, name, description")
    .order("id");
  return (data as Domain[] | null) ?? [];
});

/** Identifiants des domaines choisis par un profil. */
export async function getProfileDomainIds(profileId: string): Promise<number[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profile_domains")
    .select("domain_id")
    .eq("profile_id", profileId);
  return (data ?? []).map((row) => row.domain_id as number);
}
