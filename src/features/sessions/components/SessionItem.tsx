import { cancelSession } from "../actions";
import { DURATION_LABELS } from "../constants";
import type { SessionWithPhase } from "../queries";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/datetime";

/** Lien vers la salle de visio (Jitsi Meet), ouvert dans un nouvel onglet. */
export function JoinLink({ session }: { session: SessionWithPhase }) {
  const live = session.phase === "live";
  return (
    <a
      href={session.meeting_url}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses(live ? "primary" : "secondary", "w-full sm:w-auto")}
    >
      🎥 {live ? "Rejoindre la visio" : "Lien de la visio"}
    </a>
  );
}

const PHASE_BADGE = {
  upcoming: <Badge tone="accent">À venir</Badge>,
  live: <Badge tone="brand">En cours</Badge>,
  past: <Badge>Passée</Badge>,
  cancelled: <Badge>Annulée</Badge>,
};

/** Une séance dans l'espace de mentorat. */
export function SessionItem({
  session,
  canManage,
}: {
  session: SessionWithPhase;
  canManage: boolean;
}) {
  const open = session.phase === "upcoming" || session.phase === "live";
  const duration =
    DURATION_LABELS[session.duration_min as keyof typeof DURATION_LABELS] ??
    `${session.duration_min} min`;

  return (
    <li
      className={`flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 ${open ? "bg-white" : "bg-zinc-50"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={`text-sm font-medium first-letter:uppercase ${
              session.phase === "cancelled" ? "text-zinc-400 line-through" : ""
            }`}
          >
            {formatDateTime(session.scheduled_at)}
          </p>
          <p className="text-xs text-zinc-500">
            {duration}
            {session.topic && <> · {session.topic}</>}
          </p>
        </div>
        {PHASE_BADGE[session.phase]}
      </div>

      {open && (
        <div className="flex flex-wrap items-center gap-2">
          <JoinLink session={session} />
          {canManage && (
            <form action={cancelSession}>
              <input type="hidden" name="session_id" value={session.id} />
              <input type="hidden" name="mentorship_id" value={session.mentorship_id} />
              <button className="rounded-lg px-2 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-red-600">
                Annuler la séance
              </button>
            </form>
          )}
        </div>
      )}
    </li>
  );
}
