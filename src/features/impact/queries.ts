// Restitution du programme (étape 7) : chiffres d'impact et témoignages. Migration 0005.
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/features/auth/queries";
import type { MentorshipTestimonial, UserRole } from "@/types/database";

export type PlatformImpact = {
  mentors: number;
  mentees: number;
  mentorships: number;
  sessions_held: number;
  goals_done: number;
  avg_rating: number | null;
  reviews: number;
  workshops_held: number;
  testimonials: number;
};

/** Agrégats de la plateforme (aucune donnée personnelle). null si migration absente. */
export async function getPlatformImpact(): Promise<PlatformImpact | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_platform_impact");
  const row = (data as PlatformImpact[] | null)?.[0];
  if (error || !row) return null;
  return { ...row, avg_rating: row.avg_rating === null ? null : Number(row.avg_rating) };
}

export type PublicTestimonial = {
  first_name: string;
  role: UserRole;
  domain_name: string | null;
  content: string;
  created_at: string;
};

export async function getPublicTestimonials(limit = 6): Promise<PublicTestimonial[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_testimonials", { p_limit: limit });
  if (error) return [];
  return (data ?? []) as PublicTestimonial[];
}

/** Bilans d'un mentorat (le sien et celui de l'autre membre), visibles par ses membres. */
export async function getMentorshipTestimonials(
  mentorshipId: string,
): Promise<{ mine: MentorshipTestimonial | null; other: MentorshipTestimonial | null } | null> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from("mentorship_testimonials")
    .select("id, mentorship_id, author_id, content, is_public, created_at, updated_at")
    .eq("mentorship_id", mentorshipId);
  if (error) return null; // migration 0005 absente
  const rows = (data ?? []) as MentorshipTestimonial[];
  return {
    mine: rows.find((t) => t.author_id === userId) ?? null,
    other: rows.find((t) => t.author_id !== userId) ?? null,
  };
}
