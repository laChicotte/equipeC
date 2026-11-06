import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/queries";
import { getSessionForCall } from "@/features/sessions/queries";
import { VideoCall } from "@/features/sessions/components/VideoCall";
import { Card } from "@/components/ui/Card";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { formatDay, formatTimeRange } from "@/lib/datetime";

export const metadata: Metadata = { title: "Visio · MentorConnect" };

/** Salle de visio intégrée d'une séance de mentorat (mentor ↔ mentoré). */
export default async function VisioPage({ params }: PageProps<"/sessions/[id]/visio">) {
  const { id } = await params;
  const [profile, session] = await Promise.all([getCurrentProfile(), getSessionForCall(id)]);
  if (!profile) redirect("/login");
  // Séance introuvable OU pas participant (RLS) : même réponse
  if (!session) notFound();

  const { mentorship } = session;
  const isMentor = mentorship.mentor_id === profile.id;
  const partner = isMentor ? mentorship.mentee : mentorship.mentor;
  const backHref = `/mentorships/${mentorship.id}`;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            href={backHref}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-500 transition-colors hover:text-ink-900"
          >
            <ArrowLeftIcon className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Espace de mentorat
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{session.topic || "Séance de mentorat"}</h1>
          <p className="mt-1 text-ink-500">
            avec {partner.full_name} · {formatDay(session.scheduled_at)}, {formatTimeRange(session.scheduled_at, session.duration_min)}
          </p>
        </div>
      </div>

      {session.phase === "cancelled" ? (
        <Card className="text-center text-ink-500">
          Cette séance a été annulée.{" "}
          <Link href={backHref} className="font-medium text-brand-700 hover:underline">
            Revenir à l&apos;espace de mentorat
          </Link>
        </Card>
      ) : (
        <>
          {session.phase !== "live" && (
            <p className="rounded-2xl bg-slate-50 p-4 text-sm text-ink-700 ring-1 ring-slate-200">
              {session.phase === "upcoming"
                ? "La séance n'a pas encore commencé : vous pouvez déjà tester votre caméra et votre micro."
                : "Cette séance est terminée, mais la salle reste ouverte si vous devez la prolonger."}
            </p>
          )}
          <VideoCall
            sessionId={session.id}
            currentUserId={profile.id}
            partner={{ name: partner.full_name, avatarUrl: partner.avatar_url }}
            backHref={backHref}
            fallbackUrl={session.meeting_url}
          />
        </>
      )}
    </div>
  );
}
