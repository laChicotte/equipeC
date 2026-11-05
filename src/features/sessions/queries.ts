// Lectures des séances (côté serveur). RLS : uniquement les séances
// des mentorats dont on est participant.
import { createClient } from "@/lib/supabase/server";
import type { Session } from "@/types/database";

const SESSION_COLUMNS =
  "id, mentorship_id, scheduled_at, duration_min, topic, meeting_url, status, created_by, created_at";

/**
 * État d'une séance par rapport à l'heure actuelle, calculé UNE fois à la
 * lecture des données (les composants React doivent rester « purs » et ne
 * pas lire l'horloge eux-mêmes).
 * - live : de 15 min avant le début jusqu'à la fin → bouton « Rejoindre »
 */
export type SessionPhase = "upcoming" | "live" | "past" | "cancelled";
export type SessionWithPhase = Session & { phase: SessionPhase };

const JOIN_EARLY_MS = 15 * 60_000;

function withPhase<T extends Session>(session: T, now: number): T & { phase: SessionPhase } {
  const start = new Date(session.scheduled_at).getTime();
  const end = start + session.duration_min * 60_000;
  const phase: SessionPhase =
    session.status === "cancelled"
      ? "cancelled"
      : end < now || session.status === "done"
        ? "past"
        : now >= start - JOIN_EARLY_MS
          ? "live"
          : "upcoming";
  return { ...session, phase };
}

/** Toutes les séances d'un mentorat, dans l'ordre chronologique. */
export async function getSessions(mentorshipId: string): Promise<SessionWithPhase[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sessions")
    .select(SESSION_COLUMNS)
    .eq("mentorship_id", mentorshipId)
    .order("scheduled_at");
  const now = Date.now();
  return ((data ?? []) as Session[]).map((s) => withPhase(s, now));
}

export type UpcomingSession = SessionWithPhase & {
  mentorship: { id: string; mentor: { full_name: string }; mentee: { full_name: string } };
};

/** Mes prochaines séances (tous mentorats confondus), pour le tableau de bord. */
export async function getUpcomingSessions(limit = 5): Promise<UpcomingSession[]> {
  const supabase = await createClient();
  const now = Date.now();
  // On inclut les séances commencées depuis moins de 4 h (peut-être encore en cours)
  const since = new Date(now - 4 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("sessions")
    .select(
      `${SESSION_COLUMNS},
       mentorship:mentorships (
         id,
         mentor:profiles!mentorships_mentor_id_fkey ( full_name ),
         mentee:profiles!mentorships_mentee_id_fkey ( full_name )
       )`,
    )
    .eq("status", "scheduled")
    .gte("scheduled_at", since)
    .order("scheduled_at")
    .limit(limit * 2);

  return ((data ?? []) as unknown as (Session & Pick<UpcomingSession, "mentorship">)[])
    .map((s) => withPhase(s, now))
    .filter((s) => s.phase === "upcoming" || s.phase === "live")
    .slice(0, limit);
}
