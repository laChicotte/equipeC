import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ButtonLink } from "@/components/ui/Button";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import {
  ArrowRightIcon,
  BookmarkIcon,
  CheckIcon,
  ChevronRightIcon,
  DocumentIcon,
  FeatherIcon,
  GraduationIcon,
  LightbulbIcon,
  QuoteIcon,
  RefreshIcon,
  RocketIcon,
  SproutIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { getCurrentUserId } from "@/features/auth/queries";
import { getDomains } from "@/features/profiles/queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { DomainIcon } from "@/features/profiles/domainIcons";

type Icon = ComponentType<{ className?: string }>;

/** Les quatre piliers : chacun mène à une fonctionnalité existante. */
const PILLARS = (loggedIn: boolean) => [
  {
    verb: "Apprendre",
    photo: "pilier-apprendre",
    motif: "mentoring" as const,
    text: "Trouvez un mentor qui a déjà parcouru le chemin : orientation, études, emploi, entrepreneuriat.",
    href: loggedIn ? "/mentors" : "/signup?role=mentee",
    cta: "Trouver un mentor",
  },
  {
    verb: "Transmettre",
    photo: "pilier-transmettre",
    motif: "writing" as const,
    text: "Partagez votre expérience : quelques heures par mois peuvent changer une trajectoire.",
    href: loggedIn ? "/profile" : "/signup?role=mentor",
    cta: "Devenir mentor",
  },
  {
    verb: "Lire",
    photo: "pilier-lire",
    motif: "books" as const,
    text: "Guides, lectures et ressources recommandés par les mentors, réunis dans la Bibliothèque.",
    href: "/resources",
    cta: "Ouvrir la bibliothèque",
  },
  {
    verb: "Agir",
    photo: "pilier-agir",
    motif: "workshop" as const,
    text: "Ateliers, restitutions et opportunités pour passer de l'idée au projet concret.",
    href: "/workshops",
    cta: "Voir les ateliers",
  },
];

const STEPS = [
  {
    title: "Parlez-nous de vous",
    text: "Décrivez votre projet, vos objectifs et les défis que vous souhaitez relever.",
  },
  {
    title: "Trouvez votre mentor",
    text: "Notre moteur de recommandation identifie les profils les plus pertinents pour vous, et explique pourquoi.",
  },
  {
    title: "Progressez ensemble",
    text: "Échangez par chat, planifiez vos séances en visio, suivez vos objectifs et célébrez chaque avancée.",
  },
];

// Publics cibles du cahier des charges (§2.3), plus les lecteurs et auteurs
const AUDIENCES: { icon: Icon; title: string; text: string }[] = [
  { icon: GraduationIcon, title: "Étudiants", text: "Orientation, choix d'études, projet Campus France." },
  { icon: DocumentIcon, title: "Jeunes diplômés", text: "CV, entretiens, premier emploi." },
  { icon: RocketIcon, title: "Entrepreneurs", text: "Structurer, financer, développer son activité." },
  { icon: LightbulbIcon, title: "Porteurs de projet", text: "Passer de l'idée au projet concret." },
  { icon: RefreshIcon, title: "En reconversion", text: "Changer de voie, accompagné." },
  { icon: SproutIcon, title: "Nouvelles compétences", text: "Apprendre auprès de ceux qui pratiquent." },
  { icon: FeatherIcon, title: "Lecteurs & auteurs en herbe", text: "Écrire, publier, faire vivre les livres." },
];

const FEATURES = [
  "Recommandations expliquées",
  "Chat en temps réel",
  "Séances en visio",
  "Objectifs et progression",
  "Évaluation des séances",
  "Ressources et opportunités",
];

/** Arche de l'accroche : photo (ou illustration) et deux cartes flottantes. */
function HeroArch() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div aria-hidden className="absolute -right-3 bottom-0 h-[92%] w-[92%] rounded-t-full bg-accent-50" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full">
        <PhotoSlot
          name="accueil-accroche"
          legacySrc="/hero.jpg"
          alt="Une jeune professionnelle accompagnée par deux mentors devant son poste de travail"
          sizes="(min-width: 1024px) 40vw, 90vw"
          motif="mentoring"
          priority
          className="object-cover object-[center_40%]"
        />
      </div>

      {/* Bulle « Excellent match » */}
      <div className="absolute top-[14%] -right-2 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-xl sm:-right-6 sm:p-4">
        <div className="relative size-12 sm:size-14">
          <svg viewBox="0 0 56 56" className="-rotate-90" aria-hidden>
            <circle cx="28" cy="28" r="24" fill="none" stroke="#eaf6f2" strokeWidth="5" />
            <circle cx="28" cy="28" r="24" fill="none" stroke="#13836f" strokeWidth="5" strokeLinecap="round" strokeDasharray="150.8" strokeDashoffset="6" />
          </svg>
          <span className="absolute inset-0 flex flex-col items-center justify-center text-sm leading-none font-bold">
            96<span className="text-[9px] font-normal text-ink-500">%</span>
          </span>
        </div>
        <div>
          <p className="font-bold">Excellent match</p>
          <p className="text-xs text-ink-500">Selon votre objectif</p>
        </div>
      </div>

      {/* Carte « séance » */}
      <div className="absolute -bottom-5 left-0 flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-xl sm:-left-8 sm:p-4">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <VideoIcon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold">Séance en visio</p>
          <p className="text-xs text-ink-500">Demain · 18:00</p>
        </div>
      </div>
    </div>
  );
}

