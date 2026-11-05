import type { Metadata } from "next";
import { getCurrentUserId } from "@/features/auth/queries";
import { OPPORTUNITY_KIND_LABELS } from "@/features/profiles/labels";
import { getOpenOpportunities } from "@/features/opportunities/queries";
import { deleteOpportunity } from "@/features/opportunities/actions";
import { OpportunityForm } from "@/features/opportunities/components/OpportunityForm";
import { FilterChips, withParams } from "@/components/shared/FilterChips";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDueDate, formatShortDate, todayInConakry } from "@/lib/datetime";
import type { OpportunityKind } from "@/types/database";

export const metadata: Metadata = { title: "Opportunités · MentorConnect" };

const KINDS = Object.keys(OPPORTUNITY_KIND_LABELS) as OpportunityKind[];

export default async function OpportunitiesPage({ searchParams }: PageProps<"/opportunities">) {
  const params = await searchParams;
  const kind = KINDS.find((k) => k === params.kind);
  const [userId, opportunities] = await Promise.all([getCurrentUserId(), getOpenOpportunities(kind)]);

  return (
    <>
      <PageHeader
        title="Opportunités"
        description="Stages, emplois, bourses, financements et événements partagés par la communauté."
      />

      <details className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <summary className="cursor-pointer font-medium text-brand-700">+ Partager une opportunité</summary>
        <div className="mt-4">
          <OpportunityForm minDate={todayInConakry()} />
        </div>
      </details>

      <div className="mb-6">
        <FilterChips
          label="Filtrer par type"
          chips={[
            { href: "/opportunities", label: "Toutes", active: !kind },
            ...KINDS.map((k) => ({
              href: withParams("/opportunities", { kind: k }),
              label: `${OPPORTUNITY_KIND_LABELS[k].icon} ${OPPORTUNITY_KIND_LABELS[k].label}`,
              active: kind === k,
            })),
          ]}
        />
      </div>

      {opportunities.length === 0 ? (
        <Card className="text-center text-sm text-zinc-600">
          Aucune opportunité ouverte pour le moment. Soyez le premier à en partager une !
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {opportunities.map((o) => {
            const kindUi = OPPORTUNITY_KIND_LABELS[o.kind];
            const meta = [o.organization, o.location].filter(Boolean).join(" · ");
            return (
              <li key={o.id}>
                <article className="flex h-full flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge tone="brand">
                      {kindUi.icon} {kindUi.label}
                    </Badge>
                    {o.deadline && (
                      <span
                        className={`text-xs font-medium ${o.closingSoon ? "text-red-600" : "text-zinc-500"}`}
                      >
                        {o.closingSoon ? "⏳ " : ""}Jusqu&apos;au {formatDueDate(o.deadline)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold">{o.title}</h2>
                    {meta && <p className="text-sm text-zinc-600">{meta}</p>}
                  </div>
                  <p className="text-sm whitespace-pre-line text-zinc-700">{o.description}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-zinc-500">
                    <span>
                      Partagé par {o.author?.full_name ?? "un membre"} · {formatShortDate(o.created_at)}
                    </span>
                    <div className="flex items-center gap-3">
                      {o.author_id === userId && (
                        <form action={deleteOpportunity}>
                          <input type="hidden" name="opportunity_id" value={o.id} />
                          <button className="text-zinc-500 hover:text-red-600">Supprimer</button>
                        </form>
                      )}
                      {o.url && (
                        <a
                          href={o.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-medium text-brand-700 hover:underline"
                        >
                          En savoir plus ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
