import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { getDomains, getProfileDomainIds } from "@/features/profiles/queries";
import { CAMPUS_FRANCE_NOTICE, DOMAIN_ICONS, DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { getAvailableMentors, toMentorInput, type MentorSummary } from "@/features/mentors/queries";
import { orientDomains, recommendMentors } from "@/features/mentors/matching";
import { GOAL_TEMPLATES } from "@/features/goals/templates";
import { PageHeader } from "@/components/shared/PageHeader";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Domaines d'expertise · MentorConnect" };

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

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
  const myDomainIds = profile ? await getProfileDomainIds(profile.id) : [];
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
        mentors.map(toMentorInput),
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

  const stats = [
    { value: domains.length, label: "domaines d'expertise" },
    { value: mentors.length, label: "mentors disponibles" },
    { value: resourceRows.length, label: "ressources partagées" },
  ];

  return (
    <>
      <PageHeader
        eyebrow="Explorer"
        title="Domaines d'expertise"
        description="Les 7 domaines dans lesquels nos mentors accompagnent les jeunes, étudiants, diplômés et entrepreneurs. Choisissez-en un, ou décrivez votre besoin pour être orienté."
      />

      <dl className="mb-8 grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)]">
            <dt className="sr-only">{s.label}</dt>
            <dd>
              <span className="block text-4xl font-bold text-ink-900">{s.value}</span>
              <span className="mt-1 block text-sm text-ink-500">{s.label}</span>
            </dd>
          </div>
        ))}
      </dl>

      {/* Orientation intelligente */}
      <section className="mb-10 rounded-3xl border border-brand-100 bg-brand-50/70 p-6 sm:p-8">
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
                      <span aria-hidden className="text-xl">{DOMAIN_ICONS[a.slug] ?? "✨"}</span>
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
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">
                          {initialsOf(r.mentor.full_name)}
                        </span>
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

      <ul className="grid gap-6 lg:grid-cols-2">
        {catalogue.map(({ domain, mentors: domainMentors, resourceCount, skills, mine, advised }) => {
          const number = String(domain.id).padStart(2, "0");
          return (
            <li
              key={domain.id}
              id={`domaine-${domain.slug}`}
              className={`flex scroll-mt-24 flex-col rounded-3xl border bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)] sm:p-8 ${
                advised || mine ? "border-brand-200 ring-1 ring-brand-100" : "border-zinc-100"
              }`}
            >
              <div className="flex items-start gap-4">
                <span aria-hidden className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-background text-2xl">
                  {DOMAIN_ICONS[domain.slug] ?? "✨"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-brand-600">{number}</span>
                    {advised && (
                      <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white">
                        Conseillé pour vous
                      </span>
                    )}
                    {mine && (
                      <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-100 ring-inset">
                        {profile?.role === "mentor" ? "Votre expertise" : "Votre centre d'intérêt"}
                      </span>
                    )}
                  </div>
                  <h2 className="mt-1 text-xl font-bold">{DOMAIN_SHORT_LABELS[domain.slug] ?? domain.name}</h2>
                  <p className="text-sm text-ink-500">{domain.name}</p>
                </div>
              </div>

              {domain.description && <p className="mt-5 leading-relaxed text-ink-700">{domain.description}</p>}

              {skills.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold tracking-wide text-ink-500 uppercase">Compétences proposées</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {skills.map((s) => (
                      <li key={s.label}>
                        <Link
                          href={`/mentors?domain=${domain.slug}&q=${encodeURIComponent(s.label)}`}
                          className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-800 hover:bg-brand-100"
                        >
                          {s.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {domain.slug === "campus-france" && (
                <p className="mt-5 rounded-2xl bg-amber-50 p-3 text-xs leading-relaxed text-amber-900 ring-1 ring-amber-200">
                  ℹ️ {CAMPUS_FRANCE_NOTICE}
                </p>
              )}

              <div className="mt-auto pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-100 pt-5">
                  <div className="flex items-center gap-3">
                    {domainMentors.length > 0 && (
                      <div aria-hidden className="flex -space-x-2">
                        {domainMentors.slice(0, 3).map((m) => (
                          <span
                            key={m.id}
                            className="inline-flex size-9 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-xs font-bold text-brand-800"
                          >
                            {initialsOf(m.full_name)}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-ink-500">
                      <strong className="text-ink-900">{plural(domainMentors.length, "mentor")}</strong>
                      {" · "}
                      <Link href={`/resources?domain=${domain.slug}`} className="hover:text-brand-700 hover:underline">
                        {plural(resourceCount, "ressource")}
                      </Link>
                    </p>
                  </div>
                  {domainMentors.length > 0 ? (
                    <Link
                      href={`/mentors?domain=${domain.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-ink-800"
                    >
                      Voir les mentors <span aria-hidden>→</span>
                    </Link>
                  ) : (
                    <span className="text-sm text-ink-500">Bientôt des mentors</span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
