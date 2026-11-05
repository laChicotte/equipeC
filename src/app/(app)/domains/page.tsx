import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { getDomains, getProfileDomainIds } from "@/features/profiles/queries";
import {
  CAMPUS_FRANCE_NOTICE,
  CAMPUS_FRANCE_OBJECTIVE,
  DOMAIN_SHORT_LABELS,
  DOMAIN_THEMES,
} from "@/features/profiles/labels";
import { getAvailableMentors, toMentorInput, type MentorSummary } from "@/features/mentors/queries";
import { orientDomains, recommendMentors } from "@/features/mentors/matching";
import { GOAL_TEMPLATES } from "@/features/goals/templates";
import { DomainIcon } from "@/features/profiles/domainIcons";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import {
  CardGrid,
  CardIcon,
  CtaBanner,
  ctaPrimaryClasses,
  ctaSecondaryClasses,
  ListingCardBody,
  listingCardClasses,
  ListingHeader,
  StatsBar,
} from "@/components/listing/Listing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Domaines d'expertise · MentorConnect" };

/** Compétences les plus citées par les mentors d'un domaine (4 au maximum). */
function topSkills(mentors: MentorSummary[]) {
  const counts = new Map<string, { label: string; n: number }>();
  for (const skill of mentors.flatMap((m) => m.skills)) {
    const key = skill.toLowerCase();
    const entry = counts.get(key) ?? { label: skill, n: 0 };
    entry.n++;
    counts.set(key, entry);
  }
  return [...counts.values()].sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, "fr")).slice(0, 4);
}

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

const sparkle = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7ZM19 15c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
  </svg>
);

