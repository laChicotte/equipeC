import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { getCurrentProfile } from "@/features/auth/queries";
import { isActiveMentor } from "@/features/profiles/roles";
import { getDomains } from "@/features/profiles/queries";
import {
  DOMAIN_SHORT_LABELS,
  RESOURCE_KIND_LABELS,
} from "@/features/profiles/labels";
import { getResources, type ResourceView } from "@/features/resources/queries";
import { deleteResource } from "@/features/resources/actions";
import { ResourceForm } from "@/features/resources/components/ResourceForm";
import { normalize } from "@/features/mentors/matching";
import { withParams } from "@/components/shared/FilterChips";
import { Modal, OpenDialogButton } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  BulbBooksArt,
  LibraryHeroArt,
  ResourceArt,
} from "@/components/illustrations/ResourceArt";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartIcon,
  CompassIcon,
  DocumentIcon,
  FeatherIcon,
  GraduationIcon,
  LaptopIcon,
  LayersIcon,
  LinkIcon,
  NewspaperIcon,
  PlaneIcon,
  RocketIcon,
  TargetIcon,
  ToolIcon,
  UserIcon,
  UsersIcon,
  VideoIcon,
} from "@/components/ui/icons";
import {
  CountChips,
  EmptyState,
  primaryActionClasses,
  ResultsBar,
  StatCard,
} from "@/components/listing/Listing";
import { formatShortDate } from "@/lib/datetime";
import type { ResourceKind } from "@/types/database";

export const metadata: Metadata = { title: "Bibliothèque · MentorConnect" };

const KINDS = Object.keys(RESOURCE_KIND_LABELS) as ResourceKind[];
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

type IconC = (p: { className?: string }) => ReactNode;

/** Pictogramme et couleur de chaque type de ressource. */
const KIND_UI: Record<ResourceKind, { Icon: IconC; tile: string }> = {
  guide: { Icon: DocumentIcon, tile: "bg-brand-50 text-brand-700" },
  article: { Icon: NewspaperIcon, tile: "bg-orange-50 text-orange-600" },
  video: { Icon: VideoIcon, tile: "bg-blue-50 text-blue-700" },
  outil: { Icon: ToolIcon, tile: "bg-amber-50 text-amber-600" },
  modele: { Icon: LayersIcon, tile: "bg-orange-50 text-orange-600" },
  formation: { Icon: GraduationIcon, tile: "bg-rose-50 text-rose-600" },
};

/** Pictogrammes des domaines (filtres). */
const DOMAIN_ICONS: Record<string, IconC> = {
  entrepreneuriat: RocketIcon,
  numerique: LaptopIcon,
  "orientation-insertion": CompassIcon,
  "culture-creation": FeatherIcon,
  "gestion-finance": ChartIcon,
  "developpement-personnel": TargetIcon,
  "campus-france": PlaneIcon,
};

