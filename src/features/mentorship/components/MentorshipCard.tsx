import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { MENTEE_STATUS_LABELS, MENTORSHIP_STATUS_LABELS } from "@/features/profiles/labels";
import { formatShortDate } from "@/lib/datetime";
import type { UserRole } from "@/types/database";
import type { MentorshipView } from "../queries";
import { RespondButtons } from "./RespondButtons";

const STATUS_TONE = {
  pending: "accent",
  accepted: "brand",
  declined: "neutral",
  ended: "neutral",
} as const;


/**
 * Une relation de mentorat vue par l'un des deux participants.
 * Le mentor voit le mentoré (et peut répondre) ; le mentoré voit le mentor.
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

  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={other.full_name} />
          <div>
            <p className="font-semibold">{other.full_name}</p>
            {subtitle && <p className="text-sm text-zinc-600">{subtitle}</p>}
          </div>
        </div>
        <Badge tone={STATUS_TONE[m.status]}>{MENTORSHIP_STATUS_LABELS[m.status]}</Badge>
      </div>

      <p className="text-xs text-zinc-500">
        Demande du {formatShortDate(m.created_at)}
        {m.domain && <> · {m.domain.name}</>}
      </p>

      {m.message && (
        <blockquote className="rounded-lg bg-zinc-50 px-3 py-2 text-sm whitespace-pre-line text-zinc-700">
          {m.message}
        </blockquote>
      )}

      {isMentor && m.status === "pending" && m.mentee.goals_summary && (
        <p className="text-sm text-zinc-600">
          <span className="font-medium text-zinc-800">Ses objectifs : </span>
          {m.mentee.goals_summary}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {isMentor && m.status === "pending" && <RespondButtons mentorshipId={m.id} />}
        {m.status === "accepted" && (
          <Link
            href={`/mentorships/${m.id}`}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            Ouvrir l&apos;espace de mentorat →
          </Link>
        )}
        {!isMentor && m.status === "pending" && (
          <p className="text-sm text-zinc-500">En attente de la réponse du mentor.</p>
        )}
      </div>
    </article>
  );
}
