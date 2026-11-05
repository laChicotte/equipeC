"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/queries";

export type ActionState = { error?: string; fieldErrors?: Record<string, string[] | undefined> };

const uuid = z.uuid("Identifiant invalide");

const requestSchema = z.object({
  mentor_id: uuid,
  domain_id: z
    .string()
    .transform((v) => (v ? Number(v) : null))
    .pipe(z.number().int().positive().nullable()),
  message: z
    .string()
    .trim()
    .min(20, "Présentez-vous et expliquez votre besoin (20 caractères minimum)")
    .max(1000, "1000 caractères maximum"),
});

/** Un mentoré envoie une demande de mentorat à un mentor. */
export async function requestMentorship(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expirée. Reconnectez-vous." };
  if (profile.role !== "mentee") return { error: "Seuls les mentorés peuvent envoyer une demande." };

  const parsed = requestSchema.safeParse({
    mentor_id: formData.get("mentor_id"),
    domain_id: formData.get("domain_id") ?? "",
    message: formData.get("message") ?? "",
  });
  if (!parsed.success) {
    return { fieldErrors: z.flattenError(parsed.error).fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("mentorships").insert({
    mentee_id: profile.id, // toujours soi-même (RLS le vérifie aussi)
    mentor_id: parsed.data.mentor_id,
    domain_id: parsed.data.domain_id,
    message: parsed.data.message,
  });

  if (error) {
    // 23505 = violation d'unicité : une demande active existe déjà
    if (error.code === "23505") return { error: "Vous avez déjà une demande en cours avec ce mentor." };
    return { error: "La demande n'a pas pu être envoyée. Ce mentor accepte-t-il encore des demandes ?" };
  }

  revalidatePath("/", "layout");
  redirect("/mentorships");
}

const respondSchema = z.object({
  mentorship_id: uuid,
  decision: z.enum(["accepted", "declined"]),
});

/** Le mentor accepte ou refuse une demande. */
export async function respondToRequest(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expirée. Reconnectez-vous." };

  const parsed = respondSchema.safeParse({
    mentorship_id: formData.get("mentorship_id"),
    decision: formData.get("decision"),
  });
  if (!parsed.success) return { error: "Requête invalide." };

  const supabase = await createClient();
  // Le trigger SQL refuse si l'utilisateur n'est pas le mentor de cette demande
  // ou si la demande n'est plus en attente.
  const { data, error } = await supabase
    .from("mentorships")
    .update({ status: parsed.data.decision })
    .eq("id", parsed.data.mentorship_id)
    .eq("mentor_id", profile.id)
    .eq("status", "pending")
    .select("id");

  if (error || !data?.length) {
    return { error: "Action impossible : la demande a peut-être déjà été traitée." };
  }

  revalidatePath("/", "layout");
  return {};
}
