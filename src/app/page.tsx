import Link from "next/link";
import type { ComponentType, CSSProperties, ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { ButtonLink } from "@/components/ui/Button";
import { PhotoSlot } from "@/components/ui/PhotoSlot";
import {
  ArrowRightIcon,
  BookOpenIcon,
  CalendarIcon,
  ChartIcon,
  CheckIcon,
  DocumentIcon,
  FeatherIcon,
  GraduationIcon,
  LightbulbIcon,
  MessageIcon,
  QuoteIcon,
  RefreshIcon,
  RocketIcon,
  SearchIcon,
  SparkleIcon,
  SproutIcon,
  TargetIcon,
  VideoIcon,
} from "@/components/ui/icons";
import { getCurrentUserId } from "@/features/auth/queries";
import { getDomains } from "@/features/profiles/queries";
import { DomainIcon } from "@/features/profiles/domainIcons";

type Icon = ComponentType<{ className?: string }>;

/** Décalage d'apparition (animation d'entrée de l'accroche). */
const delay = (ms: number): CSSProperties => ({ animationDelay: `${ms}ms` });

/** Fonctionnalités clés (maquette) : chacune mène à la page qui la réalise. */
const FEATURES_KEY: { icon: Icon; title: string; text: string; href: string }[] = [
  { icon: SearchIcon, title: "Trouver un mentor", text: "Recherchez selon vos besoins et vos objectifs.", href: "/mentors" },
  { icon: MessageIcon, title: "Échanger", text: "Discutez par chat ou en visioconférence.", href: "/mentorships" },
  { icon: CalendarIcon, title: "Planifier", text: "Prenez des rendez-vous et organisez vos séances.", href: "/sessions" },
  { icon: ChartIcon, title: "Progresser", text: "Définissez vos objectifs et suivez vos avancées.", href: "/goals" },
];

/** Petites icônes propres à l'accueil. */
const PlayCircleIcon = () => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="size-5">
    <circle cx="12" cy="12" r="9" />
    <path d="m10 8.5 5 3.5-5 3.5z" fill="currentColor" stroke="none" />
  </svg>
);

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

