import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentProfile } from "@/features/auth/queries";
import { isActiveMentor } from "@/features/profiles/roles";
import { getDomains } from "@/features/profiles/queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { getWorkshops, type WorkshopView } from "@/features/workshops/queries";
import { WorkshopForm } from "@/features/workshops/components/WorkshopForm";
import { WorkshopDetail } from "@/features/workshops/components/WorkshopDetail";
import {
  TargetArt,
  WorkshopsHeroArt,
} from "@/features/workshops/components/WorkshopArt";
import { WorkshopTopicArt } from "@/components/illustrations/TopicArt";
import { withParams } from "@/components/shared/FilterChips";
import { Modal, OpenDialogButton } from "@/components/ui/Modal";
import {
  ArrowRightIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  GraduationIcon,
  PresentationIcon,
  RefreshIcon,
  UserIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/ui/icons";
import {
  EmptyState,
  ListingHeader,
  primaryActionClasses,
} from "@/components/listing/Listing";
import {
  dateTile,
  formatShortDate,
  formatTimeRange,
  nowAsConakryInput,
} from "@/lib/datetime";

export const metadata: Metadata = {
  title: "Ateliers thématiques · MentorConnect",
};

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

/** Pavé date (en <span> : autorisé à l'intérieur d'un bouton). */
function SpanDateTile({ iso }: { iso: string }) {
  const { day, month } = dateTile(iso);
  return (
    <span className="flex size-12 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-800">
      <span className="text-lg leading-none font-bold">{day}</span>
      <span className="mt-0.5 text-[10px] font-bold tracking-wide">
        {month}
      </span>
    </span>
  );
}

function StatusPill({ w }: { w: WorkshopView }) {
  const full = w.registered >= w.capacity;
  const left = w.capacity - w.registered;
  const [label, style] =
    w.phase === "cancelled"
      ? ["Annulé", "bg-red-50 text-red-700 ring-1 ring-red-100"]
      : w.phase === "live"
        ? ["En cours", "bg-amber-100 text-amber-800"]
        : w.isHost
          ? ["Vous animez", "bg-ink-900 text-white"]
          : w.isRegistered
            ? ["✓ Inscrit(e)", "bg-brand-700 text-white"]
            : full
              ? ["Complet", "bg-slate-100 text-ink-500"]
              : [
                  `${plural(left, "place")} restante${left > 1 ? "s" : ""}`,
                  "bg-slate-100 text-ink-700",
                ];
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${style}`}
    >
      {label}
    </span>
  );
}

/** Atelier : carte illustrée ; un clic ouvre le détail et l'inscription. */
function WorkshopCard({ w }: { w: WorkshopView }) {
  const domainLabel = w.domain
    ? (DOMAIN_SHORT_LABELS[w.domain.slug] ?? w.domain.name)
    : "Tous publics";
  const muted = w.phase === "cancelled";
  return (
    <li className="min-w-0">
      <Modal
        title={w.title}
        size="xl"
        headless
        triggerClassName="group flex h-full w-full min-w-0 flex-col rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-[0_1px_3px_rgba(23,43,69,0.05)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        trigger={
          <>
            <span className="flex w-full gap-3">
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-3">
                  <SpanDateTile iso={w.scheduled_at} />
                  <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                    <UsersIcon className="size-4 shrink-0" />
                    <span className="truncate">{domainLabel}</span>
                  </span>
                </span>
                <span
                  className={`mt-4 line-clamp-2 text-xl leading-snug font-bold break-words text-ink-900 ${muted ? "line-through opacity-70" : ""}`}
                >
                  {w.title}
                </span>
                <span className="mt-2 line-clamp-3 text-sm leading-relaxed break-words text-ink-500">
                  {w.description}
                </span>
                <span className="mt-3 flex min-w-0 items-center gap-2 text-sm text-ink-900">
                  <ClockIcon className="size-4 shrink-0 text-ink-700" />
                  <span className="truncate">
                    <span className="font-semibold">
                      {formatTimeRange(w.scheduled_at, w.duration_min)}
                    </span>
                    {w.host && <> · {w.host.full_name}</>}
                  </span>
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end">
                <StatusPill w={w} />
                <WorkshopTopicArt
                  text={`${w.title} ${w.description}`}
                  slug={w.domain?.slug ?? null}
                  className="mt-2 hidden h-32 w-40 sm:block"
                />
              </span>
            </span>
            <span className="mt-auto flex w-full items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <span className="inline-flex items-center gap-2 text-sm text-ink-500">
                <UsersIcon className="size-5 text-ink-700" />
                {w.registered} / {w.capacity} inscrits
              </span>
              <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-brand-800">
                Voir le détail
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </>
        }
      >
        <WorkshopDetail w={w} domainLabel={domainLabel} />
      </Modal>
    </li>
  );
}

/** Chiffre clé dans une carte vert pâle. */
function StatCard({
  icon,
  value,
  label,
}: {
  icon: ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-2xl border border-brand-100/70 bg-gradient-to-br from-brand-50 to-white p-4 shadow-[0_1px_3px_rgba(23,43,69,0.04)]">
      <span
        aria-hidden
        className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-brand-700 shadow-sm [&>svg]:size-6"
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col-reverse">
        <dt className="truncate text-sm text-ink-500">{label}</dt>
        <dd className="text-2xl leading-tight font-bold text-ink-900">
          {value}
        </dd>
      </div>
    </div>
  );
}

/** Filtres par domaine : pastille active verte, compteur arrondi. */
function DomainChips({
  chips,
}: {
  chips: { href: string; label: string; count: number; active: boolean }[];
}) {
  return (
    <nav
      aria-label="Filtrer par domaine"
      className="mb-8 flex flex-wrap gap-2.5"
    >
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          aria-current={chip.active ? "page" : undefined}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            chip.active
              ? "bg-brand-700 text-white"
              : "border border-slate-200 bg-white text-ink-900 shadow-[0_1px_2px_rgba(23,43,69,0.04)] hover:border-brand-300"
          }`}
        >
          {chip.label}
          <span
            className={`inline-flex min-w-5 justify-center rounded-full px-1.5 text-xs font-semibold ${
              chip.active ? "bg-white/20" : "bg-slate-100 text-ink-500"
            }`}
          >
            {chip.count}
          </span>
        </Link>
      ))}
    </nav>
  );
}

