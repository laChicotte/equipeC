// Lecture des ateliers thématiques (côté serveur). Migration 0005.
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserId } from "@/features/auth/queries";
import type { Workshop } from "@/types/database";
import type { WorkshopLevel } from "./constants";

/** On peut rejoindre la visio 15 minutes avant le début (comme les séances). */
const JOIN_EARLY_MS = 15 * 60_000;

export type WorkshopPhase = "upcoming" | "live" | "past" | "cancelled";

export type WorkshopView = Workshop & {
  domain: { name: string; slug: string } | null;
  host: { id: string; full_name: string; job_title: string | null } | null;
  registered: number;
  isRegistered: boolean;
  isHost: boolean;
  phase: WorkshopPhase;
  /** Lien de visio : seulement pour l'animateur et les inscrits, atelier non terminé */
  meetingUrl: string | null;
  /** Inscrits (prénom, niveau, attentes) : seulement pour l'animateur */
  participants: WorkshopParticipant[];
};

export type WorkshopParticipant = {
  first_name: string;
  /** null : inscription antérieure à la migration 0008 */
  level: WorkshopLevel | null;
  expectations: string | null;
};

export type WorkshopsResult =
  | { ready: true; upcoming: WorkshopView[]; past: WorkshopView[] }
  | { ready: false };

const COLUMNS = `id, host_id, domain_id, title, description, scheduled_at, duration_min, capacity, cancelled, created_at,
  domain:domains ( name, slug ),
  host:profiles!workshops_host_id_fkey ( id, full_name, job_title )`;

function phaseOf(w: Workshop, now: number): WorkshopPhase {
  if (w.cancelled) return "cancelled";
  const start = new Date(w.scheduled_at).getTime();
  const end = start + w.duration_min * 60_000;
  if (end < now) return "past";
  return now >= start - JOIN_EARLY_MS ? "live" : "upcoming";
}

/**
 * Ateliers à venir (et en cours) + ateliers des 60 derniers jours.
 * `ready: false` si la migration 0005 n'a pas encore été exécutée.
 */
export async function getWorkshops(): Promise<WorkshopsResult> {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  const now = Date.now();
  const since = new Date(now - 60 * 86_400_000).toISOString();

  const [{ data, error }, counts, mine] = await Promise.all([
    supabase.from("workshops").select(COLUMNS).gte("scheduled_at", since).order("scheduled_at"),
    supabase.rpc("get_workshop_counts"),
    supabase.from("workshop_registrations").select("workshop_id").eq("participant_id", userId ?? ""),
  ]);
  // Table absente (migration 0005 non exécutée) ; toute autre erreur est remontée
  if (error?.code === "PGRST205" || error?.code === "42P01") return { ready: false };
  if (error) throw new Error(`Lecture des ateliers impossible : ${error.message}`);

  const countMap = new Map(
    ((counts.data ?? []) as { workshop_id: string; registered: number }[]).map((c) => [c.workshop_id, c.registered]),
  );
  const myIds = new Set(((mine.data ?? []) as { workshop_id: string }[]).map((r) => r.workshop_id));

  const rows = (data ?? []) as unknown as (Workshop & Pick<WorkshopView, "domain" | "host">)[];
  const views = await Promise.all(
    rows.map(async (w): Promise<WorkshopView> => {
      const phase = phaseOf(w, now);
      const isHost = w.host_id === userId;
      const isRegistered = myIds.has(w.id);
      const [link, people] = await Promise.all([
        (isHost || isRegistered) && (phase === "upcoming" || phase === "live")
          ? supabase.rpc("get_workshop_link", { p_workshop_id: w.id })
          : Promise.resolve({ data: null }),
        isHost && phase !== "cancelled"
          ? supabase.rpc("get_workshop_participants", { p_workshop_id: w.id })
          : Promise.resolve({ data: [] }),
      ]);
      return {
        ...w,
        registered: countMap.get(w.id) ?? 0,
        isRegistered,
        isHost,
        phase,
        meetingUrl: (link.data as string | null) ?? null,
        participants: ((people.data ?? []) as Partial<WorkshopParticipant>[]).map((p) => ({
          first_name: p.first_name ?? "",
          level: p.level ?? null,
          expectations: p.expectations ?? null,
        })),
      };
    }),
  );

  return {
    ready: true,
    // Un atelier annulé ne reste visible que pour son animateur et ses inscrits
    upcoming: views.filter(
      (w) =>
        w.phase === "upcoming" ||
        w.phase === "live" ||
        (w.phase === "cancelled" && (w.isHost || w.isRegistered) && new Date(w.scheduled_at).getTime() > now),
    ),
    past: views.filter((w) => w.phase === "past").reverse(),
  };
}
