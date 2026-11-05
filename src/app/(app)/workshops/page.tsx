import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { getDomains } from "@/features/profiles/queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { getWorkshops, type WorkshopView } from "@/features/workshops/queries";
import { WorkshopForm } from "@/features/workshops/components/WorkshopForm";
import { WorkshopButton } from "@/features/workshops/components/WorkshopButton";
import { DateTile } from "@/features/sessions/components/NextSessionCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatDay, formatShortDate, formatTimeRange, nowAsConakryInput } from "@/lib/datetime";

export const metadata: Metadata = { title: "Ateliers thématiques · MentorConnect" };

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

function StatusBadge({ w }: { w: WorkshopView }) {
  const full = w.registered >= w.capacity;
  const [label, style] =
    w.phase === "cancelled"
      ? ["Annulé", "bg-red-50 text-red-700 ring-red-100"]
      : w.phase === "live"
        ? ["En cours", "bg-accent-400/20 text-[#8a5a12] ring-accent-400/30"]
        : w.isHost
          ? ["Vous animez", "bg-ink-900 text-white ring-ink-900"]
          : w.isRegistered
            ? ["✓ Inscrit(e)", "bg-brand-600 text-white ring-brand-600"]
            : full
              ? ["Complet", "bg-zinc-100 text-ink-500 ring-zinc-200"]
              : [`${plural(w.capacity - w.registered, "place")} restante${w.capacity - w.registered > 1 ? "s" : ""}`, "bg-brand-50 text-brand-800 ring-brand-100"];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${style}`}>{label}</span>;
}

function WorkshopCard({ w }: { w: WorkshopView }) {
  const full = w.registered >= w.capacity;
  const active = w.phase === "upcoming" || w.phase === "live";
  return (
    <li className={`rounded-3xl border bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)] ${w.phase === "cancelled" ? "border-zinc-100 opacity-70" : "border-zinc-100"}`}>
      <div className="flex gap-5">
        <DateTile iso={w.scheduled_at} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge w={w} />
            {w.domain && (
              <span className="text-xs font-medium text-brand-700">
                {DOMAIN_SHORT_LABELS[w.domain.slug] ?? w.domain.name}
              </span>
            )}
          </div>
          <h3 className={`mt-2 text-lg font-bold ${w.phase === "cancelled" ? "line-through" : ""}`}>{w.title}</h3>
          <p className="mt-1 text-sm text-ink-500">
            {formatDay(w.scheduled_at)} · {formatTimeRange(w.scheduled_at, w.duration_min)}
          </p>
          {w.host && (
            <p className="mt-1 text-sm text-ink-500">
              Animé par{" "}
              <Link href={`/mentors/${w.host.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                {w.host.full_name}
              </Link>
              {w.host.job_title && ` · ${w.host.job_title}`}
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-ink-700">{w.description}</p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
            <p className="text-sm text-ink-500">
              <strong className="text-ink-900">{w.registered}</strong> / {w.capacity} inscrits
              {w.isHost && w.participants.length > 0 && <> · {w.participants.join(", ")}</>}
            </p>
            {active && (
              <div className="flex flex-wrap items-center gap-2">
                {w.meetingUrl &&
                  (w.phase === "live" ? (
                    <a
                      href={w.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                      Rejoindre la visio
                    </a>
                  ) : (
                    <span className="text-xs text-ink-500">Lien de visio actif 15 min avant le début</span>
                  ))}
                {w.isHost ? (
                  <WorkshopButton workshopId={w.id} kind="cancel" />
                ) : w.isRegistered ? (
                  w.phase === "upcoming" && <WorkshopButton workshopId={w.id} kind="unregister" />
                ) : (
                  !full && w.phase === "upcoming" && <WorkshopButton workshopId={w.id} kind="register" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}

export default async function WorkshopsPage() {
  const [profile, domains, result] = await Promise.all([getCurrentProfile(), getDomains(), getWorkshops()]);
  const isMentor = profile?.role === "mentor";

  if (!result.ready) {
    return (
      <>
        <PageHeader eyebrow="Programme" title="Ateliers thématiques" />
        <p className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200">
          Les ateliers ne sont pas encore activés : exécutez la migration
          <code className="mx-1 font-mono">0005_workshops_and_impact.sql</code> dans Supabase.
        </p>
      </>
    );
  }

  const { upcoming, past } = result;
  const mine = upcoming.filter((w) => (w.isRegistered || w.isHost) && w.phase !== "cancelled").length;

  return (
    <>
      <PageHeader
        eyebrow="Programme · Étape 4"
        title="Ateliers thématiques"
        description="Des sessions collectives en visio animées par nos mentors : CV, entretien, financement, Campus France… Inscrivez-vous, le lien de la salle vous est réservé."
      />

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-2xl font-bold">À venir</h2>
            <p className="text-sm text-ink-500">
              {plural(upcoming.filter((w) => w.phase !== "cancelled").length, "atelier")}
              {mine > 0 && ` · ${mine} pour vous`}
            </p>
          </div>
          {upcoming.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center text-ink-500">
              Aucun atelier programmé pour l&apos;instant.
              {isMentor ? " Proposez le premier !" : " Revenez bientôt."}
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {upcoming.map((w) => (
                <WorkshopCard key={w.id} w={w} />
              ))}
            </ul>
          )}

          {past.length > 0 && (
            <>
              <h2 className="mt-10 mb-4 text-xl font-bold">Ateliers passés</h2>
              <ul className="divide-y divide-zinc-100 rounded-3xl border border-zinc-100 bg-white">
                {past.map((w) => (
                  <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm">
                    <span>
                      <span className="font-semibold">{w.title}</span>
                      {w.host && <span className="text-ink-500"> · {w.host.full_name}</span>}
                    </span>
                    <span className="text-ink-500">
                      {formatShortDate(w.scheduled_at)} · {plural(w.registered, "participant")}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          {isMentor ? (
            <section className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)]">
              <h2 className="text-lg font-bold">Organiser un atelier</h2>
              <p className="mt-1 mb-4 text-sm text-ink-500">Partagez votre expertise avec plusieurs participants à la fois.</p>
              <WorkshopForm
                domains={domains.map((d) => ({ id: d.id, label: DOMAIN_SHORT_LABELS[d.slug] ?? d.name }))}
                minDate={nowAsConakryInput()}
              />
            </section>
          ) : (
            <section className="rounded-3xl bg-ink-900 p-6 text-white">
              <h2 className="text-lg font-bold">Comment ça marche ?</h2>
              <ol className="mt-3 flex flex-col gap-2 text-sm text-white/80">
                <li>1. Inscrivez-vous à un atelier (places limitées).</li>
                <li>2. Le jour J, le bouton « Rejoindre la visio » apparaît 15 min avant.</li>
                <li>3. Prolongez avec un mentor de l&apos;atelier en individuel.</li>
              </ol>
            </section>
          )}
          <Link href="/opportunities?kind=atelier" className="text-sm font-medium text-brand-700 hover:underline">
            Ateliers partagés par d&apos;autres structures →
          </Link>
        </aside>
      </div>
    </>
  );
}
