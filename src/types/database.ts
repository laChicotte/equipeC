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

export type Session = {
  id: string;
  mentorship_id: string;
  scheduled_at: string;
  duration_min: number;
  topic: string | null;
  meeting_url: string;
  status: SessionStatus;
  created_by: string;
  created_at: string;
};

export type Message = {
  id: number;
  mentorship_id: string;
  sender_id: string;
  content: string;
  created_at: string;
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
