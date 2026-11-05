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
import { MentorSearch } from "@/features/mentors/components/MentorSearch";
import { FilterChips, withParams } from "@/components/shared/FilterChips";
import { Card } from "@/components/ui/Card";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import { FeatherIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Découvrir · MentorConnect" };

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
  const results = filterMentors(mentors.filter((m) => m.id !== profile?.id), { domain, q }).sort(
    (a, b) => (scores.get(b.id)?.score ?? 0) - (scores.get(a.id)?.score ?? 0),
  );
  const ranked = mentee !== null;
  const hasFilters = Boolean(domain || q || objectif);

  return (
    <>
      {/* En-tête : bandeau vert forêt, photo à partir de la tablette */}
      <header className="relative mb-6 overflow-hidden rounded-3xl bg-brand-900 text-white">
        <div className="absolute inset-0 hidden sm:block">
          <PhotoSlot
            name="mentors-bandeau"
            alt=""
            sizes="(min-width: 1024px) 70vw, 100vw"
            motif="mentoring"
            tone="dark"
            className="object-cover object-[center_35%]"
          />
        </div>
        <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/85 to-brand-950/30" />
        <div className="relative px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-xs font-bold tracking-[0.14em] text-accent-300 uppercase">Découvrir</p>
          <h1 className="mt-3 max-w-2xl font-display text-3xl leading-tight font-semibold tracking-tight sm:text-[2.75rem]">
            Trouvez la bonne personne pour passer à l&apos;étape suivante.
          </h1>
          <p className="mt-3 max-w-xl text-white/75">
            Des mentors, auteurs et professionnels prêts à partager ce qu&apos;ils ont appris.
          </p>
        </div>
      </header>

      <div className="mb-6">
        <MentorSearch domain={domain} q={q} objectif={objectif} />
      </div>

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
          scroll
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

      {/* Domaine à l'honneur (thème du hackathon « Lire demain ») */}
      {domain === "culture-creation" && (
        <div className="mb-6 flex gap-4 rounded-2xl bg-paper p-5 ring-1 ring-paper-200">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-accent-600 shadow-sm">
            <FeatherIcon className="size-5" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold">Culture &amp; littérature</p>
            <p className="mt-1 text-sm leading-relaxed text-ink-700">
              Écriture, édition, médiation culturelle, métiers du livre : ces mentors aident à faire
              vivre la lecture et à transformer une passion en projet.
            </p>
          </div>
        </div>
      )}

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
            <MentorCard key={mentor.id} mentor={mentor} compatibility={scores.get(mentor.id) ?? null} focusDomain={domain} />
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
