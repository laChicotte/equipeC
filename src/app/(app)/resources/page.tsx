import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { isActiveMentor } from "@/features/profiles/roles";
import { getDomains } from "@/features/profiles/queries";
import { DOMAIN_SHORT_LABELS, RESOURCE_KIND_LABELS } from "@/features/profiles/labels";
import { getResources } from "@/features/resources/queries";
import { deleteResource } from "@/features/resources/actions";
import { ResourceForm } from "@/features/resources/components/ResourceForm";
import { normalize } from "@/features/mentors/matching";
import { withParams } from "@/components/shared/FilterChips";
import { Modal, OpenDialogButton } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  CardGrid,
  CardIcon,
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
import { formatShortDate } from "@/lib/datetime";
import type { ResourceKind } from "@/types/database";

export const metadata: Metadata = { title: "Bibliothèque · MentorConnect" };

const KINDS = Object.keys(RESOURCE_KIND_LABELS) as ResourceKind[];
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

const person = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

export default async function ResourcesPage({ searchParams }: PageProps<"/resources">) {
  const params = await searchParams;
  const domain = typeof params.domain === "string" ? params.domain : undefined;
  const kind = KINDS.find((k) => k === params.kind);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";

  const [profile, domains, all] = await Promise.all([getCurrentProfile(), getDomains(), getResources({})]);
  const isMentor = isActiveMentor(profile);

  // Filtres appliqués ici (recherche, domaine, type) : les compteurs restent justes
  const terms = q ? normalize(q).split(/\s+/).filter(Boolean) : [];
  const searched = all.filter((r) =>
    terms.every((t) => normalize([r.title, r.description, r.author?.full_name, r.domain?.name].filter(Boolean).join(" ")).includes(t)),
  );
  const inDomain = domain ? searched.filter((r) => r.domain?.slug === domain) : searched;
  const shown = kind ? inDomain.filter((r) => r.kind === kind) : inDomain;

  return (
    <>
      <ListingHeader
        pill="Bibliothèque"
        title="Des ressources pour avancer."
        description="Guides, outils, modèles et conseils partagés par les mentors, classés par domaine."
        action={
          isMentor && (
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
          )
        }
      />

      <StatsBar
        items={[
          { icon: "📚", value: all.length, label: "ressources" },
          { icon: "🧑‍🏫", value: new Set(all.map((r) => r.author_id)).size, label: "mentors contributeurs" },
          { icon: "🧭", value: new Set(all.map((r) => r.domain?.slug).filter(Boolean)).size, label: "domaines couverts" },
          { icon: "🔗", value: all.filter((r) => r.url).length, label: "avec un lien externe" },
        ]}
      />

      <CountChips
        label="Filtrer par domaine"
        chips={[
          { href: withParams("/resources", { kind, q: q || undefined }), label: "Tous les domaines", count: searched.length, active: !domain },
          ...domains
            .map((d) => ({
              href: withParams("/resources", { domain: d.slug, kind, q: q || undefined }),
              label: DOMAIN_SHORT_LABELS[d.slug] ?? d.name,
              count: searched.filter((r) => r.domain?.slug === d.slug).length,
              active: domain === d.slug,
            }))
            .filter((c) => c.count > 0 || c.active),
        ]}
      />
      <CountChips
        label="Filtrer par type"
        chips={[
          { href: withParams("/resources", { domain, q: q || undefined }), label: "Tous les types", count: inDomain.length, active: !kind },
          ...KINDS.map((k) => ({
            href: withParams("/resources", { domain, kind: k, q: q || undefined }),
            label: RESOURCE_KIND_LABELS[k].label,
            icon: RESOURCE_KIND_LABELS[k].icon,
            count: inDomain.filter((r) => r.kind === k).length,
            active: kind === k,
          })).filter((c) => c.count > 0 || c.active),
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
        <EmptyState>Aucune ressource pour ces filtres pour le moment.</EmptyState>
      ) : (
        <CardGrid>
          {shown.map((r) => {
            const kindUi = RESOURCE_KIND_LABELS[r.kind];
            const domainLabel = r.domain ? (DOMAIN_SHORT_LABELS[r.domain.slug] ?? r.domain.name) : null;
            return (
              <li key={r.id} className="min-w-0">
                <Modal
                  title={r.title}
                  size="lg"
                  eyebrow={
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone="accent">
                        {kindUi.icon} {kindUi.label}
                      </Badge>
                      {r.domain && <Badge tone="brand">{r.domain.name}</Badge>}
                    </span>
                  }
                  triggerClassName={listingCardClasses}
                  trigger={
                    <ListingCardBody
                      icon={<CardIcon tone="amber">{kindUi.icon}</CardIcon>}
                      pill={
                        domainLabel && (
                          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-brand-800">
                            {domainLabel}
                          </span>
                        )
                      }
                      eyebrow={kindUi.label}
                      title={r.title}
                      description={r.description}
                      meta={{ icon: person, text: r.author?.full_name ?? "Un mentor" }}
                      footer={`Publié le ${formatShortDate(r.created_at)}`}
                      action="Lire"
                    />
                  }
                >
                  <p className="leading-relaxed break-words whitespace-pre-line text-ink-700">{r.description}</p>
                  <p className="mt-6 text-sm text-ink-500">
                    Par {r.author?.full_name ?? "un mentor"}
                    {r.author?.job_title && ` · ${r.author.job_title}`} · {formatShortDate(r.created_at)}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-5">
                    {r.author_id === profile?.id ? (
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
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                      >
                        Ouvrir la ressource ↗
                      </a>
                    )}
                  </div>
                </Modal>
              </li>
            );
          })}
        </CardGrid>
      )}

      {isMentor ? (
        <CtaBanner
          pill="Transmettre"
          title="Un conseil qui vous a fait gagner du temps ?"
          text="Partagez-le : un guide, un modèle ou un lien utile aide des dizaines de jeunes à la fois."
          actions={
            <>
              <OpenDialogButton dialogId="publier-ressource" className={ctaPrimaryClasses}>
                Partager une ressource
              </OpenDialogButton>
              <Link href="/workshops" className={ctaSecondaryClasses}>
                Organiser un atelier
              </Link>
            </>
          }
        />
      ) : (
        <CtaBanner
          pill="Aller plus loin"
          title="Une question précise sur votre projet ?"
          text="Les ressources donnent des repères ; un mentor vous aide à les appliquer à votre situation."
          actions={
            <>
              <Link href="/mentors" className={ctaPrimaryClasses}>
                Trouver un mentor
              </Link>
              <Link href="/workshops" className={ctaSecondaryClasses}>
                Voir les ateliers
              </Link>
            </>
          }
        />
      )}
    </>
  );
}
