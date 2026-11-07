// Lecture de la bibliothèque de ressources (côté serveur).
import { createClient } from "@/lib/supabase/server";
import type { Resource, ResourceKind } from "@/types/database";

export type ResourceView = Resource & {
  domain: { name: string; slug: string } | null;
  author: { id: string; full_name: string; job_title: string | null; avatar_url: string | null } | null;
};

/** Ressources, les plus récentes d'abord, filtrables par domaine et par type. */
export async function getResources({
  domain,
  kind,
}: {
  domain?: string;
  kind?: ResourceKind;
}): Promise<ResourceView[]> {
  const supabase = await createClient();
  // !inner : filtrer sur le domaine exclut aussi les ressources sans domaine
  let query = supabase
    .from("resources")
    .select(
      `id, author_id, domain_id, kind, title, description, url, created_at,
       domain:domains${domain ? "!inner" : ""} ( name, slug ),
       author:profiles ( id, full_name, job_title, avatar_url )`,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (domain) query = query.eq("domain.slug", domain);
  if (kind) query = query.eq("kind", kind);

  const { data } = await query;
  return (data ?? []) as unknown as ResourceView[];
}
