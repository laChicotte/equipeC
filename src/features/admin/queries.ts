// Fichier serveur uniquement : lectures pour la page d'administration (lecture seule).
// Appelé UNIQUEMENT après isCurrentUserAdmin() : le client utilisé contourne les règles d'accès.
import { createAdminClient } from "@/lib/supabase/admin";
import type { MentorshipStatus, UserRole } from "@/types/database";

export type AdminUser = {
  id: string;
  fullName: string;
  email: string | null;
  role: UserRole;
  isMentor: boolean;
  isMentee: boolean;
  createdAt: string;
  lastSignInAt: string | null;
};

export type AdminMentorship = {
  id: string;
  status: MentorshipStatus;
  createdAt: string;
  mentor: string;
  mentee: string;
  domain: string | null;
};

export type AdminSession = {
  id: string;
  scheduledAt: string;
  topic: string | null;
  mentor: string;
  mentee: string;
};

type Named = { full_name: string } | null;

export async function getAdminOverview() {
  const db = createAdminClient();
  const count = async (table: string) => {
    const { count: n } = await db.from(table).select("*", { count: "exact", head: true });
    return n ?? 0;
  };
  const nowIso = new Date().toISOString();

  const [profilesRes, authRes, mentorshipsRes, sessionsRes, stats] = await Promise.all([
    db
      .from("profiles")
      .select("id, full_name, role, is_mentor, is_mentee, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
    db.auth.admin.listUsers({ perPage: 1000 }),
    db
      .from("mentorships")
      .select(
        `id, status, created_at,
         mentor:profiles!mentorships_mentor_id_fkey ( full_name ),
         mentee:profiles!mentorships_mentee_id_fkey ( full_name ),
         domain:domains ( name )`,
      )
      .order("created_at", { ascending: false })
      .limit(100),
    db
      .from("sessions")
      .select(
        `id, scheduled_at, topic,
         mentorship:mentorships (
           mentor:profiles!mentorships_mentor_id_fkey ( full_name ),
           mentee:profiles!mentorships_mentee_id_fkey ( full_name )
         )`,
      )
      .eq("status", "scheduled")
      .gte("scheduled_at", nowIso)
      .order("scheduled_at")
      .limit(50),
    Promise.all([
      count("messages"),
      count("sessions"),
      count("session_reviews"),
      count("resources"),
      count("workshops"),
      count("opportunities"),
    ]),
  ]);

  const emails = new Map((authRes.data?.users ?? []).map((u) => [u.id, u]));
  const users: AdminUser[] = (profilesRes.data ?? []).map((p) => {
    const auth = emails.get(p.id);
    return {
      id: p.id,
      fullName: p.full_name,
      email: auth?.email ?? null,
      role: p.role,
      isMentor: Boolean(p.is_mentor),
      isMentee: Boolean(p.is_mentee),
      createdAt: p.created_at,
      lastSignInAt: auth?.last_sign_in_at ?? null,
    };
  });

  const mentorships: AdminMentorship[] = (
    (mentorshipsRes.data ?? []) as unknown as {
      id: string;
      status: MentorshipStatus;
      created_at: string;
      mentor: Named;
      mentee: Named;
      domain: { name: string } | null;
    }[]
  ).map((m) => ({
    id: m.id,
    status: m.status,
    createdAt: m.created_at,
    mentor: m.mentor?.full_name ?? "—",
    mentee: m.mentee?.full_name ?? "—",
    domain: m.domain?.name ?? null,
  }));

  const sessions: AdminSession[] = (
    (sessionsRes.data ?? []) as unknown as {
      id: string;
      scheduled_at: string;
      topic: string | null;
      mentorship: { mentor: Named; mentee: Named } | null;
    }[]
  ).map((s) => ({
    id: s.id,
    scheduledAt: s.scheduled_at,
    topic: s.topic,
    mentor: s.mentorship?.mentor?.full_name ?? "—",
    mentee: s.mentorship?.mentee?.full_name ?? "—",
  }));

  const [messages, sessionsTotal, reviews, resources, workshops, opportunities] = stats;
  return {
    users,
    mentorships,
    sessions,
    totals: {
      users: users.length,
      mentors: users.filter((u) => u.isMentor).length,
      mentees: users.filter((u) => u.isMentee).length,
      incomplete: users.filter((u) => !u.isMentor && !u.isMentee).length,
      pending: mentorships.filter((m) => m.status === "pending").length,
      active: mentorships.filter((m) => m.status === "accepted").length,
      messages,
      sessions: sessionsTotal,
      reviews,
      resources,
      workshops,
      opportunities,
    },
    errors: [profilesRes.error, authRes.error, mentorshipsRes.error, sessionsRes.error]
      .filter(Boolean)
      .map((e) => e!.message),
  };
}