export default async function DomainsPage({ searchParams }: PageProps<"/domains">) {
  const params = await searchParams;
  const besoin = typeof params.besoin === "string" && params.besoin.trim() ? params.besoin.trim().slice(0, 300) : "";

  const supabase = await createClient();
  const [domains, mentors, profile, resources] = await Promise.all([
    getDomains(),
    getAvailableMentors(),
    getCurrentProfile(),
    supabase.from("resources").select("domain_id"),
  ]);
  const myDomainIds = profile ? await getProfileDomainIds(profile.id, profile.role) : [];
  const resourceRows = (resources.data ?? []) as { domain_id: number | null }[];
  const isMentee = profile?.role === "mentee";

  // --- Orientation (à partir de la phrase saisie + situation du mentoré) -----
  const advice = besoin ? orientDomains(besoin, isMentee ? profile.mentee_status : null) : [];
  const advisedSlugs = advice.map((a) => a.slug);
  const topDomain = domains.find((d) => d.slug === advisedSlugs[0]) ?? null;
  const recommended = besoin
    ? recommendMentors(
        {
          domainIds: domains.filter((d) => advisedSlugs.includes(d.slug)).map((d) => d.id),
          menteeStatus: null,
          text: besoin,
          needs: [],
        },
        mentors.filter((m) => m.id !== profile?.id).map(toMentorInput),
        { limit: 3 },
      ).map((r) => ({ ...r, mentor: mentors.find((m) => m.id === r.mentorId)! }))
    : [];
  const firstSteps = topDomain ? (GOAL_TEMPLATES[topDomain.slug] ?? []).slice(0, 3) : [];

  const catalogue = domains.map((domain) => {
    const domainMentors = mentors.filter((m) => m.domains.some((d) => d.id === domain.id));
    return {
      domain,
      mentors: domainMentors,
      resourceCount: resourceRows.filter((r) => r.domain_id === domain.id).length,
      skills: topSkills(domainMentors),
      mine: myDomainIds.includes(domain.id),
      advised: advisedSlugs.includes(domain.slug),
    };
  });
  // Domaines conseillés d'abord, puis ceux de l'utilisateur, puis l'ordre du cahier des charges
  catalogue.sort(
    (a, b) =>
      Number(b.advised) - Number(a.advised) ||
      (a.advised ? advisedSlugs.indexOf(a.domain.slug) - advisedSlugs.indexOf(b.domain.slug) : 0) ||
      Number(b.mine) - Number(a.mine),
  );

  return (
    <>
      <ListingHeader
        pill="Explorer"
        title="Domaines d'expertise"
        description="Les 7 domaines dans lesquels nos mentors accompagnent les jeunes, étudiants, diplômés et entrepreneurs. Choisissez-en un, ou décrivez votre besoin pour être orienté."
      />

      <StatsBar
        items={[
          { icon: "🧭", value: domains.length, label: "domaines d'expertise" },
          { icon: "🧑‍🏫", value: mentors.length, label: "mentors disponibles" },
          { icon: "🛠️", value: new Set(mentors.flatMap((m) => m.skills.map((k) => k.toLowerCase()))).size, label: "compétences proposées" },
          { icon: "📚", value: resourceRows.length, label: "ressources partagées" },
        ]}
      />

      {/* Orientation intelligente */}
      <section id="orientation" className="mb-10 scroll-mt-24 rounded-3xl border border-brand-100 bg-brand-50/70 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="text-brand-600">{sparkle}</span>
          <div>
            <h2 className="text-xl font-bold text-brand-800">Orientation intelligente</h2>
            <p className="text-sm text-ink-500">Vous ne savez pas par où commencer ? Décrivez votre situation en une phrase.</p>
          </div>
        </div>
        <form action="/domains" className="mt-5 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="besoin" className="sr-only">Votre besoin</label>
          <input
            id="besoin"
            name="besoin"
            defaultValue={besoin}
            maxLength={300}
            placeholder="Ex : Je termine ma licence et je veux créer une entreprise dans l'agriculture…"
            className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3.5 outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
          />
          <button className="rounded-xl bg-brand-600 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-700">
            M&apos;orienter
          </button>
        </form>
        {!besoin && isMentee && profile.goals_summary && (
          <Link
            href={`/domains?besoin=${encodeURIComponent(profile.goals_summary.slice(0, 300))}`}
            className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline"
          >
            Utiliser mes objectifs : « {profile.goals_summary.slice(0, 80)}
            {profile.goals_summary.length > 80 ? "…" : ""} » →
          </Link>
        )}

        {besoin && advice.length === 0 && (
          <p className="mt-5 rounded-2xl bg-white p-4 text-sm text-ink-500">
            Nous n&apos;avons pas reconnu de domaine précis. Essayez avec d&apos;autres mots (ex. « emploi », « études en
            France », « financement ») ou parcourez les domaines ci-dessous.
          </p>
        )}

        {advice.length > 0 && (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {/* 1. Domaines conseillés */}
            <div className="rounded-2xl bg-white p-5">
              <p className="text-xs font-bold tracking-wide text-brand-700 uppercase">1 · Domaines conseillés</p>
              <ul className="mt-3 flex flex-col gap-3">
                {advice.slice(0, 3).map((a) => {
                  const d = domains.find((x) => x.slug === a.slug);
                  return (
                    <li key={a.slug} className="flex gap-3">
                      <span className="mt-0.5 text-brand-600"><DomainIcon slug={a.slug} className="size-5" /></span>
                      <div className="min-w-0">
                        <a href={`#domaine-${a.slug}`} className="font-semibold hover:text-brand-700">
                          {DOMAIN_SHORT_LABELS[a.slug] ?? d?.name ?? a.slug}
                        </a>
                        <p className="text-xs text-ink-500">{a.reason}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* 2. Mentors recommandés */}
            <div className="rounded-2xl bg-white p-5">
              <p className="text-xs font-bold tracking-wide text-brand-700 uppercase">2 · Mentors pour vous</p>
              {recommended.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">Pas encore de mentor disponible pour ce besoin.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {recommended.map((r) => (
                    <li key={r.mentorId}>
                      <Link href={`/mentors/${r.mentorId}`} className="group flex items-center gap-3">
                        <Avatar name={r.mentor.full_name} src={r.mentor.avatar_url} />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold group-hover:text-brand-700">{r.mentor.full_name}</span>
                          <span className="block truncate text-xs text-ink-500">
                            {r.score}% compatible · {r.reasons[0]}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 3. Premières étapes (parcours personnalisé) */}
            <div className="rounded-2xl bg-white p-5">
              <p className="text-xs font-bold tracking-wide text-brand-700 uppercase">3 · Vos premières étapes</p>
              <ol className="mt-3 flex flex-col gap-2 text-sm">
                {firstSteps.map((step, i) => (
                  <li key={step} className="flex gap-2.5">
                    <span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              {topDomain && (
                <Link
                  href={`/resources?domain=${topDomain.slug}`}
                  className="mt-4 inline-block text-sm font-semibold text-brand-700 hover:underline"
                >
                  Ressources « {DOMAIN_SHORT_LABELS[topDomain.slug] ?? topDomain.name} » →
                </Link>
              )}
              <p className="mt-2 text-xs text-ink-500">Votre mentor les ajustera avec vous dans « Mes objectifs ».</p>
            </div>
          </div>
        )}
        <p className="mt-5 text-xs text-ink-500">
          Analyse par mots-clés réalisée sur nos serveurs : votre phrase n&apos;est ni enregistrée ni envoyée à un service externe.
        </p>
      </section>

      <CardGrid>
        {catalogue.map(({ domain, mentors: domainMentors, resourceCount, skills, mine, advised }) => {
          const number = String(domain.id).padStart(2, "0");
          const short = DOMAIN_SHORT_LABELS[domain.slug] ?? domain.name;
          const badges = (
            <>
              {advised && (
                <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">Conseillé pour vous</span>
              )}
              {mine && (
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-100 ring-inset">
                  {profile?.role === "mentor" ? "Votre expertise" : "Votre centre d'intérêt"}
                </span>
              )}
            </>
          );
          return (
            <li key={domain.id} id={`domaine-${domain.slug}`} className="min-w-0 scroll-mt-24">
              <Modal
                title={domain.name}
                size="lg"
                eyebrow={
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-brand-600"><DomainIcon slug={domain.slug} className="size-6" /></span>
                    <span className="text-sm font-semibold text-brand-600">Domaine {number}</span>
                    {badges}
                  </span>
                }
                triggerClassName={`${listingCardClasses} ${advised || mine ? "border-brand-200 ring-1 ring-brand-100" : ""}`}
                trigger={
                  <ListingCardBody
                    icon={<CardIcon><DomainIcon slug={domain.slug} className="size-6" /></CardIcon>}
                    pill={
                      advised || mine ? (
                        <span className="flex flex-col items-end gap-1">{badges}</span>
                      ) : (
                        <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold whitespace-nowrap text-ink-500">
                          {plural(domainMentors.length, "mentor")}
                        </span>
                      )
                    }
                    eyebrow={`Domaine ${number}`}
                    title={short}
                    description={domain.description}
                    meta={{
                      icon: <span aria-hidden>👥</span>,
                      text: `${plural(domainMentors.length, "mentor")} · ${plural(resourceCount, "ressource")}`,
                    }}
                    footer={skills.length > 0 ? skills.slice(0, 2).map((k) => k.label).join(" · ") : domain.name}
                  />
                }
              >
                {domain.description && <p className="leading-relaxed text-ink-700">{domain.description}</p>}

                {/* Thèmes du cahier des charges (§5) */}
                {(DOMAIN_THEMES[domain.slug] ?? []).length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">Ce que couvre ce domaine</p>
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {DOMAIN_THEMES[domain.slug].map((theme) => (
                        <li key={theme} className="flex gap-2 rounded-xl bg-background px-3 py-2 text-sm text-ink-700">
                          <span aria-hidden className="text-brand-600">✓</span>
                          {theme}
                        </li>
                      ))}
                    </ul>
                    {domain.slug === "campus-france" && (
                      <p className="mt-3 text-sm text-ink-700">
                        <strong>Objectif :</strong> {CAMPUS_FRANCE_OBJECTIVE}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-ink-500">
                      Liste indicative : chaque mentor précise ses compétences sur sa fiche.
                    </p>
                  </div>
                )}

                {skills.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">Compétences proposées</p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {skills.map((sk) => (
                        <li key={sk.label}>
                          <Link
                            href={`/mentors?domain=${domain.slug}&q=${encodeURIComponent(sk.label)}`}
                            className="inline-block rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-800 hover:bg-brand-100"
                          >
                            {sk.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6">
                  <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">
                    {plural(domainMentors.length, "mentor")} disponible{domainMentors.length > 1 ? "s" : ""}
                  </p>
                  {domainMentors.length === 0 ? (
                    <p className="mt-2 text-sm text-ink-500">Bientôt des mentors dans ce domaine.</p>
                  ) : (
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                      {domainMentors.slice(0, 6).map((m) => (
                        <li key={m.id}>
                          <Link href={`/mentors/${m.id}`} className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-background">
                            <Avatar name={m.full_name} src={m.avatar_url} />
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">{m.full_name}</span>
                              <span className="block truncate text-xs text-ink-500">{m.job_title}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {domain.slug === "campus-france" && (
                  <p className="mt-6 rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
                    ℹ️ {CAMPUS_FRANCE_NOTICE}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-100 pt-5">
                  {domainMentors.length > 0 && (
                    <Link
                      href={`/mentors?domain=${domain.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-5 py-3 text-sm font-semibold text-white hover:bg-ink-800"
                    >
                      Voir tous les mentors <span aria-hidden>→</span>
                    </Link>
                  )}
                  <Link
                    href={`/resources?domain=${domain.slug}`}
                    className="inline-flex items-center rounded-xl border border-zinc-200 px-5 py-3 text-sm font-semibold text-ink-900 hover:bg-zinc-50"
                  >
                    {plural(resourceCount, "ressource")}
                  </Link>
                </div>
              </Modal>
            </li>
          );
        })}
      </CardGrid>

      {profile?.role === "mentor" ? (
        <CtaBanner
          pill="Transmettre"
          title="Faites rayonner votre domaine"
          text="Partagez une ressource ou animez un atelier : votre expertise profite à plusieurs jeunes à la fois."
          actions={
            <>
              <Link href="/workshops" className={ctaPrimaryClasses}>
                Organiser un atelier
              </Link>
              <Link href="/resources" className={ctaSecondaryClasses}>
                Partager une ressource
              </Link>
            </>
          }
        />
      ) : (
        <CtaBanner
          pill="Orientation"
          title="Vous hésitez entre plusieurs domaines ?"
          text="Décrivez votre situation en une phrase : nous vous indiquons par où commencer et quels mentors contacter."
          actions={
            <>
              <a href="#orientation" className={ctaPrimaryClasses}>
                M&apos;orienter
              </a>
              <Link href="/mentors" className={ctaSecondaryClasses}>
                Découvrir les mentors
              </Link>
            </>
          }
        />
      )}
    </>
  );
}
