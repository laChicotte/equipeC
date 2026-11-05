"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/features/auth/queries";
import { conakryInputToISO } from "@/lib/datetime";
import { DURATIONS } from "./constants";

export type SessionFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const createSchema = z.object({
  mentorship_id: z.uuid(),
  scheduled_at: z
    .string()
    .transform((value, ctx) => {
      const iso = conakryInputToISO(value);
      if (!iso) {
        ctx.addIssue({ code: "custom", message: "Date et heure requises" });
        return z.NEVER;
      }
      return iso;
    })
    .refine((iso) => new Date(iso).getTime() > Date.now() - 5 * 60_000, {
      message: "Choisissez une date à venir",
    })
    .refine((iso) => new Date(iso).getTime() < Date.now() + 365 * 86_400_000, {
      message: "Date trop lointaine (un an maximum)",
    }),
  duration_min: z.coerce
    .number()
    .refine((n) => (DURATIONS as readonly number[]).includes(n), "Durée invalide"),
  topic: z
    .string()
    .trim()
    .max(200, "200 caractères maximum")
    .transform((v) => v || null),
});

/** Planifie une séance. Le lien de visio est généré par la base, jamais par le client. */
export async function createSession(
  _prev: SessionFormState,
  formData: FormData,
): Promise<SessionFormState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Session expirée. Reconnectez-vous." };

  const parsed = createSchema.safeParse({
    mentorship_id: formData.get("mentorship_id"),
    scheduled_at: formData.get("scheduled_at") ?? "",
    duration_min: formData.get("duration_min"),
    topic: formData.get("topic") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  // RLS : uniquement dans un mentorat ACCEPTÉ dont on est participant
  const { error } = await supabase.from("sessions").insert({ ...parsed.data, created_by: userId });
  if (error) return { error: "Impossible de planifier : ce mentorat est-il toujours actif ?" };

  revalidatePath(`/mentorships/${parsed.data.mentorship_id}`);
  revalidatePath("/dashboard");
  return { success: "Séance planifiée. Elle apparaît chez vous deux." };
}

export type ReviewFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const reviewSchema = z.object({
  session_id: z.uuid(),
  mentorship_id: z.uuid(),
  rating: z.coerce
    .number("Choisissez une note")
    .int()
    .min(1, "Choisissez une note de 1 à 5")
    .max(5, "Choisissez une note de 1 à 5"),
  comment: z
    .string()
    .trim()
    .max(1000, "1000 caractères maximum")
    .transform((v) => v || null),
});

/**
 * Évalue une séance passée (une seule fois par participant).
 * RLS vérifie : participant du mentorat, séance passée et non annulée.
 */
export async function submitReview(
  _prev: ReviewFormState,
  formData: FormData,
): Promise<ReviewFormState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Session expirée. Reconnectez-vous." };

  const parsed = reviewSchema.safeParse({
    session_id: formData.get("session_id"),
    mentorship_id: formData.get("mentorship_id"),
    rating: formData.get("rating") ?? undefined,
    comment: formData.get("comment") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const { mentorship_id, ...review } = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("session_reviews")
    .insert({ ...review, reviewer_id: userId });

  if (error) {
    if (error.code === "23505") return { error: "Vous avez déjà évalué cette séance." };
    return { error: "Évaluation impossible : la séance doit être passée et non annulée." };
  }

  revalidatePath(`/mentorships/${mentorship_id}`);
  revalidatePath("/mentors", "layout"); // la note moyenne du mentor change
  return {};
}

/** Annule une séance prévue. */
export async function cancelSession(formData: FormData) {
  const parsed = z
    .object({ session_id: z.uuid(), mentorship_id: z.uuid() })
    .safeParse({ session_id: formData.get("session_id"), mentorship_id: formData.get("mentorship_id") });
  if (!parsed.success) return;

  const supabase = await createClient();
  await supabase
    .from("sessions")
    .update({ status: "cancelled" })
    .eq("id", parsed.data.session_id)
    .eq("mentorship_id", parsed.data.mentorship_id)
    .eq("status", "scheduled");

  revalidatePath(`/mentorships/${parsed.data.mentorship_id}`);
  revalidatePath("/dashboard");
}
