import Link from "next/link";
import type { Journey } from "../queries";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatDueDate } from "@/lib/datetime";

/** Carte « Mon parcours / Objectif en cours » de l'accueil. */
export function JourneyCard({ journey }: { journey: Journey | null }) {
  return (
    <Card className="flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <p className="eyebrow">Mon parcours</p>
        <Link href="/goals" className="text-sm font-medium text-brand-700 hover:underline">
          Tout voir
        </Link>
      </div>
      <h2 className="mt-3 mb-6 text-2xl font-semibold">Objectif en cours</h2>

      {journey ? (
        <>
          <p className="text-lg font-semibold">{journey.current?.title ?? "Tous les objectifs sont atteints 🎉"}</p>
          <div className="mt-4">
            <ProgressBar percent={journey.percent} label="Progression du parcours" />
          </div>
          <div className="mt-3 flex justify-between text-sm text-ink-500">
            <span>
              <strong className="text-ink-900">{journey.percent}%</strong> accompli
            </span>
            <span>
              <strong className="text-ink-900">
                {journey.done}/{journey.total}
              </strong>{" "}
              étapes
            </span>
          </div>

          {journey.next && (
            <Link
              href={`/mentorships/${journey.mentorshipId}`}
              className="mt-6 flex items-center gap-3 rounded-2xl bg-zinc-50 p-4 transition-colors hover:bg-brand-50"
            >
              <span aria-hidden className="inline-flex size-9 items-center justify-center rounded-full border-2 border-zinc-200 text-ink-500">
                →
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-bold tracking-[0.12em] text-ink-500 uppercase">
                  Prochaine étape
                </span>
                <span className="block truncate font-medium">{journey.next.title}</span>
                {journey.next.due_date && (
                  <span className="text-xs text-ink-500">échéance le {formatDueDate(journey.next.due_date)}</span>
                )}
              </span>
            </Link>
          )}
        </>
      ) : (
        <p className="text-ink-500">
          Fixez vos premiers objectifs avec votre mentor depuis{" "}
          <Link href="/mentorships" className="font-medium text-brand-700 hover:underline">
            votre espace de mentorat
          </Link>
          .
        </p>
      )}
    </Card>
  );
}
