// Lecture des opportunités (côté serveur).
import { createClient } from "@/lib/supabase/server";
import { todayInConakry } from "@/lib/datetime";
import type { Opportunity, OpportunityKind } from "@/types/database";

export type OpportunityView = Opportunity & {
  /** null si l'auteur est un mentoré non visible (protection des profils mentorés) */
  author: { full_name: string } | null;
  /** Date limite dans 7 jours ou moins (calculé à la lecture) */
  closingSoon: boolean;
};

/**
 * Opportunités encore ouvertes (sans date limite ou date limite non dépassée),
 * les plus proches de leur date limite d'abord.
 */
export async function getOpenOpportunities(kind?: OpportunityKind): Promise<OpportunityView[]> {
  const supabase = await createClient();
  const today = todayInConakry();

  let query = supabase
    .from("opportunities")
    .select(
      `id, author_id, kind, title, organization, location, description, url, deadline, created_at,
       author:profiles ( full_name )`,
    )
    .or(`deadline.is.null,deadline.gte.${today}`)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);
  if (kind) query = query.eq("kind", kind);

  const { data } = await query;
  const inAWeek = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  return ((data ?? []) as unknown as Omit<OpportunityView, "closingSoon">[]).map((o) => ({
    ...o,
    closingSoon: o.deadline !== null && o.deadline <= inAWeek,
  }));
}
