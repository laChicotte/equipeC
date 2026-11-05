import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { getDomains } from "@/features/profiles/queries";
import { CAMPUS_FRANCE_NOTICE, DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import {
  filterMentors,
  getAvailableMentors,
  getMenteeInput,
  toMentorInput,
} from "@/features/mentors/queries";
import { inferDomainSlugs, scoreMentor, type MenteeInput } from "@/features/mentors/matching";
import { MentorCard } from "@/features/mentors/components/MentorCard";
import { FilterChips, withParams } from "@/components/shared/FilterChips";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Découvrir · MentorConnect" };

const sparkle = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7ZM19 15c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
  </svg>
);

const text = (value: string | string[] | undefined, max: number) =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined;

export default async function MentorsPage({ searchParams }: PageProps<"/mentors">) {
  const params = await searchParams;
  const domain = text(params.domain, 50);
  const q = text(params.q, 100);
  const objectif = text(params.objectif, 300);

  const [profile, domains, mentors] = await Promise.all([
    getCurrentProfile(),
    getDomains(),
    getAvailableMentors(),
  ]);
  const isMentee = profile?.role === "mentee";

  // --- Compatibilité ------------------------------------------------------------
  // 1. Recherche intelligente : la phrase saisie (domaines déduits + mots-clés)
  // 2. Sinon, pour un mentoré : son profil (domaines, objectifs, situation)
  const detectedSlugs = objectif ? inferDomainSlugs(objectif) : [];
  let mentee: MenteeInput | null = null;
  if (objectif) {
    // La phrase exprime le besoin du moment : on n'ajoute pas l'affinité liée
    // à la situation du profil (sinon un étudiant qui cherche « fintech » se
    // verrait proposer d'abord des mentors d'orientation).
    mentee = {
      domainIds: domains.filter((d) => detectedSlugs.includes(d.slug)).map((d) => d.id),
      menteeStatus: null,
      text: objectif,
    };
  } else if (isMentee) {
    mentee = await getMenteeInput(profile);
  }

  const scores = new Map(
    mentee ? mentors.map((m) => [m.id, scoreMentor(mentee, toMentorInput(m))]) : [],
  );
  const results = filterMentors(mentors, { domain, q }).sort(
    (a, b) => (scores.get(b.id)?.score ?? 0) - (scores.get(a.id)?.score ?? 0),
  );
  const ranked = mentee !== null;
  const hasFilters = Boolean(domain || q || objectif);

  return (
    <>
      <header className="mb-8">
        <p className="eyebrow inline-block border-b-2 border-brand-600 pb-0.5">Explorer</p>
        <h1 className="mt-5 max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
          Trouvez la bonne personne pour passer à l&apos;étape suivante.
        </h1>
      </header>

      {/* Recherche par mot-clé (formulaire GET : la recherche est dans l'URL) */}
      <form action="/mentors" className="mb-4 flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white px-5 py-2">
        {domain && <input type="hidden" name="domain" value={domain} />}
        {objectif && <input type="hidden" name="objectif" value={objectif} />}
        <svg aria-hidden viewBox="0 0 24 24" className="size-5 shrink-0 text-ink-500" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <label htmlFor="q" className="sr-only">Rechercher une expertise, un mentor</label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Rechercher une expertise, un mentor…"
          className="min-w-0 flex-1 bg-transparent py-3 text-base outline-none placeholder:text-ink-500/70"
        />
        <button className="shrink-0 border-l border-zinc-200 pl-4 text-sm font-medium text-ink-900 hover:text-brand-700">
          Rechercher
        </button>
      </form>

      {/* Recherche intelligente */}
      <form
        action="/mentors"
        className="mb-6 flex flex-col gap-4 rounded-2xl border border-brand-100 bg-brand-50/70 p-4 md:flex-row md:items-center"
      >
        {domain && <input type="hidden" name="domain" value={domain} />}
        <div className="flex items-center gap-3 md:w-60 md:shrink-0">
          <span className="text-brand-600">{sparkle}</span>
          <div>
            <p className="font-bold text-brand-700">Recherche intelligente</p>
            <p className="text-xs text-ink-500">Décrivez votre objectif en une phrase</p>
          </div>
        </div>
        <label htmlFor="objectif" className="sr-only">Votre objectif</label>
        <input
          id="objectif"
          name="objectif"
          defaultValue={objectif}
          maxLength={300}
          placeholder="Ex : Je souhaite valider mon idée de fintech…"
          className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
        />
        <button className="rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700">
          Analyser
        </button>
      </form>

      {objectif && (
        <p className="mb-6 text-sm text-ink-500">
          {detectedSlugs.length > 0 ? (
            <>
              Domaines détectés dans votre objectif :{" "}
              {detectedSlugs.map((slug) => (
                <span key={slug} className="mr-1.5 inline-block rounded-full bg-white px-2.5 py-0.5 font-medium text-brand-800 ring-1 ring-brand-100">
                  {DOMAIN_SHORT_LABELS[slug] ?? slug}
                </span>
              ))}
            </>
          ) : (
            "Aucun domaine précis détecté : les mentors sont classés selon les mots de votre objectif."
          )}
        </p>
      )}

      <div className="mb-8">
        <FilterChips
          label="Filtrer par domaine"
          chips={[
            { href: withParams("/mentors", { q, objectif }), label: "Tous", active: !domain },
            ...domains.map((d) => ({
              href: withParams("/mentors", { domain: d.slug, q, objectif }),
              label: DOMAIN_SHORT_LABELS[d.slug] ?? d.name,
              active: domain === d.slug,
            })),
          ]}
        />
      </div>

      {(domain === "campus-france" || detectedSlugs.includes("campus-france")) && (
        <p className="mb-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900 ring-1 ring-amber-200">
          ℹ️ {CAMPUS_FRANCE_NOTICE}
        </p>
      )}

      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-bold" aria-live="polite">
          {results.length} mentor{results.length > 1 ? "s" : ""}
          {ranked ? ` recommandé${results.length > 1 ? "s" : ""}` : ""}
        </h2>
        <div className="flex items-center gap-4 text-sm text-ink-500">
          {ranked && <span>Triés par compatibilité</span>}
          {hasFilters && (
            <Link href="/mentors" className="font-medium text-brand-700 hover:underline">
              Effacer
            </Link>
          )}
        </div>
      </div>

      {results.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((mentor) => (
            <MentorCard key={mentor.id} mentor={mentor} compatibility={scores.get(mentor.id) ?? null} />
          ))}
        </div>
      ) : (
        <Card className="text-center text-ink-500">
          Aucun mentor ne correspond à votre recherche.{" "}
          <Link href="/mentors" className="font-medium text-brand-700 hover:underline">
            Voir tous les mentors
          </Link>
        </Card>
      )}
    </>
  );
}
