import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { isActiveMentor } from "@/features/profiles/roles";
import { getDomains } from "@/features/profiles/queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { getWorkshops, type WorkshopView } from "@/features/workshops/queries";
import { WorkshopForm } from "@/features/workshops/components/WorkshopForm";
import { WorkshopButton } from "@/features/workshops/components/WorkshopButton";
import { withParams } from "@/components/shared/FilterChips";
import { Modal, OpenDialogButton } from "@/components/ui/Modal";
import {
  CardGrid,
  CountChips,
  CtaBanner,
  ctaPrimaryClasses,
  ctaSecondaryClasses,
  EmptyState,
  ListingCardBody,
  listingCardClasses,
  ListingHeader,
  primaryActionClasses,
  ResultsBar,
  StatsBar,
} from "@/components/listing/Listing";
import { dateTile, formatDay, formatShortDate, formatTimeRange, nowAsConakryInput } from "@/lib/datetime";

export const metadata: Metadata = { title: "Ateliers thématiques · MentorConnect" };

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

const clock = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" strokeLinecap="round" />
  </svg>
);

/** Pavé date (en <span> : autorisé à l'intérieur d'un bouton). */
function SpanDateTile({ iso }: { iso: string }) {
  const { day, month } = dateTile(iso);
  return (
    <span className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700">
      <span className="text-base leading-none font-bold">{day}</span>
      <span className="mt-0.5 text-[9px] font-bold tracking-wide">{month}</span>
    </span>
  );
}

