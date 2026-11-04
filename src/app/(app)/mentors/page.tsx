import type { Metadata } from "next";
import Link from "next/link";
import { getDomains } from "@/features/profiles/queries";
import { filterMentors, getAvailableMentors } from "@/features/mentors/queries";
import { MentorCard } from "@/features/mentors/components/MentorCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Mentors · MentorConnect" };

export default async function MentorsPage({ searchParams }: PageProps<"/mentors">) {
  const params = await searchParams;
  const domain = typeof params.domain === "string" ? params.domain : undefined;
  const q = typeof params.q === "string" ? params.q.slice(0, 100) : undefined;

  const [domains, mentors] = await Promise.all([getDomains(), getAvailableMentors()]);
  const results = filterMentors(mentors, { domain, q });

  // Construit l'URL d'un filtre de domaine en conservant la recherche texte
  const domainHref = (slug?: string) => {
    const sp = new URLSearchParams();
    if (slug) sp.set("domain", slug);
    if (q) sp.set("q", q);
    const qs = sp.toString();
    return qs ? `/mentors?${qs}` : "/mentors";
  };

  const chip = (active: boolean) =>
    `whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
      active
        ? "border-brand-600 bg-brand-600 text-white"
        : "border-zinc-300 bg-white text-zinc-700 hover:border-brand-600"
    }`;

  return (
    <>
      <PageHeader
        title="Trouver un mentor"
        description="Des professionnels prêts à partager leur expérience."
      />

      {/* Formulaire GET : la recherche apparaît dans l'URL (partageable, sans JavaScript) */}
      <form action="/mentors" className="mb-4 flex gap-2">
        {domain && <input type="hidden" name="domain" value={domain} />}
        <label htmlFor="q" className="sr-only">
          Rechercher
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Nom, poste, mot-clé…"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        <Button type="submit">Rechercher</Button>
      </form>

      <nav aria-label="Filtrer par domaine" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-2">
        <Link href={domainHref()} className={chip(!domain)}>
          Tous
        </Link>
        {domains.map((d) => (
          <Link key={d.id} href={domainHref(d.slug)} className={chip(domain === d.slug)}>
            {d.name}
          </Link>
        ))}
      </nav>

      <p className="mb-3 text-sm text-zinc-600" aria-live="polite">
        {results.length} mentor{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
      </p>

      {results.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} />
          ))}
        </div>
      ) : (
        <Card className="text-center text-sm text-zinc-600">
          Aucun mentor ne correspond à votre recherche.{" "}
          <Link href="/mentors" className="font-medium text-brand-700 hover:underline">
            Voir tous les mentors
          </Link>
        </Card>
      )}
    </>
  );
}
