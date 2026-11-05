"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/queries";

export type TestimonialFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const schema = z.object({
  mentorship_id: z.uuid(),
  content: z
    .string()
    .trim()
    .min(20, "Quelques phrases suffisent (20 caractères minimum)")
    .max(1000, "1000 caractères maximum"),
  is_public: z.boolean(),
});

/**
 * Enregistre (ou met à jour) le bilan de fin de mentorat de l'utilisateur.
 * RLS : uniquement pour un mentorat TERMINÉ dont on est membre.
 */
export async function saveTestimonial(_prev: TestimonialFormState, formData: FormData): Promise<TestimonialFormState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expirée. Reconnectez-vous." };

  const parsed = schema.safeParse({
    mentorship_id: formData.get("mentorship_id"),
    content: formData.get("content") ?? "",
    is_public: formData.get("is_public") === "on",
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const { mentorship_id, content, is_public } = parsed.data;
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("mentorship_testimonials")
    .select("id")
    .eq("mentorship_id", mentorship_id)
    .eq("author_id", profile.id)
    .maybeSingle();

  const { error } = existing
    ? await supabase.from("mentorship_testimonials").update({ content, is_public }).eq("id", existing.id)
    : await supabase.from("mentorship_testimonials").insert({ mentorship_id, author_id: profile.id, content, is_public });
  if (error) return { error: "Enregistrement impossible : le mentorat est-il bien terminé ?" };

  revalidatePath(`/mentorships/${mentorship_id}`);
  revalidatePath("/impact");
  return { success: is_public ? "Bilan enregistré et partagé dans « Impact »." : "Bilan enregistré (privé)." };
}
