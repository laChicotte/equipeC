import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUserId } from "@/features/auth/queries";
import { OPPORTUNITY_KIND_LABELS } from "@/features/profiles/labels";
import {
  getOpenOpportunities,
  type OpportunityView,
} from "@/features/opportunities/queries";
import {
  KIND_ICONS,
  OpportunityDetail,
} from "@/features/opportunities/components/OpportunityDetail";
import { OpportunityForm } from "@/features/opportunities/components/OpportunityForm";
import { normalize } from "@/features/mentors/matching";
import { withParams } from "@/components/shared/FilterChips";
import { Modal, OpenDialogButton } from "@/components/ui/Modal";
import {
  MegaphoneArt,
  OpportunityArt,
  RecruitArt,
} from "@/components/illustrations/OpportunityArt";
import {
  ArrowRightIcon,
  BriefcaseIcon,
  BuildingIcon,
  CalendarIcon,
  HourglassIcon,
  MapPinIcon,
  MegaphoneIcon,
} from "@/components/ui/icons";
import {
  CountChips,
  EmptyState,
  primaryActionClasses,
  ResultsBar,
  StatCard,
} from "@/components/listing/Listing";
import { formatDueDate, formatShortDate, todayInConakry } from "@/lib/datetime";
import type { OpportunityKind } from "@/types/database";

export const metadata: Metadata = { title: "Opportunités · MentorConnect" };

const KINDS = Object.keys(OPPORTUNITY_KIND_LABELS) as OpportunityKind[];
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

