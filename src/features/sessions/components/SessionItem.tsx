import Link from "next/link";
import { cancelSession } from "../actions";
import { DURATION_LABELS } from "../constants";
import type { SessionWithPhase } from "../queries";
import { ReviewForm } from "./ReviewForm";
import type { SessionReview } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/datetime";

/** Lien vers la salle de visio intégrée à l'application (Jitsi reste proposé en secours dans la salle). */
export function JoinLink({ session }: { session: SessionWithPhase }) {
  const live = session.phase === "live";
  return (
    <Link
      href={`/sessions/${session.id}/visio`}
      className={buttonClasses(live ? "primary" : "secondary", "w-full sm:w-auto")}
    >
      🎥 {live ? "Rejoindre la visio" : "Tester la visio"}
    </Link>
  );
}

const PHASE_BADGE = {
  upcoming: <Badge tone="accent">À venir</Badge>,
  live: <Badge tone="brand">En cours</Badge>,
  past: <Badge>Passée</Badge>,
  cancelled: <Badge>Annulée</Badge>,
};

function Stars({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} sur 5`} className="tracking-tight text-accent-500">
      {"★".repeat(rating)}
      <span className="text-slate-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

/** Avis donnés sur une séance passée + formulaire si je n'ai pas encore noté. */
function ReviewsBlock({
  session,
  reviews,
  currentUserId,
  names,
}: {
  session: SessionWithPhase;
  reviews: SessionReview[];
  currentUserId: string;
  names: Record<string, string>;
}) {
  const mine = reviews.find((r) => r.reviewer_id === currentUserId);
  const others = reviews.filter((r) => r.reviewer_id !== currentUserId);

  return (
    <div className="flex flex-col gap-2 text-sm">
      {mine ? (
        <p>
          <span className="text-ink-500">Votre avis : </span>
          <Stars rating={mine.rating} />
          {mine.comment && <span className="text-ink-500"> — {mine.comment}</span>}
        </p>
      ) : (
        <ReviewForm sessionId={session.id} mentorshipId={session.mentorship_id} />
      )}
      {others.map((r) => (
        <p key={r.id}>
          <span className="text-ink-500">Avis de {names[r.reviewer_id] ?? "l'autre participant"} : </span>
          <Stars rating={r.rating} />
          {r.comment && <span className="text-ink-500"> — {r.comment}</span>}
        </p>
      ))}
    </div>
  );
}

/** Une séance dans l'espace de mentorat. */
export function SessionItem({
  session,
  canManage,
  reviews = [],
  currentUserId,
  names = {},
}: {
  session: SessionWithPhase;
  canManage: boolean;
  reviews?: SessionReview[];
  /** Fourni pour afficher/permettre l'évaluation des séances passées */
  currentUserId?: string;
  names?: Record<string, string>;
}) {
  const open = session.phase === "upcoming" || session.phase === "live";
  const duration =
    DURATION_LABELS[session.duration_min as keyof typeof DURATION_LABELS] ??
    `${session.duration_min} min`;

  return (
    <li
      className={`flex flex-col gap-2 rounded-xl border border-slate-200 p-3 ${open ? "bg-white" : "bg-slate-50"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p
            className={`text-sm font-medium first-letter:uppercase ${
              session.phase === "cancelled" ? "text-slate-400 line-through" : ""
            }`}
          >
            {formatDateTime(session.scheduled_at)}
          </p>
          <p className="text-xs text-ink-500">
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
              <button className="rounded-lg px-2 py-1.5 text-xs text-ink-500 hover:bg-slate-100 hover:text-red-600">
                Annuler la séance
              </button>
            </form>
          )}
        </div>
      )}

      {session.phase === "past" && currentUserId && (
        <ReviewsBlock
          session={session}
          reviews={reviews}
          currentUserId={currentUserId}
          names={names}
        />
      )}
    </li>
  );
}
