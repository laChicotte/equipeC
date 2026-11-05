"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/features/auth/queries";
import { conakryInputToISO } from "@/lib/datetime";
import { WORKSHOP_DURATIONS } from "./constants";

export type WorkshopFormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type WorkshopActionState = { error?: string };

const createSchema = z.object({
  title: z.string().trim().min(3, "3 caractères minimum").max(120, "120 caractères maximum"),
  description: z.string().trim().min(10, "Décrivez l'atelier en quelques mots (10 caractères minimum)").max(1000),
  domain_id: z
    .string()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0), "Domaine invalide"),
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
    .refine((iso) => new Date(iso).getTime() > Date.now() + 30 * 60_000, {
      message: "Prévoyez l'atelier au moins 30 minutes à l'avance",
    })
    .refine((iso) => new Date(iso).getTime() < Date.now() + 365 * 86_400_000, {
      message: "Date trop lointaine (un an maximum)",
    }),
  duration_min: z.coerce
    .number()
    .refine((n) => (WORKSHOP_DURATIONS as readonly number[]).includes(n), "Durée invalide"),
  capacity: z.coerce
    .number("Nombre attendu")
    .int("Nombre entier attendu")
    .min(2, "2 places minimum")
    .max(100, "100 places maximum"),
});

/** Un mentor organise un atelier. Le lien de visio est généré par la base. */
export async function createWorkshop(_prev: WorkshopFormState, formData: FormData): Promise<WorkshopFormState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Session expirée. Reconnectez-vous." };
  if (profile.role !== "mentor") return { error: "Seuls les mentors peuvent organiser un atelier." };

  const parsed = createSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    domain_id: formData.get("domain_id") ?? "",
    scheduled_at: formData.get("scheduled_at") ?? "",
    duration_min: formData.get("duration_min"),
    capacity: formData.get("capacity"),
  });
  if (!parsed.success) return { fieldErrors: z.flattenError(parsed.error).fieldErrors };

  const supabase = await createClient();
  // RLS : host_id doit être l'utilisateur connecté, et son rôle « mentor »
  const { error } = await supabase.from("workshops").insert({ ...parsed.data, host_id: profile.id });
  if (error) return { error: "Création impossible. Réessayez." };

  revalidatePath("/workshops");
  return { success: "Atelier publié : les membres peuvent s'inscrire." };
}

const idSchema = z.uuid();

/** Messages des règles SQL (trigger d'inscription) affichés tels quels. */
const KNOWN_ERRORS = ["Atelier complet", "Atelier annulé", "Atelier déjà commencé ou passé", "Vous animez cet atelier"];

export async function registerToWorkshop(_prev: WorkshopActionState, formData: FormData): Promise<WorkshopActionState> {
  const id = idSchema.safeParse(formData.get("workshop_id"));
  const profile = await getCurrentProfile();
  if (!id.success || !profile) return { error: "Session expirée. Reconnectez-vous." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("workshop_registrations")
    .insert({ workshop_id: id.data, participant_id: profile.id });
  if (error) {
    if (error.code === "23505") return {}; // déjà inscrit
    const known = KNOWN_ERRORS.find((m) => error.message.includes(m));
    return { error: known ? `${known}.` : "Inscription impossible. Réessayez." };
  }
  revalidatePath("/workshops");
  revalidatePath("/dashboard");
  return {};
}

export async function unregisterFromWorkshop(_prev: WorkshopActionState, formData: FormData): Promise<WorkshopActionState> {
  const id = idSchema.safeParse(formData.get("workshop_id"));
  const profile = await getCurrentProfile();
  if (!id.success || !profile) return { error: "Session expirée. Reconnectez-vous." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("workshop_registrations")
    .delete()
    .eq("workshop_id", id.data)
    .eq("participant_id", profile.id);
  if (error) return { error: "Désinscription impossible. Réessayez." };
  revalidatePath("/workshops");
  revalidatePath("/dashboard");
  return {};
}

/** L'animateur annule son atelier (les inscrits le voient « Annulé »). */
export async function cancelWorkshop(_prev: WorkshopActionState, formData: FormData): Promise<WorkshopActionState> {
  const id = idSchema.safeParse(formData.get("workshop_id"));
  const profile = await getCurrentProfile();
  if (!id.success || !profile) return { error: "Session expirée. Reconnectez-vous." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workshops")
    .update({ cancelled: true })
    .eq("id", id.data)
    .eq("host_id", profile.id)
    .select("id");
  if (error || !data?.length) return { error: "Annulation impossible." };
  revalidatePath("/workshops");
  return {};
}
