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
    ["emploi", "stage", "bourse", "financement", "concours", "formation", "evenement"],
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