/** Pastille de date limite : rouge (sablier) si elle tombe dans les 7 jours. */
function Deadline({ o }: { o: OpportunityView }) {
  if (!o.deadline) {
    return (
      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium whitespace-nowrap text-ink-500">
        Sans date limite
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${
        o.closingSoon ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-700"
      }`}
    >
      {o.closingSoon ? (
        <HourglassIcon className="size-3.5" />
      ) : (
        <CalendarIcon className="size-3.5" />
      )}
      Jusqu&apos;au {formatDueDate(o.deadline)}
    </span>
  );
}

/** Carte d'opportunité illustrée ; un clic ouvre le détail et la candidature. */
function OpportunityCard({
  o,
  userId,
}: {
  o: OpportunityView;
  userId: string | null;
}) {
  const kindUi = OPPORTUNITY_KIND_LABELS[o.kind];
  const KindIcon = KIND_ICONS[o.kind] ?? BriefcaseIcon;
  const place = [o.organization, o.location].filter(Boolean).join(" · ");
  return (
    <li className="min-w-0">
      <Modal
        title={o.title}
        size="xl"
        headless
        triggerClassName="group flex h-full w-full min-w-0 flex-col rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-[0_1px_3px_rgba(23,43,69,0.05)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        trigger={
          <>
            <span className="flex w-full items-start justify-between gap-3">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <KindIcon className="size-5" />
              </span>
              <Deadline o={o} />
            </span>
            <span className="mt-3 flex w-full gap-3">
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] font-bold tracking-[0.08em] text-brand-700 uppercase">
                  {kindUi.label}
                </span>
                <span className="mt-1 line-clamp-2 block text-lg leading-snug font-bold break-words text-ink-900">
                  {o.title}
                </span>
              </span>
              <OpportunityArt
                text={`${o.title} ${o.description} ${o.organization ?? ""}`}
                kind={o.kind}
                className="-mt-3 h-20 w-24 shrink-0"
              />
            </span>
            <span className="mt-2 line-clamp-3 block text-sm leading-relaxed break-words text-ink-500">
              {o.description}
            </span>
            {place && (
              <span className="mt-3 flex min-w-0 items-center gap-2 text-sm font-medium text-ink-900">
                <MapPinIcon className="size-4 shrink-0 text-ink-700" />
                <span className="truncate">{place}</span>
              </span>
            )}
            <span className="mt-auto flex w-full items-center justify-between gap-2 pt-4 text-xs text-ink-500">
              <span className="min-w-0 truncate">
                Partagé le {formatShortDate(o.created_at)}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-ink-900 transition-colors group-hover:bg-brand-100">
                Voir le détail
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </>
        }
      >
        <OpportunityDetail o={o} userId={userId} />
      </Modal>
    </li>
  );
}

export default async function OpportunitiesPage({
  searchParams,
}: PageProps<"/opportunities">) {
  const params = await searchParams;
  const kind = KINDS.find((k) => k === params.kind);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";

  const [userId, all] = await Promise.all([
    getCurrentUserId(),
    getOpenOpportunities(),
  ]);

  // Filtres appliqués ici (recherche sans accents puis type) : les compteurs restent justes
  const terms = q ? normalize(q).split(/\s+/).filter(Boolean) : [];
  const searched = all.filter((o) =>
    terms.every((t) =>
      normalize(
        [o.title, o.description, o.organization, o.location]
          .filter(Boolean)
          .join(" "),
      ).includes(t),
    ),
  );
  const shown = kind ? searched.filter((o) => o.kind === kind) : searched;

  return (
    <>
      {/* En-tête : pastille, titre, mégaphone, bouton */}
      <header className="relative mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-wide text-brand-700 uppercase ring-1 ring-brand-100">
            <span aria-hidden className="size-1.5 rounded-full bg-brand-600" />{" "}
            Communauté
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            Saisissez les <span className="text-brand-600">opportunités</span>
          </h1>
          <p className="mt-2 text-ink-500">
            Stages, emplois, bourses, financements et ateliers partagés par les
            mentors et la communauté.
          </p>
        </div>
        <MegaphoneArt className="pointer-events-none absolute -top-4 right-72 hidden h-32 w-44 xl:block" />
        <Modal
          dialogId="publier-opportunite"
          title="Partager une opportunité"
          eyebrow={<p className="eyebrow">Communauté</p>}
          icon={<MegaphoneIcon />}
          description="Informez la communauté d'une offre, d'un stage, d'un appel à projet ou d'un événement."
          size="xl"
          bare
          triggerClassName={`${primaryActionClasses} shadow-lg shadow-brand-700/20`}
          trigger={<span>+ Partager une opportunité</span>}
        >
          <OpportunityForm minDate={todayInConakry()} />
        </Modal>
      </header>

      <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<BriefcaseIcon />}
          value={all.length}
          label="offres ouvertes"
        />
        <StatCard
          tone="amber"
          icon={<HourglassIcon />}
          value={all.filter((o) => o.closingSoon).length}
          label="clôturent sous 7 jours"
        />
        <StatCard
          tone="blue"
          icon={<BuildingIcon />}
          value={new Set(all.map((o) => o.organization).filter(Boolean)).size}
          label="organisations"
        />
        <StatCard
          tone="red"
          icon={<MapPinIcon />}
          value={new Set(all.map((o) => o.location).filter(Boolean)).size}
          label="lieux"
        />
      </dl>

      <CountChips
        label="Filtrer par type"
        chips={[
          {
            href: withParams("/opportunities", { q: q || undefined }),
            label: "Toutes",
            count: searched.length,
            active: !kind,
          },
          ...KINDS.map((k) => ({
            href: withParams("/opportunities", { kind: k, q: q || undefined }),
            label: OPPORTUNITY_KIND_LABELS[k].label,
            icon: OPPORTUNITY_KIND_LABELS[k].icon,
            count: searched.filter((o) => o.kind === k).length,
            active: kind === k,
          })).filter((c) => c.count > 0 || c.active),
        ]}
      />

      <ResultsBar
        summary={`Affichage de ${plural(shown.length, "opportunité")} active${shown.length > 1 ? "s" : ""}`}
        query={q}
        clearHref={withParams("/opportunities", { kind })}
        action="/opportunities"
        hidden={{ kind }}
        placeholder="Filtrer par ville, mot-clé…"
      />

      {shown.length === 0 ? (
        <EmptyState>
          Aucune opportunité ne correspond. Essayez un autre filtre, ou
          partagez-en une !
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((o) => (
            <OpportunityCard key={o.id} o={o} userId={userId} />
          ))}
        </ul>
      )}

      {/* Bannière d'appel à l'action */}
      <section className="mt-10 flex flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-800 p-8 text-white sm:p-10 lg:flex-row lg:items-center">
        <RecruitArt className="hidden h-32 w-44 shrink-0 md:block" />
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Réseau MentorConnect
          </span>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            Vous recrutez ou offrez une bourse ?
          </h2>
          <p className="mt-2 max-w-xl text-white/85">
            Partagez gratuitement votre annonce avec les jeunes, étudiants et
            entrepreneurs de la plateforme.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          <OpenDialogButton
            dialogId="publier-opportunite"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50"
          >
            <MegaphoneIcon className="size-5" /> Publier une opportunité
          </OpenDialogButton>
          <Link
            href="/workshops"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            <CalendarIcon className="size-5" /> Voir les ateliers
          </Link>
        </div>
      </section>
    </>
  );
}
