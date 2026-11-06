import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { getMyJourneys } from "@/features/goals/queries";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ButtonLink } from "@/components/ui/Button";
import { formatDueDate } from "@/lib/datetime";

export const metadata: Metadata = { title: "Mes objectifs · MentorConnect" };

const STATUS_UI = {
  todo: { icon: "○", className: "border-slate-300 text-ink-500", label: "À faire" },
  in_progress: { icon: "◐", className: "border-amber-400 bg-amber-50 text-amber-700", label: "En cours" },
  done: { icon: "✓", className: "border-brand-600 bg-brand-700 text-white", label: "Fait" },
} as const;

/** Tous les objectifs, regroupés par mentorat (le suivi se fait dans chaque espace). */
export default async function GoalsPage() {
  const [profile, journeys] = await Promise.all([getCurrentProfile(), getMyJourneys()]);
  const isMentor = profile?.role === "mentor";
  const totals = journeys
    .filter((j) => j.active)
    .reduce((acc, j) => ({ done: acc.done + j.done, total: acc.total + j.total }), { done: 0, total: 0 });

  return (
    <>
      <PageHeader
        eyebrow="Mon parcours"
        title="Mes objectifs"
        description={
          isMentor
            ? "La progression de chacun de vos mentorés."
            : "Votre parcours, objectif par objectif, avec chacun de vos mentors."
        }
        actions={
          totals.total > 0 ? (
            <ProgressRing percent={Math.round((totals.done / totals.total) * 100)} label="Global" size={88} />
          ) : undefined
        }
      />

      {journeys.length === 0 ? (
        <Card className="text-center">
          <p className="mb-4 text-ink-500">
            Aucun objectif pour le moment. Les objectifs se fixent à deux, dans l&apos;espace d&apos;un mentorat actif.
          </p>
          <ButtonLink href="/mentorships">Mes mentorats</ButtonLink>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {journeys.map((j) => (
            <Card key={j.mentorshipId} className="flex flex-col">
              <div className="flex items-start justify-between gap-2">
                <p className="eyebrow">{isMentor ? `Avec ${j.menteeName}` : `Avec ${j.mentorName}`}</p>
                {!j.active && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-ink-500">Terminé</span>
                )}
              </div>
              <div className="mt-4">
                <ProgressBar percent={j.percent} label={`Progression avec ${isMentor ? j.menteeName : j.mentorName}`} />
              </div>
              <div className="mt-2 flex justify-between text-sm text-ink-500">
                <span>
                  <strong className="text-ink-900">{j.percent}%</strong> accompli
                </span>
                <span>
                  <strong className="text-ink-900">
                    {j.done}/{j.total}
                  </strong>{" "}
                  étapes
                </span>
              </div>

              <ul className="mt-5 flex flex-col gap-3">
                {j.goals.map((g) => {
                  const ui = STATUS_UI[g.status];
                  return (
                    <li key={g.id} className="flex items-start gap-3">
                      <span
                        aria-label={ui.label}
                        className={`inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${ui.className}`}
                      >
                        {ui.icon}
                      </span>
                      <div className="min-w-0">
                        <p className={g.status === "done" ? "text-ink-500 line-through" : "font-medium"}>{g.title}</p>
                        {g.due_date && (
                          <p className={`text-xs ${g.overdue ? "font-medium text-red-600" : "text-ink-500"}`}>
                            {g.overdue ? "En retard · " : ""}échéance le {formatDueDate(g.due_date)}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <Link
                href={`/mentorships/${j.mentorshipId}`}
                className="mt-6 text-sm font-medium text-brand-700 hover:underline"
              >
                {j.active ? "Mettre à jour dans l'espace de mentorat →" : "Revoir l'historique →"}
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
