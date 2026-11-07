import { getReviewsForSessions, getSessions } from "../queries";
import { SessionForm } from "./SessionForm";
import { SessionItem } from "./SessionItem";
import { Card } from "@/components/ui/Card";
import { nowAsConakryInput } from "@/lib/datetime";
import { CalendarIcon } from "@/components/ui/icons";

/** Bloc « Séances » de l'espace de mentorat : à venir, à évaluer, historique. */
export async function SessionsPanel({
  mentorshipId,
  isActive,
  currentUserId,
  names,
}: {
  mentorshipId: string;
  /** Mentorat accepté : on peut planifier et annuler */
  isActive: boolean;
  currentUserId: string;
  /** Noms des participants, indexés par identifiant */
  names: Record<string, string>;
}) {
  const sessions = await getSessions(mentorshipId);
  const reviews = await getReviewsForSessions(
    sessions.filter((s) => s.phase === "past").map((s) => s.id),
  );
  const reviewsOf = (sessionId: string) => reviews.filter((r) => r.session_id === sessionId);
  const iReviewed = (sessionId: string) =>
    reviews.some((r) => r.session_id === sessionId && r.reviewer_id === currentUserId);

  const upcoming = sessions.filter((s) => s.phase === "upcoming" || s.phase === "live");
  // Séances passées que je n'ai pas encore notées : restent bien visibles
  const toReview = sessions.filter((s) => s.phase === "past" && !iReviewed(s.id)).reverse();
  const history = sessions
    .filter((s) => !upcoming.includes(s) && !toReview.includes(s))
    .reverse();

  const item = (s: (typeof sessions)[number], canManage: boolean) => (
    <SessionItem
      key={s.id}
      session={s}
      canManage={canManage}
      reviews={reviewsOf(s.id)}
      currentUserId={currentUserId}
      names={names}
    />
  );

  return (
    <Card>
      <h2 className="mb-3 flex items-center gap-2.5 text-lg font-bold">
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <CalendarIcon className="size-5" />
        </span>
        Séances
      </h2>

      {upcoming.length > 0 ? (
        <ul className="mb-4 flex flex-col gap-2">{upcoming.map((s) => item(s, isActive))}</ul>
      ) : (
        <p className="mb-4 text-sm text-ink-500">Aucune séance prévue.</p>
      )}

      {toReview.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-amber-800">
            À évaluer ({toReview.length})
          </h3>
          <ul className="flex flex-col gap-2">{toReview.map((s) => item(s, false))}</ul>
        </section>
      )}

      {isActive && (
        <details className="group rounded-xl border border-slate-200 p-3" open={sessions.length === 0}>
          <summary className="cursor-pointer text-sm font-medium text-brand-700">
            + Planifier une séance en visio
          </summary>
          <div className="mt-3">
            <SessionForm mentorshipId={mentorshipId} minDate={nowAsConakryInput()} />
          </div>
        </details>
      )}

      {history.length > 0 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-ink-500">
            Séances passées ou annulées ({history.length})
          </summary>
          <ul className="mt-2 flex flex-col gap-2">{history.map((s) => item(s, false))}</ul>
        </details>
      )}
    </Card>
  );
}
