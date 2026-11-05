import type { Metadata } from "next";
import { getCurrentProfile } from "@/features/auth/queries";
import { getDomains } from "@/features/profiles/queries";
import { RESOURCE_KIND_LABELS } from "@/features/profiles/labels";
import { getResources } from "@/features/resources/queries";
import { deleteResource } from "@/features/resources/actions";
import { ResourceForm } from "@/features/resources/components/ResourceForm";
import { FilterChips, withParams } from "@/components/shared/FilterChips";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatShortDate } from "@/lib/datetime";
import type { ResourceKind } from "@/types/database";

export const metadata: Metadata = { title: "Ressources · MentorConnect" };

const KINDS = Object.keys(RESOURCE_KIND_LABELS) as ResourceKind[];

export default async function ResourcesPage({ searchParams }: PageProps<"/resources">) {
  const params = await searchParams;
  const domain = typeof params.domain === "string" ? params.domain : undefined;
  const kindParam = typeof params.kind === "string" ? params.kind : undefined;
  const kind = KINDS.find((k) => k === kindParam);

  const [profile, domains, resources] = await Promise.all([
    getCurrentProfile(),
    getDomains(),
    getResources({ domain, kind }),
  ]);
  const isMentor = profile?.role === "mentor";

  return (
    <>
      <PageHeader
        eyebrow="Bibliothèque"
        title="Des ressources pour avancer."
        description="Guides, outils et conseils partagés par les mentors."
      />

      {isMentor && (
        <details className="mb-6 rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)]">
          <summary className="cursor-pointer font-medium text-brand-700">
            + Partager une ressource ou un conseil
          </summary>
          <div className="mt-4">
            <ResourceForm domains={domains} />
          </div>
        </details>
      )}

      <div className="mb-2">
        <FilterChips
          label="Filtrer par domaine"
          chips={[
            { href: withParams("/resources", { kind }), label: "Tous les domaines", active: !domain },
            ...domains.map((d) => ({
              href: withParams("/resources", { domain: d.slug, kind }),
              label: d.name,
              active: domain === d.slug,
            })),
          ]}
        />
      </div>
      <div className="mb-6">
        <FilterChips
          label="Filtrer par type"
          chips={[
            { href: withParams("/resources", { domain }), label: "Tous les types", active: !kind },
            ...KINDS.map((k) => ({
              href: withParams("/resources", { domain, kind: k }),
              label: `${RESOURCE_KIND_LABELS[k].icon} ${RESOURCE_KIND_LABELS[k].label}`,
              active: kind === k,
            })),
          ]}
        />
      </div>

      {resources.length === 0 ? (
        <Card className="text-center text-sm text-ink-500">
          Aucune ressource pour ces filtres pour le moment.
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {resources.map((r) => {
            const kindUi = RESOURCE_KIND_LABELS[r.kind];
            return (
              <li key={r.id}>
                <article className="flex h-full flex-col gap-3 rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)]">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="accent">
                      {kindUi.icon} {kindUi.label}
                    </Badge>
                    {r.domain && <Badge tone="brand">{r.domain.name}</Badge>}
                  </div>
                  <h2 className="font-semibold">{r.title}</h2>
                  <p className="text-sm whitespace-pre-line text-ink-700">{r.description}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2 text-xs text-ink-500">
                    <span>
                      Par {r.author?.full_name ?? "un mentor"} · {formatShortDate(r.created_at)}
                    </span>
                    <div className="flex items-center gap-3">
                      {r.author_id === profile?.id && (
                        <form action={deleteResource}>
                          <input type="hidden" name="resource_id" value={r.id} />
                          <button className="text-ink-500 hover:text-red-600">Supprimer</button>
                        </form>
                      )}
                      {r.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="font-medium text-brand-700 hover:underline"
                        >
                          Ouvrir ↗
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
