import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { getDomains, getProfileDomainIds } from "@/features/profiles/queries";
import {
  CAMPUS_FRANCE_NOTICE,
  CAMPUS_FRANCE_OBJECTIVE,
  DOMAIN_SHORT_LABELS,
  DOMAIN_THEMES,
  MENTEE_STATUS_LABELS,
} from "@/features/profiles/labels";
import {
  getAvailableMentors,
  toMentorInput,
  type MentorSummary,
} from "@/features/mentors/queries";
import { orientDomains, recommendMentors } from "@/features/mentors/matching";
import { analyzeGoal, isAiEnabled } from "@/features/mentors/ai";
import { PendingSubmitButton } from "@/components/ui/PendingSubmitButton";
import { GOAL_TEMPLATES } from "@/features/goals/templates";
import { DomainIcon } from "@/features/profiles/domainIcons";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { StatCard } from "@/components/listing/Listing";
import {
  DomainArt,
  DomainsHeroArt,
  OrientationBotArt,
  SignpostArt,
} from "@/components/illustrations/DomainArt";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  CompassIcon,
  LayersIcon,
  PresentationIcon,
  SearchIcon,
  SendIcon,
  TargetIcon,
  ToolIcon,
  UsersIcon,
} from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Domaines d'expertise · MentorConnect",
};

