// Lectures liées aux profils (exécutées côté serveur).
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Domain, UserRole } from "@/types/database";

/** Catalogue des domaines, dans l'ordre du cahier des charges. */
export const getDomains = cache(async (): Promise<Domain[]> => {
  const supabase = await createClient();
  // Les coupures réseau passagères sont déjà retentées par le client (resilient-fetch.ts)
  const { data, error } = await supabase.from("domains").select("id, slug, name, description").order("id");
  if (error) console.error("[domaines] lecture impossible :", error.message);
  return (data as Domain[] | null) ?? [];
});

/**
 * Domaines d'un profil POUR UN RÔLE : expertises (mentor) ou centres
 * d'intérêt (mentoré). Sans la migration 0007, tous les domaines du profil.
 */
export async function getProfileDomainIds(profileId: string, role: UserRole): Promise<number[]> {
  const supabase = await createClient();
  let { data, error } = await supabase
    .from("profile_domains")
    .select("domain_id")
    .eq("profile_id", profileId)
    .eq("as_role", role);
  if (error) ({ data, error } = await supabase.from("profile_domains").select("domain_id").eq("profile_id", profileId));
  return (data ?? []).map((row) => row.domain_id as number);
}
