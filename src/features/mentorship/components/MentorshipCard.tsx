import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import {
  DOMAIN_SHORT_LABELS,
  MENTEE_STATUS_LABELS,
  MENTORSHIP_STATUS_LABELS,
} from "@/features/profiles/labels";
import { formatShortDate } from "@/lib/datetime";
import type { MentorshipStatus, UserRole } from "@/types/database";
import { cancelRequest } from "../actions";
import type { MentorshipView } from "../queries";
import { RespondButtons } from "./RespondButtons";

const STATUS_STYLE: Record<MentorshipStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  accepted: "bg-brand-50 text-brand-800 ring-brand-100",
  declined: "bg-zinc-100 text-ink-500 ring-zinc-200",
  ended: "bg-zinc-100 text-ink-500 ring-zinc-200",
  cancelled: "bg-zinc-100 text-ink-500 ring-zinc-200",
};

/**
 * Une relation de mentorat vue par l'un des deux participants.
 * Le mentor voit le mentoré (et peut répondre) ; le mentoré voit le mentor
 * (et peut annuler sa demande tant qu'elle est en attente).
 */
export function MentorshipCard({
  mentorship: m,
  viewerRole,
}: {
  mentorship: MentorshipView;
  viewerRole: UserRole;
}) {
  const isMentor = viewerRole === "mentor";
  const other = isMentor ? m.mentee : m.mentor;
  const subtitle = isMentor
    ? m.mentee.mentee_status && MENTEE_STATUS_LABELS[m.mentee.mentee_status]
    : m.mentor.job_title;
  const open = m.status === "accepted" || m.status === "ended";

  return (
    <article className="flex flex-col gap-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar name={other.full_name} src={other.avatar_url} />
          <div className="min-w-0">
            <p className="truncate font-bold text-ink-900">{other.full_name}</p>
            {subtitle && <p className="truncate text-sm text-ink-500">{subtitle}</p>}
          </div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLE[m.status]}`}>
          {MENTORSHIP_STATUS_LABELS[m.status]}
        </span>
      </div>

      <p className="text-xs font-medium tracking-wide text-ink-500 uppercase">
        Demande du {formatShortDate(m.created_at)}
        {m.domain && <> · {DOMAIN_SHORT_LABELS[m.domain.slug] ?? m.domain.name}</>}
      </p>

      {m.message && (
        <blockquote className="rounded-2xl bg-background px-4 py-3 text-sm whitespace-pre-line text-ink-700">
          {m.message}
        </blockquote>
      )}

      {isMentor && m.status === "pending" && m.mentee.goals_summary && (
        <p className="text-sm text-ink-500">
          <span className="font-semibold text-ink-900">Ses objectifs : </span>
          {m.mentee.goals_summary}
        </p>
      )}

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
        {isMentor && m.status === "pending" && <RespondButtons mentorshipId={m.id} />}
        {open && (
          <Link
            href={`/mentorships/${m.id}`}
            className="flex w-full items-center justify-between font-semibold text-brand-700"
          >
            {m.status === "accepted" ? "Ouvrir l'espace de mentorat" : "Revoir l'historique (lecture seule)"}
            <span aria-hidden>→</span>
          </Link>
        )}
        {!isMentor && m.status === "pending" && (
          <>
            <p className="text-sm text-ink-500">En attente de la réponse du mentor.</p>
            <form action={cancelRequest}>
              <input type="hidden" name="mentorship_id" value={m.id} />
              <button className="text-sm text-ink-500 underline-offset-2 hover:text-red-600 hover:underline">
                Annuler ma demande
              </button>
            </form>
          </>
        )}
        {(m.status === "declined" || m.status === "cancelled") && (
          <p className="text-sm text-ink-500">
            {m.status === "declined"
              ? "Le mentor n'a pas pu donner suite. D'autres mentors peuvent vous accompagner."
              : "Vous avez annulé cette demande."}
          </p>
        )}
      </div>
    </article>
  );
}
