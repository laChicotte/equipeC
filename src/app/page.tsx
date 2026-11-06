import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";
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
  MessageIcon,
  QuoteIcon,
  RefreshIcon,
  RocketIcon,
  SparkleIcon,
  SproutIcon,
  TargetIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { getCurrentUserId } from "@/features/auth/queries";
import { getDomains } from "@/features/profiles/queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { DomainIcon } from "@/features/profiles/domainIcons";

type Icon = ComponentType<{ className?: string }>;

/** Décalage d'apparition (animation d'entrée de l'accroche). */
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

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

const STEPS: { icon: Icon; title: string; text: string }[] = [
  {
    icon: TargetIcon,
    title: "Parlez-nous de vous",
    text: "Décrivez votre projet, vos objectifs et les défis que vous souhaitez relever.",
  },
  {
    icon: SparkleIcon,
    title: "Trouvez votre mentor",
    text: "Notre moteur de recommandation identifie les profils les plus pertinents, et explique pourquoi.",
  },
  {
    icon: MessageIcon,
    title: "Progressez ensemble",
    text: "Chat, séances en visio, objectifs suivis : chaque avancée est visible.",
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

/** Photo de l'accroche et deux cartes flottantes (aperçu de l'application). */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-up lg:max-w-none" style={delay(250)}>
      {/* Halo émeraude derrière la photo */}
      <div aria-hidden className="absolute inset-6 rounded-[40px] bg-accent-400/30 blur-3xl" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] ring-1 ring-white/10">
        <PhotoSlot
          name="accueil-accroche"
          legacySrc="/hero.jpg"
          alt="Une jeune professionnelle accompagnée par deux mentors devant son poste de travail"
          sizes="(min-width: 1024px) 40vw, 90vw"
          motif="mentoring"
          tone="dark"
          priority
          className="object-cover object-[center_40%]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/50 via-transparent to-transparent" />
        {/* Les deux cartes flottantes sont des exemples, pas des données réelles */}
        <span className="absolute top-4 left-4 rounded-full bg-ink-950/70 px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-white/90 backdrop-blur">
          Aperçu de l&apos;application · exemples
        </span>
      </div>

      {/* Carte « compatibilité » (exemple) */}
      <div className="absolute top-[12%] -right-2 flex animate-float items-center gap-3 rounded-2xl bg-white/95 p-3.5 shadow-2xl backdrop-blur sm:-right-8 sm:p-4">
        <div className="relative size-12 sm:size-14">
          <svg viewBox="0 0 56 56" className="-rotate-90" aria-hidden>
            <circle cx="28" cy="28" r="24" fill="none" stroke="#d1fae5" strokeWidth="5" />
            <circle cx="28" cy="28" r="24" fill="none" stroke="#059669" strokeWidth="5" strokeLinecap="round" strokeDasharray="150.8" strokeDashoffset="6" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-ink-900">96%</span>
        </div>
        <div>
          <p className="font-bold text-ink-900">
            <span className="sr-only">Aperçu, exemple : </span>Excellent match
          </p>
          <p className="text-xs text-ink-500">Selon votre objectif</p>
        </div>
      </div>

      {/* Carte « séance » (exemple) */}
      <div
        className="absolute -bottom-5 left-0 flex animate-float items-center gap-3 rounded-2xl bg-white/95 p-3.5 shadow-2xl backdrop-blur sm:-left-8 sm:p-4"
        style={delay(1500)}
      >
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <VideoIcon className="size-5" />
        </span>
        <div>
          <p className="text-sm font-bold text-ink-900">
            <span className="sr-only">Aperçu, exemple : </span>Séance en visio
          </p>
          <p className="text-xs text-ink-500">Demain · 18:00</p>
        </div>
      </div>
    </div>
  );
}