/** Carte de ressource illustrée ; un clic ouvre le contenu complet. */
function ResourceCard({
  r,
  profileId,
}: {
  r: ResourceView;
  profileId: string | null;
}) {
  const kindUi = RESOURCE_KIND_LABELS[r.kind];
  const { Icon, tile } = KIND_UI[r.kind] ?? KIND_UI.guide;
  const domainLabel = r.domain
    ? (DOMAIN_SHORT_LABELS[r.domain.slug] ?? r.domain.name)
    : null;
  const author = r.author?.full_name ?? "Un mentor";
  return (
    <li className="min-w-0">
      <Modal
        title={r.title}
        size="lg"
        eyebrow={
          <span className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{kindUi.label}</Badge>
            {r.domain && <Badge tone="brand">{r.domain.name}</Badge>}
          </span>
        }
        triggerClassName="group flex h-full w-full min-w-0 flex-col rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-[0_1px_3px_rgba(23,43,69,0.05)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
        trigger={
          <>
            <span className="flex w-full items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${tile}`}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-[11px] font-bold tracking-[0.08em] text-ink-900 uppercase">
                  {kindUi.label}
                </span>
              </span>
              {domainLabel && (
                <span className="truncate rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                  {domainLabel}
                </span>
              )}
            </span>
            <span className="mt-3 flex w-full gap-2">
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 block text-lg leading-snug font-bold break-words text-ink-900">
                  {r.title}
                </span>
                <span className="mt-2 line-clamp-3 block text-sm leading-relaxed break-words text-ink-500">
                  {r.description}
                </span>
              </span>
              <ResourceArt
                text={`${r.title} ${r.description}`}
                slug={r.domain?.slug ?? null}
                className="h-24 w-28 shrink-0"
              />
            </span>
            <span className="mt-3 flex min-w-0 items-center gap-2.5 text-sm font-semibold text-ink-900">
              <Avatar name={author} src={r.author?.avatar_url} size="sm" />
              <span className="truncate">{author}</span>
            </span>
            <span className="mt-auto flex w-full items-center justify-between gap-2 pt-4 text-xs text-ink-500">
              <span className="inline-flex min-w-0 items-center gap-1.5 truncate">
                <CalendarIcon className="size-4 shrink-0" /> Publié le{" "}
                {formatShortDate(r.created_at)}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-brand-600 px-4 py-1.5 text-sm font-semibold text-brand-800 transition-colors group-hover:bg-brand-50">
                Lire
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </span>
          </>
        }
      >
        <p className="leading-relaxed break-words whitespace-pre-line text-ink-700">
          {r.description}
        </p>
        <p className="mt-6 flex items-center gap-2.5 text-sm text-ink-500">
          <Avatar name={author} src={r.author?.avatar_url} size="sm" />
          <span>
            Par <strong className="text-ink-900">{author}</strong>
            {r.author?.job_title && ` · ${r.author.job_title}`} ·{" "}
            {formatShortDate(r.created_at)}
          </span>
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          {r.author_id === profileId ? (
            <form action={deleteResource}>
              <input type="hidden" name="resource_id" value={r.id} />
              <button className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-500 hover:bg-red-50 hover:text-red-600">
                Supprimer
              </button>
            </form>
          ) : (
            <span />
          )}
          {r.url && (
            <a
              href={r.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
            >
              Ouvrir la ressource ↗
            </a>
          )}
        </div>
      </Modal>
    </li>
  );
}

const ctaSolid =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50";
const ctaOutline =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10";

export default async function ResourcesPage({
  searchParams,
}: PageProps<"/resources">) {
  const params = await searchParams;
  const domain = typeof params.domain === "string" ? params.domain : undefined;
  const kind = KINDS.find((k) => k === params.kind);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";

  const [profile, domains, all] = await Promise.all([
    getCurrentProfile(),
    getDomains(),
    getResources({}),
  ]);
  const isMentor = isActiveMentor(profile);

  // Filtres appliqués ici (recherche, domaine, type) : les compteurs restent justes
  const terms = q ? normalize(q).split(/\s+/).filter(Boolean) : [];
  const searched = all.filter((r) =>
    terms.every((t) =>
      normalize(
        [r.title, r.description, r.author?.full_name, r.domain?.name]
          .filter(Boolean)
          .join(" "),
      ).includes(t),
    ),
  );
  const inDomain = domain
    ? searched.filter((r) => r.domain?.slug === domain)
    : searched;
  const shown = kind ? inDomain.filter((r) => r.kind === kind) : inDomain;

  return (
    <>
      {/* En-tête : pastille, titre, illustration */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-wide text-brand-700 uppercase ring-1 ring-brand-100">
            <BookOpenIcon className="size-3.5" /> Bibliothèque
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            Des ressources pour <span className="text-brand-600">avancer.</span>
          </h1>
          <p className="mt-2 text-ink-500">
            Guides, outils, modèles et conseils partagés par les mentors,
            classés par domaine.
          </p>
          {isMentor && (
            <div className="mt-5">
              <Modal
                dialogId="publier-ressource"
                title="Partager une ressource ou un conseil"
                eyebrow={<p className="eyebrow">Bibliothèque</p>}
                size="lg"
                triggerClassName={primaryActionClasses}
                trigger={<span>+ Partager une ressource</span>}
              >
                <ResourceForm domains={domains} />
              </Modal>
            </div>
          )}
        </div>
        <LibraryHeroArt className="hidden h-36 w-80 shrink-0 lg:block" />
      </header>

      <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          soft
          icon={<BookOpenIcon />}
          value={all.length}
          label="ressources"
        />
        <StatCard
          soft
          tone="amber"
          icon={<UsersIcon />}
          value={new Set(all.map((r) => r.author_id)).size}
          label="mentors contributeurs"
        />
        <StatCard
          soft
          tone="blue"
          icon={<LayersIcon />}
          value={new Set(all.map((r) => r.domain?.slug).filter(Boolean)).size}
          label="domaines couverts"
        />
        <StatCard
          soft
          tone="red"
          icon={<LinkIcon />}
          value={all.filter((r) => r.url).length}
          label="avec un lien externe"
        />
      </dl>

      <CountChips
        label="Filtrer par domaine"
        chips={[
          {
            href: withParams("/resources", { kind, q: q || undefined }),
            label: "Tous les domaines",
            count: searched.length,
            active: !domain,
          },
          ...domains
            .map((d) => {
              const Icon = DOMAIN_ICONS[d.slug];
              return {
                href: withParams("/resources", {
                  domain: d.slug,
                  kind,
                  q: q || undefined,
                }),
                label: DOMAIN_SHORT_LABELS[d.slug] ?? d.name,
                icon: Icon ? <Icon /> : undefined,
                count: searched.filter((r) => r.domain?.slug === d.slug).length,
                active: domain === d.slug,
              };
            })
            .filter((c) => c.count > 0 || c.active),
        ]}
      />
      <CountChips
        label="Filtrer par type"
        chips={[
          {
            href: withParams("/resources", { domain, q: q || undefined }),
            label: "Tous les types",
            count: inDomain.length,
            active: !kind,
          },
          ...KINDS.map((k) => {
            const { Icon } = KIND_UI[k];
            return {
              href: withParams("/resources", {
                domain,
                kind: k,
                q: q || undefined,
              }),
              label: RESOURCE_KIND_LABELS[k].label,
              icon: <Icon />,
              count: inDomain.filter((r) => r.kind === k).length,
              active: kind === k,
            };
          }).filter((c) => c.count > 0 || c.active),
        ]}
      />

      <ResultsBar
        summary={`Affichage de ${plural(shown.length, "ressource")}`}
        query={q}
        clearHref={withParams("/resources", { domain, kind })}
        action="/resources"
        hidden={{ domain, kind }}
        placeholder="Chercher un sujet, un mentor…"
      />

      {shown.length === 0 ? (
        <EmptyState>
          Aucune ressource pour ces filtres pour le moment.
        </EmptyState>
      ) : (
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {shown.map((r) => (
            <ResourceCard key={r.id} r={r} profileId={profile?.id ?? null} />
          ))}
        </ul>
      )}

      {/* Bannière d'appel à l'action */}
      <section className="mt-10 flex flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-800 p-8 text-white sm:p-10 lg:flex-row lg:items-center">
        <BulbBooksArt className="hidden h-32 w-40 shrink-0 md:block" />
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {isMentor ? "Transmettre" : "Aller plus loin"}
          </span>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {isMentor
              ? "Un conseil qui vous a fait gagner du temps ?"
              : "Une question précise sur votre projet ?"}
          </h2>
          <p className="mt-2 max-w-xl text-white/85">
            {isMentor
              ? "Partagez-le : un guide, un modèle ou un lien utile aide des dizaines de jeunes à la fois."
              : "Les ressources donnent des repères ; un mentor vous aide à les appliquer à votre situation."}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          {isMentor ? (
            <OpenDialogButton dialogId="publier-ressource" className={ctaSolid}>
              <BookOpenIcon className="size-5" /> Partager une ressource
            </OpenDialogButton>
          ) : (
            <Link href="/mentors" className={ctaSolid}>
              <UserIcon className="size-5" /> Trouver un mentor
            </Link>
          )}
          <Link href="/workshops" className={ctaOutline}>
            <CalendarIcon className="size-5" />{" "}
            {isMentor ? "Organiser un atelier" : "Voir les ateliers"}
          </Link>
        </div>
      </section>
    </>
  );
}
