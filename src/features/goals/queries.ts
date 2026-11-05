// Lecture des objectifs d'un mentorat (côté serveur).
// RLS : uniquement les participants du mentorat.
import { createClient } from "@/lib/supabase/server";
import { todayInConakry } from "@/lib/datetime";
import type { Goal } from "@/types/database";

/** « En retard » est calculé à la lecture (les composants restent purs). */
export type GoalView = Goal & { overdue: boolean };

export type GoalsSummary = { goals: GoalView[]; done: number; total: number; percent: number };

const STATUS_ORDER = { in_progress: 0, todo: 1, done: 2 } as const;

/** Calcule retard, tri (en cours, à faire par échéance, faits) et progression. */
function summarize<T extends Goal>(rows: T[]) {
  const today = todayInConakry();
  const goals = rows
    .map((g) => ({ ...g, overdue: g.status !== "done" && g.due_date !== null && g.due_date < today }))
    .sort(
      (a, b) =>
        STATUS_ORDER[a.status] - STATUS_ORDER[b.status] ||
        (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"),
    );
  const done = goals.filter((g) => g.status === "done").length;
  const total = goals.length;
  return { goals, done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

const GOAL_COLUMNS = "id, mentorship_id, title, status, due_date, created_at, updated_at";

/** Objectifs d'un mentorat. */
export async function getGoals(mentorshipId: string): Promise<GoalsSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select(GOAL_COLUMNS)
    .eq("mentorship_id", mentorshipId)
    .order("created_at");
  return summarize((data ?? []) as Goal[]);
}

export type JourneyGoal = GoalView & {
  mentorship: {
    id: string;
    status: "pending" | "accepted" | "declined" | "ended";
    mentor: { full_name: string };
    mentee: { full_name: string };
  };
};

/** Un « parcours » = les objectifs d'un mentorat, avec sa progression. */
export type Journey = {
  mentorshipId: string;
  active: boolean;
  mentorName: string;
  menteeName: string;
  goals: JourneyGoal[];
  done: number;
  total: number;
  percent: number;
  /** Objectif à travailler maintenant (en cours, sinon premier à faire) */
  current: JourneyGoal | null;
  /** L'étape suivante après l'objectif courant */
  next: JourneyGoal | null;
};

/** Tous mes objectifs, regroupés par mentorat (page « Mes objectifs », accueil). */
export async function getMyJourneys(): Promise<Journey[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select(
      `${GOAL_COLUMNS},
       mentorship:mentorships (
         id, status,
         mentor:profiles!mentorships_mentor_id_fkey ( full_name ),
         mentee:profiles!mentorships_mentee_id_fkey ( full_name )
       )`,
    )
    .order("created_at");

  const byMentorship = new Map<string, JourneyGoal[]>();
  for (const goal of (data ?? []) as unknown as JourneyGoal[]) {
    const list = byMentorship.get(goal.mentorship_id) ?? [];
    list.push(goal);
    byMentorship.set(goal.mentorship_id, list);
  }

  return [...byMentorship.values()]
    .map((rows) => {
      const { goals, done, total, percent } = summarize(rows) as {
        goals: JourneyGoal[];
        done: number;
        total: number;
        percent: number;
      };
      const open = goals.filter((g) => g.status !== "done");
      const m = rows[0].mentorship;
      return {
        mentorshipId: m.id,
        active: m.status === "accepted",
        mentorName: m.mentor.full_name,
        menteeName: m.mentee.full_name,
        goals,
        done,
        total,
        percent,
        current: open[0] ?? null,
        next: open[1] ?? null,
      };
    })
    .sort((a, b) => Number(b.active) - Number(a.active) || a.percent - b.percent);
}
