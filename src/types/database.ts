/**
 * Types TypeScript qui reflètent le schéma SQL
 * (supabase/migrations/0001_init.sql). À maintenir synchronisés.
 */

export type UserRole = "mentor" | "mentee";

export type MenteeStatus =
  | "etudiant"
  | "jeune_diplome"
  | "entrepreneur"
  | "porteur_projet"
  | "reconversion"
  | "autre";

export type MentorshipStatus = "pending" | "accepted" | "declined" | "ended";
export type SessionStatus = "scheduled" | "done" | "cancelled";
export type GoalStatus = "todo" | "in_progress" | "done";

export type Domain = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
};

export type Profile = {
  id: string;
  role: UserRole;
  full_name: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  avatar_url: string | null;
  job_title: string | null;
  organization: string | null;
  years_experience: number | null;
  availability: string | null;
  is_available: boolean;
  mentee_status: MenteeStatus | null;
  goals_summary: string | null;
  onboarded: boolean;
  created_at: string;
  updated_at: string;
};
