// Lecture des objectifs d'un mentorat (côté serveur).
// RLS : uniquement les participants du mentorat.
import { createClient } from "@/lib/supabase/server";
import { todayInConakry } from "@/lib/datetime";
import type { Goal } from "@/types/database";

/** « En retard » est calculé à la lecture (les composants restent purs). */
export type GoalView = Goal & { overdue: boolean };

export type GoalsSummary = { goals: GoalView[]; done: number; total: number; percent: number };

const STATUS_ORDER = { in_progress: 0, todo: 1, done: 2 } as const;

/** Objectifs triés : en cours, puis à faire (par échéance), puis faits. */
export async function getGoals(mentorshipId: string): Promise<GoalsSummary> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("goals")
    .select("id, mentorship_id, title, status, due_date, created_at, updated_at")
    .eq("mentorship_id", mentorshipId)
    .order("created_at");

  const today = todayInConakry();
  const goals = ((data ?? []) as Goal[])
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
