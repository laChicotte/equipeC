// Lecture des opportunités (côté serveur).
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/features/auth/queries";
import { todayInConakry } from "@/lib/datetime";
import type { Opportunity, OpportunityKind } from "@/types/database";

export type OpportunityApplication = {
  full_name: string;
  motivation: string;
  contact: string;
  created_at: string;
};

export type OpportunityView = Opportunity & {
  /** null si l'auteur est un mentoré non visible (protection des profils mentorés) */
  author: { full_name: string } | null;
  /** Date limite dans 7 jours ou moins (calculé à la lecture) */
  closingSoon: boolean;
  /** L'utilisateur connecté a déjà postulé */
  hasApplied: boolean;
  /** Candidatures reçues : seulement pour l'auteur de l'annonce */
  applications: OpportunityApplication[];
};

/**
 * Opportunités encore ouvertes (sans date limite ou date limite non dépassée),
 * les plus proches de leur date limite d'abord.
 * Les candidatures (migration 0008) sont ignorées si la table n'existe pas encore.
 */
export async function getOpenOpportunities(kind?: OpportunityKind): Promise<OpportunityView[]> {
  const supabase = await createClient();
  const today = todayInConakry();
  const userId = await getCurrentUserId();

  let query = supabase
    .from("opportunities")
    .select(
      `id, author_id, kind, title, organization, location, description, url, deadline, created_at,
       author:profiles!opportunities_author_id_fkey ( full_name )`,
      // Lien explicite : depuis la migration 0008, opportunity_applications relie
      // aussi opportunities à profiles (sinon erreur PGRST201 « more than one relationship »)
    )
    .or(`deadline.is.null,deadline.gte.${today}`)
    .order("deadline", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(100);
  if (kind) query = query.eq("kind", kind);

  const [{ data, error }, mine] = await Promise.all([
    query,
    supabase.from("opportunity_applications").select("opportunity_id").eq("applicant_id", userId ?? ""),
  ]);
  // Une erreur de lecture ne doit pas se faire passer pour « aucune opportunité »
  if (error) throw new Error(`Lecture des opportunités impossible : ${error.message}`);
  const applied = new Set(((mine.data ?? []) as { opportunity_id: string }[]).map((a) => a.opportunity_id));

  const inAWeek = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
  const rows = (data ?? []) as unknown as Omit<OpportunityView, "closingSoon" | "hasApplied" | "applications">[];
  return Promise.all(
    rows.map(async (o) => {
      const received =
        o.author_id === userId && !mine.error
          ? await supabase.rpc("get_opportunity_applications", { p_opportunity_id: o.id })
          : { data: [] };
      return {
        ...o,
        closingSoon: o.deadline !== null && o.deadline <= inAWeek,
        hasApplied: applied.has(o.id),
        applications: (received.data ?? []) as OpportunityApplication[],
      };
    }),
  );
}
