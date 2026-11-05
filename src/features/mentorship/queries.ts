// Lectures des relations de mentorat (côté serveur).
// RLS garantit qu'on ne reçoit QUE les mentorats dont on est participant.
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/queries";
import type { MenteeStatus, MentorshipStatus } from "@/types/database";

export type MentorshipView = {
  id: string;
  status: MentorshipStatus;
  message: string | null;
  created_at: string;
  responded_at: string | null;
  domain: { name: string; slug: string } | null;
  mentor: { id: string; full_name: string; headline: string | null; job_title: string | null; avatar_url: string | null };
  mentee: {
    id: string;
    full_name: string;
    headline: string | null;
    mentee_status: MenteeStatus | null;
    goals_summary: string | null;
    avatar_url: string | null;
  };
};

// Les deux clés étrangères vers profiles sont désignées par leur nom
// (sinon Supabase ne sait pas laquelle utiliser).
const COLUMNS = `
  id, status, message, created_at, responded_at,
  domain:domains ( name, slug ),
  mentor:profiles!mentorships_mentor_id_fkey ( id, full_name, headline, job_title, avatar_url ),
  mentee:profiles!mentorships_mentee_id_fkey ( id, full_name, headline, mentee_status, goals_summary, avatar_url )
`;

/** Tous mes mentorats (en tant que mentor ou mentoré), les plus récents d'abord. */
export const getMyMentorships = cache(async (): Promise<MentorshipView[]> => {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  if (!profile) return [];
  // Double rôle : en mode mentor, mes mentorés ; en mode mentoré, mes mentors
  const { data } = await supabase
    .from("mentorships")
    .select(COLUMNS)
    .eq(profile.role === "mentor" ? "mentor_id" : "mentee_id", profile.id)
    .order("created_at", { ascending: false });
  return (data ?? []) as unknown as MentorshipView[];
});

/** Un mentorat dont je suis participant (null sinon). */
export async function getMentorshipById(id: string): Promise<MentorshipView | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data } = await supabase.from("mentorships").select(COLUMNS).eq("id", id).maybeSingle();
  return data as unknown as MentorshipView | null;
}

/** Ma demande en cours (en attente ou active) avec un mentor donné, s'il y en a une. */
export async function getActiveMentorshipWith(mentorId: string) {
  const mentorships = await getMyMentorships();
  return (
    mentorships.find(
      (m) => m.mentor.id === mentorId && (m.status === "pending" || m.status === "accepted"),
    ) ?? null
  );
}
