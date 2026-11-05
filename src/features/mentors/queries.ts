// Lectures du catalogue des mentors (côté serveur).
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Domain, Profile } from "@/types/database";
import { normalize, type MenteeInput, type MentorInput } from "./matching";
import { getProfileDomainIds } from "@/features/profiles/queries";

/** Données d'un mentoré (profil complété) pour le moteur de recommandation. */
export async function getMenteeInput(profile: Profile | null): Promise<MenteeInput | null> {
  if (!profile || profile.role !== "mentee" || !profile.is_mentee) return null;
  return {
    domainIds: await getProfileDomainIds(profile.id, "mentee"),
    menteeStatus: profile.mentee_status,
    text: [profile.goals_summary, profile.headline, profile.bio].filter(Boolean).join(" "),
    needs: profile.needs,
  };
}

/** Données d'un mentor pour le moteur de recommandation. */
export function toMentorInput(m: MentorSummary): MentorInput {
  return {
    id: m.id,
    domains: m.domains,
    text: [m.headline, m.job_title, m.organization, m.bio, ...m.skills].filter(Boolean).join(" "),
    skills: m.skills,
    yearsExperience: m.years_experience,
    rating: m.rating,
  };
}

export type MentorRating = { avg: number; count: number };

export type MentorSummary = Pick<
  Profile,
  | "id"
  | "full_name"
  | "headline"
  | "bio"
  | "city"
  | "job_title"
  | "organization"
  | "years_experience"
  | "availability"
  | "is_available"
  | "skills"
  | "avatar_url"
> & {
  domains: Pick<Domain, "id" | "slug" | "name">[];
  rating: MentorRating | null;
};

const BASE_COLUMNS = `
  id, full_name, headline, bio, city, job_title, organization,
  years_experience, availability, is_available, avatar_url`;
const DOMAINS_JOIN = `profile_domains ( domains ( id, slug, name ) )`;

type MentorRow = Omit<MentorSummary, "domains" | "rating" | "skills"> & {
  skills?: string[] | null;
  profile_domains: { domains: Pick<Domain, "id" | "slug" | "name"> | null }[];
};

/**
 * Lit les mentors AVEC leurs compétences ; si la colonne `skills` n'existe pas
 * encore (migration 0004 non exécutée), relit sans elle pour que le catalogue
 * reste disponible.
 */
async function selectMentorRows(
  run: (columns: string, dualRoles: boolean) => PromiseLike<{ data: unknown; error: { message: string } | null }>,
) {
  // Migration 0007 : seuls les profils de mentor complets, et leurs domaines « mentor »
  let result = await run(`${BASE_COLUMNS}, skills, ${DOMAINS_JOIN}`, true);
  if (result.error) result = await run(`${BASE_COLUMNS}, skills, ${DOMAINS_JOIN}`, false);
  if (result.error?.message.includes("skills")) result = await run(`${BASE_COLUMNS}, ${DOMAINS_JOIN}`, false);
  return result.data;
}

/** Notes moyennes de tous les mentors (fonction SQL get_mentor_ratings). */
const getRatings = cache(async (): Promise<Map<string, MentorRating>> => {
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_mentor_ratings");
  const rows = (data ?? []) as { mentor_id: string; avg_rating: number; reviews_count: number }[];
  return new Map(
    rows.map((r) => [r.mentor_id, { avg: Number(r.avg_rating), count: Number(r.reviews_count) }]),
  );
});

function toSummary(row: MentorRow, ratings: Map<string, MentorRating>): MentorSummary {
  const { profile_domains, skills, ...rest } = row;
  return {
    ...rest,
    skills: skills ?? [],
    domains: profile_domains
      .map((pd) => pd.domains)
      .filter((d): d is NonNullable<typeof d> => d !== null)
      .sort((a, b) => a.id - b.id),
    rating: ratings.get(row.id) ?? null,
  };
}

/** Tous les mentors disponibles ayant complété leur profil. */
export const getAvailableMentors = cache(async (): Promise<MentorSummary[]> => {
  const supabase = await createClient();
  const [data, ratings] = await Promise.all([
    selectMentorRows((columns, dualRoles) => {
      const query = supabase.from("profiles").select(columns).eq("is_available", true);
      return (
        dualRoles
          ? query.eq("is_mentor", true).eq("profile_domains.as_role", "mentor")
          : query.eq("role", "mentor").eq("onboarded", true)
      ).order("years_experience", { ascending: false, nullsFirst: false });
    }),
    getRatings(),
  ]);
  return ((data ?? []) as unknown as MentorRow[]).map((row) => toSummary(row, ratings));
});

export type PublicReview = {
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_first_name: string;
};

/**
 * Avis publics des mentorés sur un mentor (fonction SQL get_mentor_reviews,
 * migration 0003 : uniquement prénom, note, commentaire et date).
 */
export async function getMentorReviews(mentorId: string): Promise<PublicReview[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_mentor_reviews", { p_mentor_id: mentorId, p_limit: 6 });
  if (error) return []; // ex. migration 0003 pas encore exécutée
  return (data ?? []) as PublicReview[];
}

/** Un mentor par son identifiant (null si introuvable ou pas mentor). */
export async function getMentorById(id: string): Promise<MentorSummary | null> {
  // Un identifiant mal formé ferait échouer la requête : on l'écarte d'emblée
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;

  const supabase = await createClient();
  const [data, ratings] = await Promise.all([
    selectMentorRows((columns, dualRoles) => {
      const query = supabase.from("profiles").select(columns).eq("id", id);
      return (
        dualRoles ? query.eq("is_mentor", true).eq("profile_domains.as_role", "mentor") : query.eq("role", "mentor")
      ).maybeSingle();
    }),
    getRatings(),
  ]);
  return data ? toSummary(data as unknown as MentorRow, ratings) : null;
}

/** Filtre par domaine (slug) et par mot-clé (nom, poste, organisation, présentation). */
export function filterMentors(
  mentors: MentorSummary[],
  { domain, q }: { domain?: string; q?: string },
): MentorSummary[] {
  const terms = q ? normalize(q).split(/\s+/).filter(Boolean) : [];

  return mentors.filter((mentor) => {
    if (domain && !mentor.domains.some((d) => d.slug === domain)) return false;
    if (terms.length === 0) return true;

    const haystack = normalize(
      [
        mentor.full_name,
        mentor.headline,
        mentor.job_title,
        mentor.organization,
        mentor.bio,
        mentor.city,
        ...mentor.skills,
        ...mentor.domains.map((d) => d.name),
      ]
        .filter(Boolean)
        .join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });
}