/**
 * Photo de l'accroche et trois cartes flottantes : APERÇU de l'application
 * (exemples illustratifs, signalés comme tels, pas des données réelles).
 */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl animate-fade-up lg:max-w-none" style={delay(250)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[40px] rounded-tl-[96px] ring-1 ring-white/15 sm:aspect-[16/11]">
        <PhotoSlot
          name="accueil-accroche"
          legacySrc="/hero.jpg"
          alt="Un mentor et une jeune femme échangent devant un ordinateur portable"
          sizes="(min-width: 1024px) 45vw, 92vw"
          motif="mentoring"
          tone="dark"
          priority
          className="object-cover object-[center_35%]"
        />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink-950/40 via-transparent to-transparent" />
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-ink-950/70 px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-white/90 backdrop-blur">
          Aperçu de l&apos;application · exemples
        </span>
      </div>

      {/* Carte « objectif » (exemple) */}
      <div className="absolute -top-5 right-2 w-56 animate-float rounded-2xl bg-white/95 p-4 text-ink-900 shadow-2xl backdrop-blur sm:-right-4 sm:w-64">
        <p className="flex items-center gap-2.5 text-sm font-bold">
          <TargetIcon className="size-6 shrink-0 text-brand-600" />
          <span>
            <span className="sr-only">Aperçu, exemple : </span>Objectif en cours
            <span className="block text-xs font-medium text-ink-500">Préparer ma candidature Campus France</span>
          </span>
        </p>
        <p className="mt-3 flex items-center gap-2 text-xs font-bold">
          <span aria-hidden className="h-2 flex-1 overflow-hidden rounded-full bg-brand-100">
            <span className="block h-full w-[70%] rounded-full bg-gradient-to-r from-brand-600 to-accent-400" />
          </span>
          70%
        </p>
      </div>

      {/* Carte « séance » (exemple) */}
      <div
        className="absolute -bottom-6 left-2 flex animate-float items-center gap-3 rounded-2xl bg-white/95 p-3.5 text-ink-900 shadow-2xl backdrop-blur sm:-left-6 sm:p-4"
        style={delay(1500)}
      >
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <VideoIcon className="size-5" />
        </span>
        <span>
          <span className="block text-sm font-bold">
            <span className="sr-only">Aperçu, exemple : </span>Séance en visio
          </span>
          <span className="block text-xs text-ink-500">Aujourd&apos;hui · 14:00</span>
        </span>
      </div>

      {/* Carte « chat » (exemple) */}
      <div
        className="absolute right-2 bottom-12 hidden animate-float items-center gap-3 rounded-2xl bg-white/95 p-3.5 text-ink-900 shadow-2xl backdrop-blur sm:-right-6 sm:flex"
        style={delay(800)}
      >
        <span className="relative inline-flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          <MessageIcon className="size-5" />
          <span aria-hidden className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-red-500 ring-2 ring-white" />
        </span>
        <span>
          <span className="block text-sm font-bold">
            <span className="sr-only">Aperçu, exemple : </span>Chat mentor
          </span>
          <span className="block text-xs text-ink-500">2 nouveaux messages</span>
        </span>
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
        {/* ─── Accroche (dégradé sombre de la charte) ───────────── */}
        <section className="relative overflow-hidden bg-gradient-dark text-white">
          <div aria-hidden className="absolute -top-40 -left-32 size-[520px] rounded-full bg-brand-500/25 blur-[120px]" />
          <div aria-hidden className="absolute -right-40 bottom-0 size-[420px] rounded-full bg-accent-400/15 blur-[120px]" />
          <svg
            aria-hidden
            viewBox="0 0 600 600"
            className="pointer-events-none absolute -right-24 -bottom-40 hidden h-[640px] w-[640px] text-accent-400/30 lg:block"
          >
            <path d="M560 40C380 120 260 300 230 600" fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="round" />
          </svg>

          <div className="relative mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pt-10 pb-20 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:pt-14 lg:pb-24">
            <div>
              <p
                className="inline-flex animate-fade-up flex-wrap items-center gap-x-3 gap-y-1 rounded-full border border-white/25 bg-white/5 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur sm:text-sm"
                style={delay(0)}
              >
                <span className="inline-flex items-center gap-2">
                  <CalendarIcon className="size-4 text-accent-400" /> Talents connect
                </span>
                <span aria-hidden className="hidden h-4 w-px bg-white/30 sm:block" />
                <span className="inline-flex items-center gap-2">
                  <BookOpenIcon className="size-4 text-accent-400" /> Salon international du livre de jeunesse de Conakry
                </span>
              </p>
              <h1
                className="mt-7 animate-fade-up text-[2.6rem] leading-[1.05] font-extrabold tracking-[-0.03em] sm:text-6xl lg:text-[4.1rem]"
                style={delay(80)}
              >
                Chaque savoir transmis ouvre une <span className="text-gradient">nouvelle page.</span>
              </h1>
              <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-white/80" style={delay(160)}>
                MentorConnect met en relation les jeunes talents avec des professionnels expérimentés. Trouvez un
                mentor adapté à vos objectifs, échangez par chat ou visioconférence et progressez à votre rythme.
              </p>
              <div
                className="mt-8 flex animate-fade-up flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4"
                style={delay(240)}
              >
                <ButtonLink
                  href={loggedIn ? "/mentors" : "/signup?role=mentee"}
                  className="group bg-accent-400! px-7 py-4 text-base text-ink-950! hover:bg-accent-300!"
                >
                  Trouver un mentor <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" />
                </ButtonLink>
                <ButtonLink
                  href="#parcours"
                  variant="ghost"
                  className="border border-white/40 px-7 py-4 text-base text-white! hover:bg-white/10!"
                >
                  <PlayCircleIcon /> Voir comment ça marche
                </ButtonLink>
              </div>
              <ul className="mt-7 flex animate-fade-up flex-wrap gap-x-6 gap-y-2 text-sm text-white/80" style={delay(320)}>
                {["Mentorat personnalisé", "Échanges (chat & visio)", "Suivi de vos objectifs"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-4 text-accent-400" /> {t}
                  </li>
                ))}
              </ul>
            </div>
            <HeroVisual />
          </div>
        </section>

        {/* ─── Fonctionnalités clés ─────────────────────────────── */}
        <section id="fonctionnalites" className="scroll-mt-20 px-4 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[0.8fr_2fr]">
            <div className="reveal">
              <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-[0.12em] text-brand-700 uppercase">
                Les fonctionnalités clés
              </p>
              <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl">
                Un accompagnement complet, du conseil à la réalisation.
              </h2>
              <span aria-hidden className="mt-5 block h-1 w-14 rounded-full bg-accent-400" />
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {FEATURES_KEY.map(({ icon: Icon, title, text, href }, i) => (
                <li key={title} className="reveal">
                  <Link
                    href={loggedIn ? href : "/signup"}
                    className={`group flex h-full flex-col gap-3 rounded-2xl border p-5 shadow-card transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover ${
                      i === 1 ? "border-brand-200 bg-brand-50/70" : "border-slate-200/80 bg-white"
                    }`}
                  >
                    <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                      <Icon className="size-6" />
                    </span>
                    <span className="text-lg font-bold text-ink-900">{title}</span>
                    <span className="text-sm leading-relaxed text-ink-500">{text}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Domaines d'expertise (les 7 domaines des termes de référence) ─── */}
        <section id="domaines" className="scroll-mt-20 bg-paper px-4 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_2fr] lg:items-center">
            <div className="reveal">
              <p className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-[0.12em] text-brand-700 uppercase">
                {domains.length > 0 ? `${domains.length} domaines d'expertise` : "Domaines d'expertise"}
              </p>
              <h2 className="mt-4 text-3xl leading-tight font-bold tracking-tight text-ink-900 sm:text-4xl">
                Une expertise pour chaque ambition.
              </h2>
              <p className="mt-4 text-ink-500">
                Des mentors issus de secteurs variés pour vous accompagner dans votre parcours académique,
                professionnel ou entrepreneurial.
              </p>
              <ButtonLink href={loggedIn ? "/domains" : "/signup"} className="group mt-6">
                {domains.length > 0 ? `Explorer les ${domains.length} domaines` : "Explorer les domaines"}{" "}
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
              </ButtonLink>
            </div>
            {/* Coupure réseau passagère : message clair plutôt qu'une grille vide */}
            {domains.length === 0 && (
              <p className="rounded-2xl border border-slate-200/80 bg-white p-6 text-ink-500 shadow-card">
                Les domaines n&apos;ont pas pu être chargés pour le moment. Actualisez la page dans un instant.
              </p>
            )}
            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {domains.map((d) => (
                <li key={d.id} className="reveal">
                  <Link
                    href={`/mentors?domain=${d.slug}`}
                    className="group flex h-full items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-card transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-3">
                      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-700 group-hover:text-white">
                        <DomainIcon slug={d.slug} className="size-5" />
                      </span>
                      <span className="text-[15px] leading-snug font-bold text-ink-900">{d.name}</span>
                    </span>
                    <ArrowRightIcon className="size-4 shrink-0 self-end text-brand-600 transition-transform group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ─── Fonctionnement en trois étapes ───────────────────── */}
        <section id="parcours" className="scroll-mt-20 bg-white px-4 py-20 sm:px-8 lg:py-28">
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
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-800 group-hover:text-white">
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
          <div className="reveal relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-dark px-6 py-14 text-white sm:px-12 lg:py-20">
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
