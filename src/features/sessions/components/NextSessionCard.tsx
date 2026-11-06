import Link from "next/link";
import type { UpcomingSession } from "../queries";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { dateTile, formatTimeRange } from "@/lib/datetime";
import type { UserRole } from "@/types/database";

/** Case de date « 20 / FÉV. » sur fond sarcelle clair. */
export function DateTile({ iso }: { iso: string }) {
  const { day, month } = dateTile(iso);
  return (
    <div className="flex size-[72px] shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
      <span className="text-[26px] leading-none font-bold">{day}</span>
      <span className="mt-1 text-[11px] font-bold tracking-wide">{month}</span>
    </div>
  );
}

const clock = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" />
  </svg>
);
const camera = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="6" width="13" height="12" rx="2" />
    <path d="m16 10 5-3v10l-5-3" strokeLinejoin="round" />
  </svg>
);

/** Une séance : case de date, sujet, interlocuteur, horaire, visio. */
export function SessionRow({ session, viewerRole }: { session: UpcomingSession; viewerRole: UserRole }) {
  const other =
    viewerRole === "mentor" ? session.mentorship.mentee.full_name : session.mentorship.mentor.full_name;
  const live = session.phase === "live";

  return (
    <div className="flex flex-wrap items-center gap-5">
      <DateTile iso={session.scheduled_at} />
      <div className="min-w-0 flex-1">
        <p className="text-lg font-semibold text-ink-900">{session.topic || "Séance de mentorat"}</p>
        <p className="mt-0.5 text-sm text-ink-500">
          avec{" "}
          <Link href={`/mentorships/${session.mentorship.id}`} className="hover:text-brand-700 hover:underline">
            {other}
          </Link>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            {clock} {formatTimeRange(session.scheduled_at, session.duration_min)}
          </span>
          <span className="inline-flex items-center gap-1.5">{camera} Visioconférence</span>
        </div>
      </div>
      {session.phase !== "past" && session.phase !== "cancelled" && (
        <Link
          href={`/sessions/${session.id}/visio`}
          className={buttonClasses(live ? "primary" : "secondary", "w-full sm:w-auto")}
        >
          {live ? "Rejoindre la visio" : "Tester la visio"}
        </Link>
      )}
    </div>
  );
}

/** Carte « Prochaine session » de l'accueil. */
export function NextSessionCard({
  sessions,
  viewerRole,
}: {
  sessions: UpcomingSession[];
  viewerRole: UserRole;
}) {
  const [next, ...later] = sessions;

  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow">Prochaine session</p>
        <Link href="/sessions" className="text-sm font-medium text-brand-700 hover:underline">
          Tout voir
        </Link>
      </div>
      <h2 className="mt-3 mb-6 text-2xl font-semibold">Votre rendez-vous</h2>

      {next ? (
        <>
          <SessionRow session={next} viewerRole={viewerRole} />
          {later.length > 0 && (
            <p className="mt-6 border-t border-zinc-100 pt-4 text-sm text-ink-500">
              + {later.length} autre{later.length > 1 ? "s" : ""} séance{later.length > 1 ? "s" : ""} prévue
              {later.length > 1 ? "s" : ""}
            </p>
          )}
        </>
      ) : (
        <p className="text-ink-500">
          Aucune séance prévue. Planifiez-en une depuis{" "}
          <Link href="/mentorships" className="font-medium text-brand-700 hover:underline">
            un mentorat actif
          </Link>
          .
        </p>
      )}
    </Card>
  );
}