/** Titre de section : sur-titre + grand titre. */
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
    <div className={`reveal ${center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}`}>
      <p
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-[0.12em] uppercase ${
          light ? "bg-white/10 text-accent-300" : "bg-brand-50 text-brand-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2 className={`mt-5 text-[2rem] leading-[1.12] font-extrabold tracking-tight sm:text-5xl ${light ? "text-white" : "text-ink-900"}`}>
        {title}
      </h2>
      {text && <p className={`mt-5 text-lg leading-relaxed ${light ? "text-white/70" : "text-ink-500"}`}>{text}</p>}
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
        {/* ─── Accroche (bleu nuit) ──────────────────────────────── */}
        <section className="relative overflow-hidden bg-ink-950 text-white">
          {/* Halos et grille discrète */}
          <div aria-hidden className="absolute -top-40 -left-32 size-[520px] rounded-full bg-brand-500/25 blur-[120px]" />
          <div aria-hidden className="absolute -right-40 bottom-0 size-[420px] rounded-full bg-accent-400/15 blur-[120px]" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
          />

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pt-12 pb-24 sm:px-8 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-20 lg:pb-32">
            <div>
              <p
                className="inline-flex animate-fade-up items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 backdrop-blur"
                style={delay(0)}
              >
                <BookmarkIcon className="size-4 text-accent-400" />
                Né au Salon du livre de jeunesse de Conakry
              </p>
              <h1
                className="mt-7 animate-fade-up text-[2.6rem] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-6xl lg:text-[4.25rem]"
                style={delay(80)}
              >
                Chaque savoir transmis ouvre une <span className="text-gradient">nouvelle page.</span>
              </h1>
              <p className="mt-7 max-w-xl animate-fade-up text-lg leading-relaxed text-white/70 sm:text-xl" style={delay(160)}>
                MentorConnect relie les jeunes de Guinée et d&apos;Afrique à des mentors, auteurs et
                professionnels qui partagent leur expérience : pour apprendre, lire, entreprendre et oser.
              </p>
              <div
                className="mt-9 flex animate-fade-up flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
                style={delay(240)}
              >
                <ButtonLink
                  href={loggedIn ? "/mentors" : "/signup?role=mentee"}
                  className="group bg-accent-400! px-7 py-4 text-base text-ink-950! hover:bg-accent-300!"
                >
                  Trouver mon mentor <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
                </ButtonLink>
                <ButtonLink
                  href={loggedIn ? "/profile" : "/signup?role=mentor"}
                  variant="ghost"
                  className="border border-white/20 px-7 py-4 text-base text-white! hover:bg-white/10!"
                >
                  Devenir mentor
                </ButtonLink>
              </div>
              <ul className="mt-8 flex animate-fade-up flex-wrap gap-x-6 gap-y-2 text-sm text-white/70" style={delay(320)}>
                {["Gratuit", "Encadré par une charte", "Recommandations expliquées"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-4 text-accent-400" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* ─── Concept : quatre piliers ─────────────────────────── */}
        <section id="piliers" className="scroll-mt-20 px-4 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Le concept"
              title={
                <>
                  Apprendre, transmettre, <span className="pencil">lire</span>, agir.
                </>
              }
              text="Le mentorat comme une bibliothèque vivante : ceux qui savent ouvrent la voie à ceux qui cherchent."
            />
            <ol className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS(loggedIn).map((p, i) => (
                <li
                  key={p.verb}
                  className="reveal group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-1.5 hover:shadow-card-hover"
                >
                  <div className="relative aspect-[16/9] overflow-hidden sm:aspect-[4/3]">
                    <PhotoSlot
                      name={p.photo}
                      alt=""
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      motif={p.motif}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-600 shadow-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl font-bold text-ink-900">{p.verb}</h3>
                    <p className="mt-2 flex-1 leading-relaxed text-ink-500">{p.text}</p>
                    <Link
                      href={p.href}
                      className="mt-5 inline-flex items-center gap-2 font-semibold text-brand-600 after:absolute after:inset-0"
                    >
                      {p.cta} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ─── Fonctionnement en trois étapes ───────────────────── */}
        <section id="parcours" className="scroll-mt-20 bg-paper px-4 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow="Comment ça marche"
              title="Trois étapes pour avancer."
              text="Un accompagnement clair, humain et adapté à vos ambitions."
              center
            />
            <ol className="relative mt-16 grid gap-6 md:grid-cols-3 md:gap-8">
              {/* Ligne qui relie les étapes (ordinateur) */}
              <div aria-hidden className="absolute top-8 right-[16%] left-[16%] hidden h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200 md:block" />
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="reveal relative flex flex-col items-center text-center">
                  <span className="relative flex size-16 items-center justify-center rounded-2xl bg-white text-brand-600 shadow-card ring-1 ring-slate-200/70">
                    <Icon className="size-7" />
                    <span className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-ink-900 text-[11px] font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <h3 className="mt-6 text-xl font-bold text-ink-900">{title}</h3>
                  <p className="mt-2 max-w-xs leading-relaxed text-ink-500">{text}</p>
                </li>
              ))}
            </ol>
            <div className="reveal mt-14 text-center">
              <ButtonLink href={loggedIn ? "/dashboard" : "/signup"} className="group px-7 py-4 text-base">
                {loggedIn ? "Aller à mon espace" : "Créer mon compte gratuitement"}{" "}
                <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
              </ButtonLink>
            </div>
          </div>
        </section>

        {/* ─── Domaines de mentorat ─────────────────────────────── */}
        <section id="domaines" className="scroll-mt-20 px-4 py-20 sm:px-8 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <SectionTitle
              eyebrow={`${domains.length} domaines d'expertise`}
              title="Une expertise pour chaque ambition."
              text="De l'écriture à la création d'entreprise, de la candidature Campus France au premier emploi."
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
              {culture && (
                <Link
                  href={`/mentors?domain=${culture.slug}`}
                  className="reveal group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-3xl bg-ink-900 text-white shadow-card transition-shadow duration-300 hover:shadow-card-hover"
                >
                  <PhotoSlot
                    name="accueil-culture"
                    alt=""
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    motif="books"
                    tone="dark"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/50 to-transparent" />
                  <div className="relative p-7 sm:p-9">
                    <span className="inline-flex items-center gap-2 rounded-full bg-accent-400 px-3 py-1 text-xs font-bold text-ink-950">
                      <BookmarkIcon className="size-3.5" /> À l&apos;honneur
                    </span>
                    <h3 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
                      {DOMAIN_SHORT_LABELS[culture.slug]}
                    </h3>
                    <p className="mt-3 max-w-lg text-white/75">
                      Écriture, édition, métiers du livre, création : des auteurs et professionnels de la
                      culture accompagnent les talents de demain.
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 font-semibold text-accent-300">
                      Rencontrer ces mentors <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              )}

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {otherDomains.map((d) => (
                  <li key={d.id} className="reveal">
                    <Link
                      href={`/mentors?domain=${d.slug}`}
                      title={d.name}
                      className="group flex h-full items-center gap-4 rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-card transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
                    >
                      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                        <DomainIcon slug={d.slug} className="size-5" />
                      </span>
                      <span className="flex-1 font-semibold text-ink-900">{DOMAIN_SHORT_LABELS[d.slug] ?? d.name}</span>
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
          <figure className="reveal mx-auto max-w-4xl text-center">
            <QuoteIcon className="mx-auto size-12 text-brand-400" />
            <blockquote className="mt-6 text-2xl leading-snug font-bold tracking-tight text-ink-900 sm:text-4xl">
              « En Afrique, quand un vieillard meurt, c&apos;est une bibliothèque qui brûle. »
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
              text="Né au Salon international du livre de jeunesse de Conakry pendant le Mois du Numérique (programme « Talents connect »), MentorConnect rapproche les jeunes des professionnels expérimentés pour transmettre les savoirs et construire les carrières de demain."
            />
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {AUDIENCES.map(({ icon: Icon, title, text }) => (
                <li
                  key={title}
                  className="reveal group rounded-3xl border border-slate-200/70 bg-white p-6 shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-card-hover"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-600 group-hover:text-white">
                    <Icon className="size-6" />
                  </span>
                  <p className="mt-4 font-bold text-ink-900">{title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-500">{text}</p>
                </li>
              ))}
              <li className="reveal relative flex flex-col justify-between overflow-hidden rounded-3xl bg-ink-900 p-6 text-white">
                <div aria-hidden className="absolute -top-10 -right-10 size-32 rounded-full bg-accent-400/30 blur-2xl" />
                <p className="relative text-xl font-bold">Et vous ?</p>
                <p className="relative mt-1 text-sm text-white/70">
                  Quel que soit votre point de départ, il y a quelqu&apos;un pour vous guider.
                </p>
                <Link
                  href={loggedIn ? "/mentors" : "/signup"}
                  className="group relative mt-4 inline-flex items-center gap-2 font-semibold text-accent-300"
                >
                  Commencer <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </li>
            </ul>
            <ul className="reveal mt-10 flex flex-wrap gap-3">
              {FEATURES.map((f) => (
                <li key={f} className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-700">
                  <CheckIcon className="size-4" /> {f}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-ink-500">
              Une relation de confiance, encadrée par notre{" "}
              <Link href="/charte" className="font-semibold text-brand-600 hover:underline">
                charte du mentorat
              </Link>
              .
            </p>
          </div>
        </section>

        {/* ─── Appel à l'action ─────────────────────────────────── */}
        <section className="px-4 pb-20 sm:px-8 lg:pb-28">
          <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-[32px] bg-ink-950 px-6 py-14 text-white sm:px-12 lg:py-20">
            <PhotoSlot name="accueil-atelier" alt="" sizes="(min-width: 1280px) 1280px, 100vw" motif="workshop" tone="dark" className="object-cover opacity-30" />
            <div aria-hidden className="absolute -top-24 -right-24 size-96 rounded-full bg-brand-500/30 blur-[100px]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/90 to-ink-950/40" />
            <div className="relative flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <h2 className="text-[2rem] leading-[1.12] font-extrabold tracking-tight sm:text-5xl">
                  Un échange peut changer toute une <span className="text-gradient">trajectoire.</span>
                </h2>
                <p className="mt-5 text-lg text-white/70">Rejoignez une communauté qui croit au pouvoir de la transmission.</p>
              </div>
              <Link
                href={loggedIn ? "/dashboard" : "/signup"}
                className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-accent-400 px-8 py-5 text-lg font-bold text-ink-950 shadow-lg shadow-accent-400/20 transition-[background-color,transform] duration-200 hover:bg-accent-300 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {loggedIn ? "Aller à mon espace" : "Commencer gratuitement"}{" "}
                <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