const ctaSolid =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50";
const ctaOutline =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10";

export default async function WorkshopsPage({
  searchParams,
}: PageProps<"/workshops">) {
  const params = await searchParams;
  const domain = typeof params.domain === "string" ? params.domain : undefined;
  const [profile, domains, result] = await Promise.all([
    getCurrentProfile(),
    getDomains(),
    getWorkshops(),
  ]);
  const isMentor = isActiveMentor(profile);

  if (!result.ready) {
    return (
      <>
        <ListingHeader
          pill="Programme"
          title="Ateliers thématiques"
          description="Sessions collectives animées par les mentors."
        />
        <p className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200">
          Les ateliers ne sont pas encore activés : exécutez la migration
          <code className="mx-1 font-mono">
            0005_workshops_and_impact.sql
          </code>{" "}
          dans Supabase.
        </p>
      </>
    );
  }

  const { upcoming, past } = result;
  const open = upcoming.filter((w) => w.phase !== "cancelled");
  const shown = domain
    ? upcoming.filter((w) => w.domain?.slug === domain)
    : upcoming;

  return (
    <>
      {/* En-tête : pictogramme, titre, description, visuel */}
      <header className="mb-8 flex items-center justify-between gap-6">
        <div className="flex min-w-0 items-start gap-5">
          <span
            aria-hidden
            className="hidden size-16 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-lg shadow-brand-700/25 sm:inline-flex"
          >
            <CalendarIcon className="size-8" />
          </span>
          <div className="min-w-0">
            <h1 className="text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
              Ateliers thématiques
            </h1>
            <p className="mt-2 max-w-xl text-ink-500">
              Des sessions collectives en visio animées par nos mentors : CV,
              entretien, financement, Campus France… Inscrivez-vous, le lien de
              la salle vous est réservé.
            </p>
            {isMentor && (
              <div className="mt-5">
                <Modal
                  dialogId="organiser-atelier"
                  title="Organiser un atelier"
                  eyebrow={<p className="eyebrow">Ateliers thématiques</p>}
                  icon={<PresentationIcon />}
                  description="Partagez votre expertise avec plusieurs participants à la fois."
                  size="xl"
                  bare
                  triggerClassName={primaryActionClasses}
                  trigger={<span>+ Organiser un atelier</span>}
                >
                  <WorkshopForm
                    domains={domains.map((d) => ({
                      id: d.id,
                      label: DOMAIN_SHORT_LABELS[d.slug] ?? d.name,
                    }))}
                    minDate={nowAsConakryInput()}
                  />
                </Modal>
              </div>
            )}
          </div>
        </div>
        <WorkshopsHeroArt className="hidden h-48 w-72 shrink-0 lg:block" />
      </header>

      <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<CalendarIcon />}
          value={open.length}
          label="ateliers à venir"
        />
        <StatCard
          icon={<UsersIcon />}
          value={open.reduce(
            (sum, w) => sum + Math.max(0, w.capacity - w.registered),
            0,
          )}
          label="places disponibles"
        />
        <StatCard
          icon={<GraduationIcon />}
          value={new Set(open.map((w) => w.host_id)).size}
          label="mentors animateurs"
        />
        <StatCard
          icon={<CheckCircleIcon className="size-6 text-brand-700" />}
          value={open.filter((w) => w.isRegistered || w.isHost).length}
          label="pour vous"
        />
      </dl>

      <DomainChips
        chips={[
          {
            href: "/workshops",
            label: "Tous",
            count: upcoming.length,
            active: !domain,
          },
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

      <h2 className="mb-4 flex items-center gap-3 text-xl font-bold">
        <CalendarIcon className="size-6 text-brand-700" />
        {plural(shown.length, "atelier")} à venir
      </h2>

      {shown.length === 0 ? (
        <EmptyState>
          Aucun atelier programmé pour l&apos;instant.
          {isMentor ? " Proposez le premier !" : " Revenez bientôt."}
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {shown.map((w) => (
            <WorkshopCard key={w.id} w={w} />
          ))}
        </ul>
      )}

      {past.length > 0 && (
        <>
          <h2 className="mt-10 mb-4 flex items-center gap-3 text-xl font-bold">
            <RefreshIcon className="size-6 text-brand-700" /> Ateliers passés
          </h2>
          <ul className="flex flex-col gap-3">
            {past.map((w) => (
              <li
                key={w.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3 pr-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)]"
              >
                <span
                  aria-hidden
                  className="inline-flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white"
                >
                  <VideoIcon className="size-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-ink-900">
                    {w.title}
                  </span>
                  {w.host && (
                    <span className="block truncate text-sm text-ink-500">
                      {w.host.full_name}
                    </span>
                  )}
                </span>
                <span className="text-sm text-ink-500">
                  {formatShortDate(w.scheduled_at)} ·{" "}
                  {plural(w.registered, "participant")}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Bannière d'appel à l'action */}
      <section className="mt-10 flex flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-800 p-8 text-white sm:p-10 lg:flex-row lg:items-center">
        <TargetArt className="hidden h-32 w-36 shrink-0 md:block" />
        <div className="min-w-0 flex-1">
          <h2 className="text-2xl font-bold sm:text-3xl">
            {isMentor
              ? "Partagez votre expertise en groupe"
              : "Besoin d'un suivi personnalisé ?"}
          </h2>
          <p className="mt-2 max-w-xl text-white/85">
            {isMentor
              ? "Un atelier d'une heure peut aider vingt jeunes à la fois. La salle de visio est créée automatiquement."
              : "Après l'atelier, poursuivez en individuel avec un mentor : chat, séances en visio et objectifs."}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          {isMentor ? (
            <OpenDialogButton dialogId="organiser-atelier" className={ctaSolid}>
              <PresentationIcon className="size-5" /> Organiser un atelier
            </OpenDialogButton>
          ) : (
            <Link href="/mentors" className={ctaSolid}>
              <UserIcon className="size-5" /> Trouver un mentor
            </Link>
          )}
          <Link href="/opportunities?kind=atelier" className={ctaOutline}>
            <CalendarIcon className="size-5" /> Ateliers d&apos;autres
            structures
          </Link>
        </div>
      </section>
    </>
  );
}
