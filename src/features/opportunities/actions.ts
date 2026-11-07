"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/features/auth/queries";
import { todayInConakry } from "@/lib/datetime";

export type OpportunityFormState = {
  error?: string;
  savedAt?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

const optionalText = (max: number) =>
  z.string().trim().max(max, `${max} caractères maximum`).transform((v) => v || null);

const schema = z.object({
  kind: z.enum(
    ["emploi", "stage", "bourse", "financement", "concours", "formation", "evenement", "atelier"],
    "Choisissez un type",
  ),
  title: z.string().trim().min(3, "3 caractères minimum").max(150, "150 caractères maximum"),
  organization: optionalText(120),
  location: optionalText(80),
  description: z
    .string()
    .trim()
    .min(10, "Décrivez l'opportunité (10 caractères minimum)")
    .max(1500, "1500 caractères maximum"),
  url: z
    .string()
    .trim()
    .max(500, "Lien trop long")
    .transform((v) => v || null)
    .refine((v) => v === null || /^https:\/\/\S+$/.test(v), "Le lien doit commencer par https://"),
  deadline: z
    .string()
    .transform((v) => v || null)
    .refine((v) => v === null || /^\d{4}-\d{2}-\d{2}$/.test(v), "Date invalide")
    .refine((v) => v === null || v >= todayInConakry(), "La date limite est déjà passée"),
});

/** Tout utilisateur connecté peut partager une opportunité. */
export async function createOpportunity(
  _prev: OpportunityFormState,
  formData: FormData,
): Promise<OpportunityFormState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Session expirée. Reconnectez-vous." };

  const parsed = schema.safeParse(
    Object.fromEntries(
      ["kind", "title", "organization", "location", "description", "url", "deadline"].map((k) => [
        k,
        formData.get(k) ?? "",
      ]),
    ),
  );
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("opportunities").insert({ ...parsed.data, author_id: userId });
  if (error) return { error: "Publication impossible. Réessayez." };

  revalidatePath("/opportunities");
  return { savedAt: Date.now() };
}

/** L'auteur supprime son opportunité (RLS refuse pour les autres). */
export async function deleteOpportunity(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("opportunity_id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("opportunities").delete().eq("id", id.data);
  revalidatePath("/opportunities");
}

export type ApplicationFormState = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

const applicationSchema = z.object({
  opportunity_id: z.uuid("Offre introuvable"),
  motivation: z
    .string()
    .trim()
    .min(20, "Présentez-vous en quelques phrases (20 caractères minimum)")
    .max(1000, "1000 caractères maximum"),
  contact: z
    .string()
    .trim()
    .min(5, "Indiquez un téléphone ou un e-mail")
    .max(120, "120 caractères maximum"),
});

/**
 * Candidature à une opportunité : motivation + contact, transmis à l'auteur
 * de l'annonce (migration 0008). RLS : pas sur sa propre annonce, date limite.
 */
export async function applyToOpportunity(
  _prev: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const userId = await getCurrentUserId();
  if (!userId) return { error: "Session expirée. Reconnectez-vous." };

  const parsed = applicationSchema.safeParse({
    opportunity_id: formData.get("opportunity_id") ?? "",
    motivation: formData.get("motivation") ?? "",
    contact: formData.get("contact") ?? "",
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("opportunity_applications").insert({ ...parsed.data, applicant_id: userId });
  if (error) {
    if (error.code === "23505") return {}; // déjà candidat
    if (error.code === "PGRST205" || error.code === "42P01") {
      return { error: "Les candidatures ne sont pas encore activées (migration 0008)." };
    }
    if (error.code === "42501") return { error: "Candidature impossible : offre clôturée ou publiée par vous." };
    return { error: "Envoi impossible. Réessayez." };
  }
  revalidatePath("/opportunities");
  return {};
}
