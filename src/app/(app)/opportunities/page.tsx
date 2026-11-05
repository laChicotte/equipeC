import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUserId } from "@/features/auth/queries";
import { OPPORTUNITY_KIND_LABELS } from "@/features/profiles/labels";
import { getOpenOpportunities, type OpportunityView } from "@/features/opportunities/queries";
import { deleteOpportunity } from "@/features/opportunities/actions";
import { OpportunityForm } from "@/features/opportunities/components/OpportunityForm";
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
import { formatDueDate, formatShortDate, todayInConakry } from "@/lib/datetime";
import type { OpportunityKind } from "@/types/database";

export const metadata: Metadata = { title: "Opportunités · MentorConnect" };

const KINDS = Object.keys(OPPORTUNITY_KIND_LABELS) as OpportunityKind[];
const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

const pin = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const calendar = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth={2}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
);

/** Pastille de date limite : rouge si elle tombe dans les 7 jours. */
function Deadline({ o }: { o: OpportunityView }) {
  if (!o.deadline) return <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium whitespace-nowrap text-ink-500">Sans date limite</span>;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${
        o.closingSoon ? "bg-red-50 text-red-600 ring-1 ring-red-100" : "bg-zinc-100 text-ink-500"
      }`}
    >
      {o.closingSoon ? "⏳" : calendar} Jusqu&apos;au {formatDueDate(o.deadline)}
    </span>
  );
}

export default async function OpportunitiesPage({ searchParams }: PageProps<"/opportunities">) {
  const params = await searchParams;
  const kind = KINDS.find((k) => k === params.kind);
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";

  const [userId, all] = await Promise.all([getCurrentUserId(), getOpenOpportunities()]);

  // Filtres appliqués ici (recherche sans accents puis type) : les compteurs restent justes
  const terms = q ? normalize(q).split(/\s+/).filter(Boolean) : [];
  const searched = all.filter((o) =>
    terms.every((t) => normalize([o.title, o.description, o.organization, o.location].filter(Boolean).join(" ")).includes(t)),
  );
  const shown = kind ? searched.filter((o) => o.kind === kind) : searched;

  return (
    <>
      <ListingHeader
        pill="Communauté"
        title="Saisissez les opportunités."
        description="Stages, emplois, bourses, financements et ateliers partagés par les mentors et la communauté."
        action={
          <Modal
            dialogId="publier-opportunite"
            title="Partager une opportunité"
            eyebrow={<p className="eyebrow">Communauté</p>}
            size="lg"
            triggerClassName={primaryActionClasses}
            trigger={<span>+ Partager une opportunité</span>}
          >
            <OpportunityForm minDate={todayInConakry()} />
          </Modal>
        }
      />

      <StatsBar
        items={[
          { icon: "📋", value: all.length, label: "offres ouvertes" },
          { icon: "⏳", value: all.filter((o) => o.closingSoon).length, label: "clôturent sous 7 jours" },
          { icon: "🏢", value: new Set(all.map((o) => o.organization).filter(Boolean)).size, label: "organisations" },
          { icon: "📍", value: new Set(all.map((o) => o.location).filter(Boolean)).size, label: "lieux" },
        ]}
      />

      <CountChips
        label="Filtrer par type"
        chips={[
          { href: withParams("/opportunities", { q: q || undefined }), label: "Toutes", count: searched.length, active: !kind },
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
        <EmptyState>Aucune opportunité ne correspond. Essayez un autre filtre, ou partagez-en une !</EmptyState>
      ) : (
        <CardGrid>
          {shown.map((o) => {
            const kindUi = OPPORTUNITY_KIND_LABELS[o.kind];
            const place = [o.organization, o.location].filter(Boolean).join(" · ");
            return (
              <li key={o.id} className="min-w-0">
                <Modal
                  title={o.title}
                  size="lg"
                  eyebrow={
                    <span className="flex flex-wrap items-center gap-2">
                      <Badge tone="brand">
                        {kindUi.icon} {kindUi.label}
                      </Badge>
                      <Deadline o={o} />
                    </span>
                  }
                  triggerClassName={listingCardClasses}
                  trigger={
                    <ListingCardBody
                      icon={<CardIcon>{kindUi.icon}</CardIcon>}
                      pill={<Deadline o={o} />}
                      eyebrow={kindUi.label}
                      title={o.title}
                      description={o.description}
                      meta={place ? { icon: pin, text: place } : null}
                      footer={`Partagé le ${formatShortDate(o.created_at)}`}
                    />
                  }
                >
                  {place && (
                    <p className="mb-4 flex items-center gap-1.5 font-medium text-ink-700">
                      {pin} {place}
                    </p>
                  )}
                  <p className="leading-relaxed break-words whitespace-pre-line text-ink-700">{o.description}</p>
                  <p className="mt-6 text-sm text-ink-500">
                    Partagé par {o.author?.full_name ?? "un membre"} · {formatShortDate(o.created_at)}
                  </p>
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-5">
                    {o.author_id === userId ? (
                      <form action={deleteOpportunity}>
                        <input type="hidden" name="opportunity_id" value={o.id} />
                        <button className="rounded-xl px-3 py-2 text-sm font-semibold text-ink-500 hover:bg-red-50 hover:text-red-600">
                          Supprimer
                        </button>
                      </form>
                    ) : (
                      <span />
                    )}
                    {o.url ? (
                      <a
                        href={o.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
                      >
                        Postuler / en savoir plus ↗
                      </a>
                    ) : (
                      <span className="text-sm text-ink-500">Contactez l&apos;organisation pour postuler.</span>
                    )}
                  </div>
                </Modal>
              </li>
            );
          })}
        </CardGrid>
      )}

      <CtaBanner
        pill="Réseau MentorConnect"
        title="Vous recrutez ou offrez une bourse ?"
        text="Partagez gratuitement votre annonce avec les jeunes, étudiants et entrepreneurs de la plateforme."
        actions={
          <>
            <OpenDialogButton dialogId="publier-opportunite" className={ctaPrimaryClasses}>
              Publier une opportunité
            </OpenDialogButton>
            <Link href="/workshops" className={ctaSecondaryClasses}>
              Voir les ateliers
            </Link>
          </>
        }
      />
    </>
  );
}
