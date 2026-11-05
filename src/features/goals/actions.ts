"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/features/auth/queries";
import { todayInConakry } from "@/lib/datetime";
import { GOAL_TEMPLATES } from "./templates";

export type GoalFormState = {
  error?: string;
  /** Change à chaque ajout réussi : sert à vider le formulaire */
  savedAt?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

const createSchema = z.object({
  mentorship_id: z.uuid(),
  title: z
    .string()
    .trim()
    .min(3, "Décrivez l'objectif (3 caractères minimum)")
    .max(200, "200 caractères maximum"),
  due_date: z
    .string()
    .transform((v) => v || null)
    .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Date invalide")
    .refine((v) => v === null || v >= todayInConakry(), "L'échéance doit être aujourd'hui ou plus tard"),
});

/** Ajoute un objectif (RLS : mentorat accepté dont on est participant). */
export async function createGoal(_prev: GoalFormState, formData: FormData): Promise<GoalFormState> {
  if (!(await getCurrentUserId())) return { error: "Session expirée. Reconnectez-vous." };

  const parsed = createSchema.safeParse({
    mentorship_id: formData.get("mentorship_id"),
    title: formData.get("title") ?? "",
    due_date: formData.get("due_date") ?? "",
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("goals").insert(parsed.data);
  if (error) return { error: "Ajout impossible : ce mentorat est-il toujours actif ?" };

  revalidatePath(`/mentorships/${parsed.data.mentorship_id}`);
  return { savedAt: Date.now() };
}

/**
 * Ajoute un objectif du « parcours suggéré » en un clic. Le titre doit faire
 * partie des modèles connus (on n'accepte pas un texte arbitraire ici).
 */
export async function addSuggestedGoal(formData: FormData) {
  const parsed = z
    .object({ mentorship_id: z.uuid(), title: z.string().trim().min(3).max(200) })
    .safeParse({ mentorship_id: formData.get("mentorship_id"), title: formData.get("title") });
  if (!parsed.success || !(await getCurrentUserId())) return;
  if (!Object.values(GOAL_TEMPLATES).some((list) => list.includes(parsed.data.title))) return;

  const supabase = await createClient();
  // RLS : uniquement dans un mentorat accepté dont on est participant
  await supabase.from("goals").insert(parsed.data);
  revalidatePath(`/mentorships/${parsed.data.mentorship_id}`);
}

const updateSchema = z.object({
  goal_id: z.uuid(),
  mentorship_id: z.uuid(),
  status: z.enum(["todo", "in_progress", "done"]),
});

/** Change l'état d'un objectif (À faire / En cours / Fait). */
export async function setGoalStatus(formData: FormData) {
  const parsed = updateSchema.safeParse({
    goal_id: formData.get("goal_id"),
    mentorship_id: formData.get("mentorship_id"),
    status: formData.get("status"),
  });
  if (!parsed.success || !(await getCurrentUserId())) return;

  const supabase = await createClient();
  await supabase
    .from("goals")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.goal_id)
    .eq("mentorship_id", parsed.data.mentorship_id);

  revalidatePath(`/mentorships/${parsed.data.mentorship_id}`);
}

/** Supprime un objectif. */
export async function deleteGoal(formData: FormData) {
  const parsed = updateSchema
    .omit({ status: true })
    .safeParse({ goal_id: formData.get("goal_id"), mentorship_id: formData.get("mentorship_id") });
  if (!parsed.success || !(await getCurrentUserId())) return;

  const supabase = await createClient();
  await supabase
    .from("goals")
    .delete()
    .eq("id", parsed.data.goal_id)
    .eq("mentorship_id", parsed.data.mentorship_id);

  revalidatePath(`/mentorships/${parsed.data.mentorship_id}`);
}
