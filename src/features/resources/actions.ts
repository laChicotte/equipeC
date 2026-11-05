"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/queries";

export type ResourceFormState = {
  error?: string;
  savedAt?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

/** Lien facultatif : https uniquement (même règle que la base). */
const httpsUrl = z
  .string()
  .trim()
  .max(500, "Lien trop long")
  .transform((v) => v || null)
  .refine((v) => v === null || /^https:\/\/\S+$/.test(v), "Le lien doit commencer par https://");

const schema = z.object({
  kind: z.enum(["guide", "article", "video", "outil", "modele", "formation"], "Choisissez un type"),
  domain_id: z
    .string()
    .transform((v) => (v ? Number(v) : null))
    .pipe(z.number().int().positive().nullable()),
  title: z.string().trim().min(3, "3 caractères minimum").max(150, "150 caractères maximum"),
  description: z
    .string()
    .trim()
    .min(10, "Expliquez en quoi cette ressource est utile (10 caractères minimum)")
    .max(1000, "1000 caractères maximum"),
  url: httpsUrl,
});

/** Un mentor publie une ressource. */
export async function createResource(
  _prev: ResourceFormState,
  formData: FormData,
): Promise<ResourceFormState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expirée. Reconnectez-vous." };
  if (profile.role !== "mentor") return { error: "Seuls les mentors publient des ressources." };

  const parsed = schema.safeParse({
    kind: formData.get("kind") ?? "",
    domain_id: formData.get("domain_id") ?? "",
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    url: formData.get("url") ?? "",
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("resources").insert({ ...parsed.data, author_id: profile.id });
  if (error) return { error: "Publication impossible. Réessayez." };

  revalidatePath("/resources");
  return { savedAt: Date.now() };
}

/** L'auteur supprime sa ressource (RLS refuse pour les autres). */
export async function deleteResource(formData: FormData) {
  const id = z.uuid().safeParse(formData.get("resource_id"));
  if (!id.success) return;
  const supabase = await createClient();
  await supabase.from("resources").delete().eq("id", id.data);
  revalidatePath("/resources");
}