/** Compétences les plus citées par les mentors d'un domaine (4 au maximum). */
function topSkills(mentors: MentorSummary[]) {
  const counts = new Map<string, { label: string; n: number }>();
  for (const skill of mentors.flatMap((m) => m.skills)) {
    const key = skill.toLowerCase();
    const entry = counts.get(key) ?? { label: skill, n: 0 };
    entry.n++;
    counts.set(key, entry);
  }
  return [...counts.values()]
    .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, "fr"))
    .slice(0, 4);
}

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? "s" : ""}`;

const ctaSolid =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50";
const ctaOutline =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-white/70 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10";

const sparkle = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="currentColor">
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7ZM19 15c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
  </svg>
);

export default async function DomainsPage({
  searchParams,
}: PageProps<"/domains">) {
  const params = await searchParams;
  const besoin =
    typeof params.besoin === "string" && params.besoin.trim()
      ? params.besoin.trim().slice(0, 300)
      : "";

  const supabase = await createClient();
  const [domains, mentors, profile, resources] = await Promise.all([
    getDomains(),
    getAvailableMentors(),
    getCurrentProfile(),
    supabase.from("resources").select("domain_id"),
  ]);
  const myDomainIds = profile
    ? await getProfileDomainIds(profile.id, profile.role)
    : [];
  const resourceRows = (resources.data ?? []) as { domain_id: number | null }[];
  const isMentee = profile?.role === "mentee";
  const isMentorRole = profile?.role === "mentor";

  // --- Orientation (à partir de la phrase saisie + situation du mentoré) -----
  // 1. IA (Claude) : comprend la phrase, conseille, classe les mentors et explique
  // 2. Repli (pas de clé, erreur) : analyse par mots-clés (matching.ts)
  const candidates = mentors.filter((m) => m.id !== profile?.id);
  const ai = besoin
    ? await analyzeGoal({
        goal: besoin,
        domains,
        mentors: candidates,
        situation:
          isMentee && profile.mentee_status
            ? MENTEE_STATUS_LABELS[profile.mentee_status]
            : null,
      })
    : null;
  const advice = ai
    ? ai.domains
    : besoin
      ? orientDomains(besoin, isMentee ? profile.mentee_status : null)
      : [];
  const advisedSlugs = advice.map((a) => a.slug);
  const topDomain = domains.find((d) => d.slug === advisedSlugs[0]) ?? null;
  const recommended = ai
    ? ai.ranking.slice(0, 3).map((r) => ({
        ...r,
        mentor: candidates.find((m) => m.id === r.mentorId)!,
      }))
    : besoin
      ? recommendMentors(
          {
            domainIds: domains
              .filter((d) => advisedSlugs.includes(d.slug))
              .map((d) => d.id),
            menteeStatus: null,
            text: besoin,
            needs: [],
          },
          candidates.map(toMentorInput),
          { limit: 3 },
        ).map((r) => ({
          ...r,
          mentor: mentors.find((m) => m.id === r.mentorId)!,
        }))
      : [];
  const firstSteps = ai?.steps.length
    ? ai.steps
    : topDomain
      ? (GOAL_TEMPLATES[topDomain.slug] ?? []).slice(0, 3)
      : [];

  const catalogue = domains.map((domain) => {
    const domainMentors = mentors.filter((m) =>
      m.domains.some((d) => d.id === domain.id),
    );
    return {
      domain,
      mentors: domainMentors,
      resourceCount: resourceRows.filter((r) => r.domain_id === domain.id)
        .length,
      skills: topSkills(domainMentors),
      mine: myDomainIds.includes(domain.id),
      advised: advisedSlugs.includes(domain.slug),
    };
  });
  // Domaines conseillés d'abord, puis ceux de l'utilisateur, puis l'ordre du cahier des charges
  catalogue.sort(
    (a, b) =>
      Number(b.advised) - Number(a.advised) ||
      (a.advised
        ? advisedSlugs.indexOf(a.domain.slug) -
          advisedSlugs.indexOf(b.domain.slug)
        : 0) ||
      Number(b.mine) - Number(a.mine),
  );

  return (
    <>
      {/* En-tête : pastille, titre, illustration */}
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-wide text-brand-700 uppercase ring-1 ring-brand-100">
            <CompassIcon className="size-3.5" /> Explorer
          </span>
          <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
            Domaines d&apos;<span className="text-brand-600">expertise</span>
          </h1>
          <p className="mt-2 text-ink-500">
            Les 7 domaines dans lesquels nos mentors accompagnent les jeunes,
            étudiants, diplômés et entrepreneurs. Choisissez-en un ou décrivez
            votre besoin pour être orienté.
          </p>
        </div>
        <DomainsHeroArt className="hidden h-36 w-80 shrink-0 lg:block" />
      </header>

      <dl className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          soft
          icon={<TargetIcon />}
          value={domains.length}
          label="domaines d'expertise"
        />
        <StatCard
          soft
          tone="amber"
          icon={<UsersIcon />}
          value={mentors.length}
          label="mentors disponibles"
        />
        <StatCard
          soft
          tone="blue"
          icon={<ToolIcon />}
          value={
            new Set(
              mentors.flatMap((m) => m.skills.map((k) => k.toLowerCase())),
            ).size
          }
          label="compétences proposées"
        />
        <StatCard
          soft
          tone="red"
          icon={<LayersIcon />}
          value={resourceRows.length}
          label="ressources partagées"
        />
      </dl>

      {/* Orientation intelligente */}
      <section
        id="orientation"
        className="relative mb-10 scroll-mt-24 overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-brand-50 p-6 sm:p-8"
      >
        <OrientationBotArt className="pointer-events-none absolute top-4 right-6 hidden h-36 w-44 lg:block" />
        <div className="flex items-start gap-3 lg:pr-48">
          <span className="mt-0.5 text-brand-600">{sparkle}</span>
          <div>
            <h2 className="text-xl font-bold text-brand-800 sm:text-2xl">
              Orientation intelligente
            </h2>
            <p className="text-sm text-ink-500">
              Vous ne savez pas par où commencer ? Décrivez votre situation en
              une phrase.
            </p>
          </div>
        </div>
        <form
          action="/domains"
          className="mt-5 flex flex-col gap-3 sm:flex-row lg:pr-48"
        >
          <label htmlFor="besoin" className="sr-only">
            Votre besoin
          </label>
          <div className="relative min-w-0 flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-500" />
            <input
              id="besoin"
              name="besoin"
              defaultValue={besoin}
              maxLength={300}
              placeholder="Ex. : Je termine ma licence et je veux créer une entreprise dans l'agriculture…"
              className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pr-4 pl-12 shadow-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <PendingSubmitButton
            pendingLabel={isAiEnabled() ? "L'IA analyse…" : "Analyse…"}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-700 px-6 py-3.5 font-semibold text-white transition-colors hover:bg-brand-800"
          >
            <SendIcon className="size-5" /> M&apos;orienter
          </PendingSubmitButton>
        </form>
        {!besoin && isMentee && profile.goals_summary && (
          <Link
            href={`/domains?besoin=${encodeURIComponent(profile.goals_summary.slice(0, 300))}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand-700 hover:underline"
          >
            <TargetIcon className="size-5 shrink-0" />
            <span>
              Utiliser mes objectifs : « {profile.goals_summary.slice(0, 80)}
              {profile.goals_summary.length > 80 ? "…" : ""} » →
            </span>
          </Link>
        )}

        {besoin && advice.length === 0 && (
          <p className="mt-5 rounded-2xl bg-white p-4 text-sm text-ink-500">
            Nous n&apos;avons pas reconnu de domaine précis. Essayez avec
            d&apos;autres mots (ex. « emploi », « études en France », «
            financement ») ou parcourez les domaines ci-dessous.
          </p>
        )}

        {ai && (
          <p className="mt-6 flex gap-3 rounded-2xl bg-white p-4 leading-relaxed text-ink-900">
            <span className="mt-0.5 shrink-0 text-brand-600">{sparkle}</span>
            <span>
              <span className="block text-xs font-bold tracking-wide text-brand-700 uppercase">
                Ce que l&apos;IA a compris
              </span>
              {ai.understanding}
            </span>
          </p>
        )}

        {advice.length > 0 && (
          <div className="mt-6 grid gap-5 lg:grid-cols-3">
            {/* 1. Domaines conseillés */}
            <div className="rounded-2xl bg-white p-5">
              <p className="text-xs font-bold tracking-wide text-brand-700 uppercase">
                1 · Domaines conseillés
              </p>
              <ul className="mt-3 flex flex-col gap-3">
                {advice.slice(0, 3).map((a) => {
                  const d = domains.find((x) => x.slug === a.slug);
                  return (
                    <li key={a.slug} className="flex gap-3">
                      <span className="mt-0.5 text-brand-600">
                        <DomainIcon slug={a.slug} className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <a
                          href={`#domaine-${a.slug}`}
                          className="font-semibold hover:text-brand-700"
                        >
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
              <p className="text-xs font-bold tracking-wide text-brand-700 uppercase">
                2 · Mentors pour vous
              </p>
              {recommended.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">
                  Pas encore de mentor disponible pour ce besoin.
                </p>
              ) : (
                <ul className="mt-3 flex flex-col gap-3">
                  {recommended.map((r) => (
                    <li key={r.mentorId}>
                      <Link
                        href={`/mentors/${r.mentorId}`}
                        className="group flex items-center gap-3"
                      >
                        <Avatar
                          name={r.mentor.full_name}
                          src={r.mentor.avatar_url}
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold group-hover:text-brand-700">
                            {r.mentor.full_name}
                          </span>
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
              <p className="text-xs font-bold tracking-wide text-brand-700 uppercase">
                3 · Vos premières étapes
              </p>
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
                  Ressources «{" "}
                  {DOMAIN_SHORT_LABELS[topDomain.slug] ?? topDomain.name} » →
                </Link>
              )}
              <p className="mt-2 text-xs text-ink-500">
                Votre mentor les ajustera avec vous dans « Mes objectifs ».
              </p>
            </div>
          </div>
        )}
        <p className="mt-5 text-xs text-ink-500">
          {ai
            ? "Analyse réalisée par une IA (Claude, d'Anthropic) : votre phrase lui est transmise pour l'analyse, sans être enregistrée par MentorConnect. Proposition à valider avec votre mentor."
            : "Analyse par mots-clés réalisée sur nos serveurs : votre phrase n'est ni enregistrée ni envoyée à un service externe."}
        </p>
      </section>

      <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {catalogue.map(
          ({
            domain,
            mentors: domainMentors,
            resourceCount,
            skills,
            mine,
            advised,
          }) => {
            const number = String(domain.id).padStart(2, "0");
            const short = DOMAIN_SHORT_LABELS[domain.slug] ?? domain.name;
            const badges = (
              <>
                {advised && (
                  <span className="rounded-full bg-brand-700 px-2.5 py-0.5 text-xs font-semibold text-white">
                    Conseillé pour vous
                  </span>
                )}
                {mine && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-800 ring-1 ring-brand-100 ring-inset">
                    {profile?.role === "mentor"
                      ? "Votre expertise"
                      : "Votre centre d'intérêt"}
                  </span>
                )}
              </>
            );
            return (
              <li
                key={domain.id}
                id={`domaine-${domain.slug}`}
                className="min-w-0 scroll-mt-24"
              >
                <Modal
                  title={domain.name}
                  size="xl"
                  headless
                  triggerClassName={`group flex h-full w-full min-w-0 flex-col rounded-3xl border bg-white p-5 text-left shadow-[0_1px_3px_rgba(23,43,69,0.05)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
                    advised || mine
                      ? "border-brand-200 ring-1 ring-brand-100"
                      : "border-slate-100"
                  }`}
                  trigger={
                    <>
                      <span className="flex w-full items-start justify-between gap-3">
                        <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                          <DomainIcon slug={domain.slug} className="size-6" />
                        </span>
                        {advised || mine ? (
                          <span className="flex flex-col items-end gap-1">
                            {badges}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold whitespace-nowrap text-ink-700">
                            {plural(domainMentors.length, "mentor")}
                          </span>
                        )}
                      </span>
                      <span className="mt-3 flex w-full gap-2">
                        <span className="min-w-0 flex-1">
                          <span className="block text-[11px] font-bold tracking-[0.08em] text-brand-700 uppercase">
                            Domaine {number}
                          </span>
                          <span className="mt-0.5 block text-xl leading-snug font-bold break-words text-ink-900">
                            {short}
                          </span>
                          {domain.description && (
                            <span className="mt-2 line-clamp-2 block text-sm leading-relaxed text-ink-500">
                              {domain.description}
                            </span>
                          )}
                        </span>
                        <DomainArt
                          slug={domain.slug}
                          className="-mt-2 h-24 w-28 shrink-0"
                        />
                      </span>
                      <span className="mt-auto flex w-full items-center justify-between gap-2 pt-4">
                        <span className="inline-flex min-w-0 items-center gap-2 truncate text-sm text-ink-700">
                          <UsersIcon className="size-4 shrink-0 text-brand-700" />
                          {plural(domainMentors.length, "mentor")} ·{" "}
                          {plural(resourceCount, "ressource")}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand-50 px-3.5 py-2 text-sm font-semibold text-ink-900 transition-colors group-hover:bg-brand-100">
                          Voir le détail
                          <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </span>
                    </>
                  }
                >
                  {/* Fenêtre compacte : visuel du domaine à gauche, l'essentiel à droite, sans défilement */}
                  <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1fr_2fr]">
                    <div className="relative hidden flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-brand-100 to-brand-200 p-5 md:flex">
                      <span className="inline-flex items-center gap-2 self-start rounded-full bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white">
                        <DomainIcon slug={domain.slug} className="size-4" />{" "}
                        Domaine {number}
                      </span>
                      <div className="flex flex-1 items-center justify-center py-2">
                        <DomainArt slug={domain.slug} className="h-40 w-48" />
                      </div>
                      <dl className="grid grid-cols-2 gap-2 text-center">
                        <div className="rounded-2xl bg-white/80 px-2 py-2">
                          <dd className="text-xl font-bold text-ink-900">
                            {domainMentors.length}
                          </dd>
                          <dt className="text-xs text-ink-500">
                            mentor{domainMentors.length > 1 ? "s" : ""}
                          </dt>
                        </div>
                        <div className="rounded-2xl bg-white/80 px-2 py-2">
                          <dd className="text-xl font-bold text-ink-900">
                            {resourceCount}
                          </dd>
                          <dt className="text-xs text-ink-500">
                            ressource{resourceCount > 1 ? "s" : ""}
                          </dt>
                        </div>
                      </dl>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 pr-12">
                        <span className="text-[11px] font-bold tracking-[0.08em] text-brand-700 uppercase md:hidden">
                          Domaine {number}
                        </span>
                        {badges}
                      </div>
                      <h2 className="mt-2 pr-12 text-2xl leading-tight font-bold text-ink-900">
                        {domain.name}
                      </h2>
                      {domain.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-500">
                          {domain.description}
                        </p>
                      )}

                      {/* Thèmes du cahier des charges (§5) : 6 au plus, sur 2 colonnes */}
                      {(DOMAIN_THEMES[domain.slug] ?? []).length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">
                            Ce que couvre ce domaine
                          </p>
                          <ul className="mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
                            {DOMAIN_THEMES[domain.slug]
                              .slice(0, 6)
                              .map((theme) => (
                                <li
                                  key={theme}
                                  className="flex gap-2 text-sm leading-snug text-ink-700"
                                >
                                  <CheckCircleIcon className="mt-0.5 size-4 shrink-0 text-brand-600" />
                                  <span className="line-clamp-1" title={theme}>
                                    {theme}
                                  </span>
                                </li>
                              ))}
                          </ul>
                          {DOMAIN_THEMES[domain.slug].length > 6 && (
                            <p className="mt-1 text-xs text-ink-500">
                              + {DOMAIN_THEMES[domain.slug].length - 6} autres
                              thèmes
                            </p>
                          )}
                          {domain.slug === "campus-france" && (
                            <p
                              className="mt-2 line-clamp-2 text-xs text-ink-700"
                              title={CAMPUS_FRANCE_OBJECTIVE}
                            >
                              <strong>Objectif :</strong>{" "}
                              {CAMPUS_FRANCE_OBJECTIVE}
                            </p>
                          )}
                        </div>
                      )}

                      {skills.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-bold tracking-wide text-ink-500 uppercase">
                            Compétences proposées
                          </p>
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {skills.map((sk) => (
                              <li key={sk.label}>
                                <Link
                                  href={`/mentors?domain=${domain.slug}&q=${encodeURIComponent(sk.label)}`}
                                  className="inline-block rounded-full border border-brand-100 bg-brand-50/60 px-2.5 py-1 text-xs font-medium text-brand-800 hover:bg-brand-100"
                                >
                                  {sk.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Mentors : avatars superposés (4 au plus) */}
                      <div className="mt-4 flex items-center gap-3">
                        {domainMentors.length === 0 ? (
                          <p className="text-sm text-ink-500">
                            Bientôt des mentors dans ce domaine.
                          </p>
                        ) : (
                          <>
                            <ul className="flex -space-x-2">
                              {domainMentors.slice(0, 4).map((m) => (
                                <li key={m.id}>
                                  <Link
                                    href={`/mentors/${m.id}`}
                                    title={m.full_name}
                                    className="block rounded-full ring-2 ring-white"
                                  >
                                    <Avatar
                                      name={m.full_name}
                                      src={m.avatar_url}
                                      size="sm"
                                    />
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            <p className="min-w-0 truncate text-sm text-ink-700">
                              {domainMentors
                                .slice(0, 2)
                                .map((m) => m.full_name)
                                .join(", ")}
                              {domainMentors.length > 2 &&
                                ` et ${domainMentors.length - 2} autre${domainMentors.length > 3 ? "s" : ""}`}
                            </p>
                          </>
                        )}
                      </div>

                      {domain.slug === "campus-france" && (
                        <p
                          className="mt-3 line-clamp-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-900 ring-1 ring-amber-200"
                          title={CAMPUS_FRANCE_NOTICE}
                        >
                          ℹ️ {CAMPUS_FRANCE_NOTICE}
                        </p>
                      )}

                      <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-4">
                        {domainMentors.length > 0 && (
                          <Link
                            href={`/mentors?domain=${domain.slug}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-800"
                          >
                            <UsersIcon className="size-4" /> Voir les mentors
                            <ArrowRightIcon className="size-4" />
                          </Link>
                        )}
                        <Link
                          href={`/resources?domain=${domain.slug}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-ink-900 hover:border-brand-200 hover:bg-brand-50/60"
                        >
                          <BookOpenIcon className="size-4" />{" "}
                          {plural(resourceCount, "ressource")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </Modal>
              </li>
            );
          },
        )}
      </ul>

      {/* Bannière d'appel à l'action */}
      <section className="mt-10 flex flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-800 p-8 text-white sm:p-10 lg:flex-row lg:items-center">
        <SignpostArt className="hidden h-32 w-40 shrink-0 md:block" />
        <div className="min-w-0 flex-1">
          <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            {isMentorRole ? "Transmettre" : "Orientation"}
          </span>
          <h2 className="mt-3 text-2xl font-bold sm:text-3xl">
            {isMentorRole
              ? "Faites rayonner votre domaine"
              : "Vous hésitez entre plusieurs domaines ?"}
          </h2>
          <p className="mt-2 max-w-xl text-white/85">
            {isMentorRole
              ? "Partagez une ressource ou animez un atelier : votre expertise profite à plusieurs jeunes à la fois."
              : "Décrivez votre situation en une phrase : nous vous indiquons par où commencer et quels mentors contacter."}
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-3">
          {isMentorRole ? (
            <>
              <Link href="/workshops" className={ctaSolid}>
                <PresentationIcon className="size-5" /> Organiser un atelier
              </Link>
              <Link href="/resources" className={ctaOutline}>
                <BookOpenIcon className="size-5" /> Partager une ressource
              </Link>
            </>
          ) : (
            <>
              <a href="#orientation" className={ctaSolid}>
                <SendIcon className="size-5" /> M&apos;orienter
              </a>
              <Link href="/mentors" className={ctaOutline}>
                <UsersIcon className="size-5" /> Découvrir les mentors
              </Link>
            </>
          )}
        </div>
      </section>
    </>
  );
}