function StatusBadge({ w }: { w: WorkshopView }) {
  const full = w.registered >= w.capacity;
  const left = w.capacity - w.registered;
  const [label, style] =
    w.phase === "cancelled"
      ? ["Annulé", "bg-red-50 text-red-700 ring-1 ring-red-100"]
      : w.phase === "live"
        ? ["En cours", "bg-accent-400/20 text-[#8a5a12]"]
        : w.isHost
          ? ["Vous animez", "bg-ink-900 text-white"]
          : w.isRegistered
            ? ["✓ Inscrit(e)", "bg-brand-600 text-white"]
            : full
              ? ["Complet", "bg-zinc-100 text-ink-500"]
              : [`${plural(left, "place")} restante${left > 1 ? "s" : ""}`, "bg-zinc-100 text-ink-500"];
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${style}`}>{label}</span>;
}

/** Atelier : carte compacte ; un clic ouvre le programme complet et les actions. */
function WorkshopCard({ w }: { w: WorkshopView }) {
  const full = w.registered >= w.capacity;
  const active = w.phase === "upcoming" || w.phase === "live";
  const domainLabel = w.domain ? (DOMAIN_SHORT_LABELS[w.domain.slug] ?? w.domain.name) : "Tous publics";
  return (
    <li className="min-w-0">
      <Modal
        title={w.title}
        size="lg"
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <StatusBadge w={w} />
            <span className="text-xs font-semibold text-brand-700">{domainLabel}</span>
          </span>
        }
        triggerClassName={listingCardClasses}
        trigger={
          <ListingCardBody
            icon={<SpanDateTile iso={w.scheduled_at} />}
            pill={<StatusBadge w={w} />}
            eyebrow={domainLabel}
            title={w.title}
            description={w.description}
            meta={{
              icon: clock,
              text: `${formatTimeRange(w.scheduled_at, w.duration_min)}${w.host ? ` · ${w.host.full_name}` : ""}`,
            }}
            footer={`${w.registered} / ${w.capacity} inscrits`}
            muted={w.phase === "cancelled"}
          />
        }
      >
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-semibold text-ink-900">
            {formatDay(w.scheduled_at)} · {formatTimeRange(w.scheduled_at, w.duration_min)}
          </p>
          {w.host && (
            <p className="text-ink-500">
              Animé par{" "}
              <Link href={`/mentors/${w.host.id}`} className="font-medium text-ink-900 hover:text-brand-700">
                {w.host.full_name}
              </Link>
              {w.host.job_title && ` · ${w.host.job_title}`}
            </p>
          )}
        </div>
        <p className="mt-5 leading-relaxed break-words whitespace-pre-line text-ink-700">{w.description}</p>
        <p className="mt-5 text-sm text-ink-500">
          <strong className="text-ink-900">{w.registered}</strong> / {w.capacity} inscrits
          {w.isHost && w.participants.length > 0 && <> · {w.participants.join(", ")}</>}
        </p>
        {active && (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 pt-5">
            {w.meetingUrl &&
              (w.phase === "live" ? (
                <a
                  href={w.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  Rejoindre la visio
                </a>
              ) : (
                <span className="mr-auto text-xs text-ink-500">Lien de visio actif 15 min avant le début</span>
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
      </Modal>
    </li>
  );
}

export default async function WorkshopsPage({ searchParams }: PageProps<"/workshops">) {
  const params = await searchParams;
  const domain = typeof params.domain === "string" ? params.domain : undefined;
  const [profile, domains, result] = await Promise.all([getCurrentProfile(), getDomains(), getWorkshops()]);
  const isMentor = isActiveMentor(profile);

  if (!result.ready) {
    return (
      <>
        <ListingHeader pill="Programme" title="Ateliers thématiques" description="Sessions collectives animées par les mentors." />
        <p className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200">
          Les ateliers ne sont pas encore activés : exécutez la migration
          <code className="mx-1 font-mono">0005_workshops_and_impact.sql</code> dans Supabase.
        </p>
      </>
    );
  }

  const { upcoming, past } = result;
  const open = upcoming.filter((w) => w.phase !== "cancelled");
  const shown = domain ? upcoming.filter((w) => w.domain?.slug === domain) : upcoming;

  return (
    <>
      <ListingHeader
        pill="Programme · Étape 4"
        title="Ateliers thématiques"
        description="Des sessions collectives en visio animées par nos mentors : CV, entretien, financement, Campus France… Inscrivez-vous, le lien de la salle vous est réservé."
        action={
          isMentor && (
            <Modal
              dialogId="organiser-atelier"
              title="Organiser un atelier"
              eyebrow={<p className="eyebrow">Ateliers thématiques</p>}
              triggerClassName={primaryActionClasses}
              trigger={<span>+ Organiser un atelier</span>}
            >
              <p className="mb-5 text-sm text-ink-500">Partagez votre expertise avec plusieurs participants à la fois.</p>
              <WorkshopForm
                domains={domains.map((d) => ({ id: d.id, label: DOMAIN_SHORT_LABELS[d.slug] ?? d.name }))}
                minDate={nowAsConakryInput()}
              />
            </Modal>
          )
        }
      />

      <StatsBar
        items={[
          { icon: "🗓️", value: open.length, label: "ateliers à venir" },
          { icon: "🎟️", value: open.reduce((sum, w) => sum + Math.max(0, w.capacity - w.registered), 0), label: "places disponibles" },
          { icon: "🧑‍🏫", value: new Set(open.map((w) => w.host_id)).size, label: "mentors animateurs" },
          { icon: "✅", value: open.filter((w) => w.isRegistered || w.isHost).length, label: "pour vous" },
        ]}
      />

      <CountChips
        label="Filtrer par domaine"
        chips={[
          { href: "/workshops", label: "Tous", count: upcoming.length, active: !domain },
          ...domains
            .map((d) => ({
              href: withParams("/workshops", { domain: d.slug }),
              label: DOMAIN_SHORT_LABELS[d.slug] ?? d.name,
              count: upcoming.filter((w) => w.domain?.slug === d.slug).length,
              active: domain === d.slug,
            }))
            .filter((c) => c.count > 0 || c.active),
        ]}
      />

      <ResultsBar summary={`Affichage de ${plural(shown.length, "atelier")} à venir`} />

      {shown.length === 0 ? (
        <EmptyState>
          Aucun atelier programmé pour l&apos;instant.
          {isMentor ? " Proposez le premier !" : " Revenez bientôt."}
        </EmptyState>
      ) : (
        <CardGrid>
          {shown.map((w) => (
            <WorkshopCard key={w.id} w={w} />
          ))}
        </CardGrid>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mt-10 mb-4 text-xl font-bold">Ateliers passés</h2>
          <ul className="divide-y divide-zinc-100 rounded-3xl border border-zinc-100 bg-white">
            {past.map((w) => (
              <li key={w.id} className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 text-sm">
                <span className="min-w-0">
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

      {isMentor ? (
        <CtaBanner
          pill="Transmettre"
          title="Partagez votre expertise en groupe"
          text="Un atelier d'une heure peut aider vingt jeunes à la fois. La salle de visio est créée automatiquement."
          actions={
            <>
              <OpenDialogButton dialogId="organiser-atelier" className={ctaPrimaryClasses}>
                Organiser un atelier
              </OpenDialogButton>
              <Link href="/opportunities?kind=atelier" className={ctaSecondaryClasses}>
                Ateliers d&apos;autres structures
              </Link>
            </>
          }
        />
      ) : (
        <CtaBanner
          pill="Aller plus loin"
          title="Besoin d'un suivi personnalisé ?"
          text="Après l'atelier, poursuivez en individuel avec un mentor : chat, séances en visio et objectifs."
          actions={
            <>
              <Link href="/mentors" className={ctaPrimaryClasses}>
                Trouver un mentor
              </Link>
              <Link href="/opportunities?kind=atelier" className={ctaSecondaryClasses}>
                Ateliers d&apos;autres structures
              </Link>
            </>
          }
        />
      )}
    </>
  );
}
