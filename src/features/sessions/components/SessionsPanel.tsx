import { getSessions } from "../queries";
import { SessionForm } from "./SessionForm";
import { SessionItem } from "./SessionItem";
import { Card } from "@/components/ui/Card";
import { nowAsConakryInput } from "@/lib/datetime";

/** Bloc « Séances » de l'espace de mentorat : liste + planification. */
export async function SessionsPanel({
  mentorshipId,
  isActive,
}: {
  mentorshipId: string;
  /** Mentorat accepté : on peut planifier et annuler */
  isActive: boolean;
}) {
  const sessions = await getSessions(mentorshipId);
  const upcoming = sessions.filter((s) => s.phase === "upcoming" || s.phase === "live");
  const others = sessions.filter((s) => !upcoming.includes(s)).reverse();

  return (
    <Card>
      <h2 className="mb-3 font-semibold">Séances</h2>

      {upcoming.length > 0 ? (
        <ul className="mb-4 flex flex-col gap-2">
          {upcoming.map((s) => (
            <SessionItem key={s.id} session={s} canManage={isActive} />
          ))}
        </ul>
      ) : (
        <p className="mb-4 text-sm text-zinc-600">Aucune séance prévue.</p>
      )}

      {isActive && (
        <details className="group rounded-xl border border-zinc-200 p-3" open={sessions.length === 0}>
          <summary className="cursor-pointer text-sm font-medium text-brand-700">
            + Planifier une séance en visio
          </summary>
          <div className="mt-3">
            <SessionForm mentorshipId={mentorshipId} minDate={nowAsConakryInput()} />
          </div>
        </details>
      )}

      {others.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-zinc-600">
            Séances passées ou annulées ({others.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-2">
            {others.map((s) => (
              <SessionItem key={s.id} session={s} canManage={false} />
            ))}
          </ul>
        </details>
      )}
    </Card>
  );
}