/** Titre de section : sur-titre + grand titre éditorial. */
function SectionTitle({
  eyebrow,
  title,
  text,
  center = false,
  light = false,
}: {
  eyebrow: string;
  title: ReactNode;
  text?: string;
  center?: boolean;
  light?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className={`eyebrow ${light ? "text-accent-300!" : ""}`}>{eyebrow}</p>
      <h2 className={`mt-4 font-display text-[2rem] leading-[1.15] font-semibold tracking-tight sm:text-5xl ${light ? "text-white" : ""}`}>
        {title}
      </h2>
      {text && <p className={`mt-5 text-lg leading-relaxed ${light ? "text-white/75" : "text-ink-500"}`}>{text}</p>}
    </div>
  );
}

export default async function HomePage() {
  // Domaines : lecture publique (règle RLS « domains: lecture publique »)
  const [domains, userId] = await Promise.all([getDomains(), getCurrentUserId()]);
  const loggedIn = Boolean(userId);
  const culture = domains.find((d) => d.slug === "culture-creation");
  const otherDomains = domains.filter((d) => d.slug !== "culture-creation");

  return (
    <div className="bg-white">
      <a
        href="#contenu"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Aller au contenu
      </a>
      <PublicHeader loggedIn={loggedIn} />

      <main id="contenu">
        {/* ─── Accroche ─────────────────────────────────────────── */}
        <section className="bg-paper">
          <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pt-10 pb-20 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-16 lg:pb-28">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-accent-300 bg-white px-4 py-2 text-xs font-bold tracking-[0.06em] text-accent-600 uppercase">
                <BookmarkIcon className="size-4" />
                Né au Salon du livre jeunesse de Conakry
              </p>
              <h1 className="mt-7 font-display text-[2.6rem] leading-[1.08] font-semibold tracking-[-0.02em] text-ink-900 sm:text-6xl lg:text-[4.25rem]">
                Chaque savoir transmis ouvre une <span className="pencil text-brand-700">nouvelle page.</span>
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-500 sm:text-xl">
                MentorConnect relie les jeunes de Guinée et d&apos;Afrique à des mentors, auteurs et
                professionnels qui partagent leur expérience : pour apprendre, lire, entreprendre et oser.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <ButtonLink href={loggedIn ? "/mentors" : "/signup?role=mentee"} className="px-7 py-4 text-base">
                  Trouver mon mentor <ArrowRightIcon className="size-5" />
                </ButtonLink>
                <ButtonLink
                  href={loggedIn ? "/profile" : "/signup?role=mentor"}
                  variant="secondary"
                  className="px-7 py-4 text-base"
                >
                  Devenir mentor
                </ButtonLink>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-700">
                {["Gratuit", "Encadré par une charte", "Recommandations expliquées"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-4 text-brand-600" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <HeroArch />
          </div>
        </section>

        {/* ─── Quatre piliers ───────────────────────────────────── */}
        <section id="piliers" className="scroll-mt-20 px-4 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Notre mission"
              title={
                <>
                  Apprendre, transmettre, <span className="pencil">lire</span>, agir.
                </>
              }
              text="Le mentorat comme une bibliothèque vivante : ceux qui savent ouvrent la voie à ceux qui cherchent."
            />
            <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS(loggedIn).map((p, i) => (
                <li key={p.verb} className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[4/3]">
                    <PhotoSlot
                      name={p.photo}
                      alt=""
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      motif={p.motif}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 font-display text-sm font-semibold text-accent-600 shadow-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="font-display text-2xl font-semibold">{p.verb}</h3>
                    <p className="mt-2 flex-1 leading-relaxed text-ink-500">{p.text}</p>
                    <Link
                      href={p.href}
                      className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-700 after:absolute after:inset-0 hover:gap-3"
                    >
                      {p.cta} <ArrowRightIcon className="size-4" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Comment ça marche (style sommaire) ───────────────── */}
        <section id="parcours" className="scroll-mt-20 bg-paper px-4 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
            <div>
              <SectionTitle
                eyebrow="Votre parcours"
                title="Grandir, étape par étape."
                text="Un accompagnement clair, humain et adapté à vos ambitions."
              />
              <ButtonLink href={loggedIn ? "/dashboard" : "/signup"} className="mt-8 px-7 py-4 text-base">
                {loggedIn ? "Aller à mon espace" : "Créer mon compte"} <ArrowRightIcon className="size-5" />
              </ButtonLink>
            </div>
            <ol className="border-t border-paper-200">
              {STEPS.map((step, i) => (
                <li key={step.title} className="grid grid-cols-[auto_1fr] gap-6 border-b border-paper-200 py-8 sm:gap-10">
                  <span className="font-display text-5xl leading-none font-semibold text-accent-500 sm:text-6xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="mt-2 leading-relaxed text-ink-500">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Domaines ─────────────────────────────────────────── */}
        <section id="domaines" className="scroll-mt-20 px-4 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow={`${domains.length} domaines d'expertise`}
              title="Une expertise pour chaque ambition."
              text="De l'écriture à la création d'entreprise, de la candidature Campus France au premier emploi : des mentors issus de tous les secteurs partagent leur expérience."
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
              {/* Domaine mis en avant : culture et littérature */}
              {culture && (
                <Link
                  href={`/mentors?domain=${culture.slug}`}
                  className="group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-brand-900 text-white"
                >
                  <PhotoSlot
                    name="accueil-culture"
                    alt=""
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    motif="books"
                    tone="dark"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/95 via-brand-950/50 to-transparent" />
                  <div className="relative p-7 sm:p-9">
                    <span className="inline-flex items-center gap-2 rounded-full bg-accent-400 px-3 py-1 text-xs font-bold text-ink-900">
                      <BookmarkIcon className="size-3.5" /> À l&apos;honneur
                    </span>
                    <h3 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
                      {DOMAIN_SHORT_LABELS[culture.slug]}
                    </h3>
                    <p className="mt-3 max-w-lg text-white/80">
                      Écriture, édition, métiers du livre, création : des auteurs et professionnels de la
                      culture accompagnent les talents de demain.
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-300 group-hover:gap-3">
                      Rencontrer ces mentors <ArrowRightIcon className="size-4" />
                    </span>
                  </div>
                </Link>
              )}

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {otherDomains.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`/mentors?domain=${d.slug}`}
                      title={d.name}
                      className="group flex h-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white px-5 py-4 transition hover:border-brand-200 hover:shadow-md"
                    >
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                        <DomainIcon slug={d.slug} className="size-5" />
                      </span>
                      <span className="flex-1 font-semibold">{DOMAIN_SHORT_LABELS[d.slug] ?? d.name}</span>
                      <ChevronRightIcon className="size-5 text-ink-500 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ─── Citation ─────────────────────────────────────────── */}
        <section className="bg-paper px-4 py-20 sm:px-8 lg:py-24">
          <figure className="mx-auto max-w-4xl text-center">
            <QuoteIcon className="mx-auto size-12 text-accent-400" />
            <blockquote className="mt-6 font-display text-2xl leading-snug font-medium text-ink-900 italic sm:text-4xl">
              En Afrique, quand un vieillard meurt, c&apos;est une bibliothèque qui brûle.
            </blockquote>
            <figcaption className="mt-6 text-ink-500">
              <span className="font-semibold text-ink-900">Amadou Hampâté Bâ</span>, UNESCO, 1960
            </figcaption>
            <p className="mx-auto mt-10 max-w-2xl text-lg leading-relaxed text-ink-700">
              MentorConnect existe pour que ces bibliothèques vivantes transmettent ce qu&apos;elles savent,
              et que chaque jeune puisse y puiser.
            </p>
          </figure>
        </section>

        {/* ─── Pour qui ─────────────────────────────────────────── */}
        <section id="apropos" className="scroll-mt-20 px-4 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Pour qui ?"
              title="Le mentorat, accessible à tous ceux qui veulent avancer."
              text="Né au Salon international du livre jeunesse de Conakry pendant Novembre Numérique, MentorConnect rapproche les jeunes des professionnels expérimentés pour transmettre les savoirs et construire les carrières de demain."
            />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="rounded-3xl border border-zinc-200 p-6">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
                    <Icon className="size-6" />
                  </span>
                  <p className="mt-4 font-bold">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{text}</p>
                </li>
              ))}
              <li className="flex flex-col justify-between rounded-3xl bg-brand-900 p-6 text-white">
                <p className="font-display text-xl font-semibold">Et vous ?</p>
                <p className="mt-1 text-sm text-white/75">Quel que soit votre point de départ, il y a quelqu&apos;un pour vous guider.</p>
                <Link
                  href={loggedIn ? "/mentors" : "/signup"}
                  className="mt-4 inline-flex items-center gap-2 font-semibold text-brand-300 hover:gap-3"
                >
                  Commencer <ArrowRightIcon className="size-4" />
                </Link>
              </li>
            </ul>
            <ul className="mt-10 flex flex-wrap gap-3">
              {FEATURES.map((f) => (
                <li key={f} className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
                  <CheckIcon className="size-4" /> {f}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-ink-500">
              Une relation de confiance, encadrée par notre{" "}
              <Link href="/charte" className="font-semibold text-brand-700 hover:underline">
                charte du mentorat
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ─── Appel à l'action ─────────────────────────────────── */}
        <section className="relative overflow-hidden bg-brand-900 px-4 py-20 text-white sm:px-8 lg:py-28">
          <PhotoSlot name="accueil-atelier" alt="" sizes="100vw" motif="workshop" tone="dark" className="object-cover" />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-950/85 to-brand-950/40" />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <SectionTitle
              eyebrow="Prêt à avancer ?"
              title="Un échange peut changer toute une trajectoire."
              text="Rejoignez une communauté qui croit au pouvoir de la transmission."
              light
            />
            <Link
              href={loggedIn ? "/dashboard" : "/signup"}
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-accent-400 px-8 py-5 text-lg font-bold text-ink-900 transition-colors hover:bg-accent-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {loggedIn ? "Aller à mon espace" : "Commencer gratuitement"} <ArrowRightIcon className="size-5" />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
