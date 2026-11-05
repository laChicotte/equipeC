import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { getCurrentUserId } from "@/features/auth/queries";
import { getDomains } from "@/features/profiles/queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";

// Photo facultative de l'accroche : déposez public/hero.jpg (portrait, libre de droits)
const HERO_PHOTO = existsSync(path.join(process.cwd(), "public", "hero.jpg"));

const svg = (children: ReactNode, className = "size-6") => (
  <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
    {children}
  </svg>
);
const sparkle = (
  <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7ZM19 15c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
);
const arrow = svg(<path d="M5 12h14M13 6l6 6-6 6" />, "size-5");

const STEPS = [
  {
    icon: svg(<><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><path d="m12 12 6-6" /></>),
    tile: "bg-brand-50 text-brand-700",
    title: "Parlez-nous de vous",
    text: "Décrivez votre projet, vos objectifs et les défis que vous souhaitez relever.",
    href: "/signup?role=mentee",
  },
  {
    icon: svg(sparkle),
    tile: "bg-amber-50 text-accent-500",
    title: "Trouvez votre mentor",
    text: "Notre moteur de recommandation identifie les profils les plus pertinents pour vous, et explique pourquoi.",
    href: "#domaines",
  },
  {
    icon: svg(<><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5a6.5 6.5 0 0 1 3.5 5.5" /></>),
    tile: "bg-brand-50 text-brand-700",
    title: "Progressez ensemble",
    text: "Échangez par chat, planifiez vos séances en visio, suivez vos objectifs et célébrez chaque avancée.",
    href: "#apropos",
  },
];

// Publics cibles du cahier des charges (§2.3)
const AUDIENCES = [
  { icon: "🎓", title: "Étudiants", text: "Orientation, choix d'études, projet Campus France." },
  { icon: "📄", title: "Jeunes diplômés", text: "CV, entretiens, premier emploi." },
  { icon: "🚀", title: "Entrepreneurs", text: "Structurer, financer, développer son activité." },
  { icon: "💡", title: "Porteurs de projet", text: "Passer de l'idée au projet concret." },
  { icon: "🔄", title: "En reconversion", text: "Changer de voie, accompagné." },
];

const FEATURES = [
  "Recommandations expliquées",
  "Chat en temps réel",
  "Séances en visio",
  "Objectifs et progression",
  "Évaluation des séances",
  "Ressources et opportunités",
];

/** Arche de l'accroche : photo (si fournie) ou illustration de l'application. */
function HeroArch() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* Halo sarcelle derrière l'arche */}
      <div aria-hidden className="absolute -right-3 bottom-0 h-[92%] w-[92%] rounded-t-full bg-brand-50" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-gradient-to-b from-[#efe3d3] to-[#e6d5c0]">
        {HERO_PHOTO ? (
          <Image
            src="/hero.jpg"
            alt="Une mentorée souriante, tablette à la main"
            fill
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            className="object-cover object-top"
          />
        ) : (
          // Sans photo : aperçu de l'application (fiche mentor + conversation)
          <div aria-hidden className="absolute inset-0 flex flex-col justify-center gap-4 px-[10%] pt-[18%]">
            <div className="rounded-3xl bg-white p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-14 items-center justify-center rounded-full bg-brand-100 text-lg font-bold text-brand-800">
                  FD
                </span>
                <div>
                  <p className="font-bold">Fatoumata D.</p>
                  <p className="text-xs text-ink-500">Conseillère en orientation · 11 ans</p>
                  <p className="text-xs text-accent-500">★★★★★ <span className="text-ink-500">5,0</span></p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-800">Campus France</span>
                <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-800">Orientation</span>
              </div>
            </div>
            <div className="max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-ink-900 shadow-lg">
              On prépare ton entretien Campus France demain ?
            </div>
            <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-sm text-white shadow-lg">
              Avec plaisir, merci ! 🙏
            </div>
          </div>
        )}
      </div>

      {/* Bulle « Excellent match » */}
      <div className="absolute top-[16%] -right-2 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl sm:-right-6">
        <div className="relative size-14">
          <svg viewBox="0 0 56 56" className="-rotate-90" aria-hidden>
            <circle cx="28" cy="28" r="24" fill="none" stroke="#e7efed" strokeWidth="5" />
            <circle cx="28" cy="28" r="24" fill="none" stroke="#19a08a" strokeWidth="5" strokeLinecap="round" strokeDasharray="150.8" strokeDashoffset="6" />
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

      {/* Carte « séance » en bas */}
      <div className="absolute -bottom-5 left-0 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl sm:-left-8">
        <span className="inline-flex size-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
          {svg(<><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10 5-3v10l-5-3" /></>, "size-5")}
        </span>
        <div>
          <p className="text-sm font-bold">Séance en visio</p>
          <p className="text-xs text-ink-500">Demain · 18:00</p>
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  // Domaines : lecture publique (règle RLS « domains: lecture publique »)
  const [domains, userId] = await Promise.all([getDomains(), getCurrentUserId()]);
  const loggedIn = Boolean(userId);

  return (
    <div className="bg-white">
      {/* En-tête */}
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-6 sm:px-8">
        <Logo />
        <nav aria-label="Sections" className="hidden items-center gap-10 text-[15px] text-ink-700 lg:flex">
          <a href="#parcours" className="hover:text-brand-700">Comment ça marche</a>
          <a href="#domaines" className="hover:text-brand-700">Domaines</a>
          <Link href="/mentors" className="hover:text-brand-700">Nos mentors</Link>
          <a href="#apropos" className="hover:text-brand-700">À propos</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-6">
          {loggedIn ? (
            <ButtonLink href="/dashboard">Mon espace</ButtonLink>
          ) : (
            <>
              <Link href="/login" className="px-2 font-semibold text-ink-900 hover:text-brand-700">
                Se connecter
              </Link>
              <ButtonLink href="/signup" className="px-6 text-base">
                Commencer
              </ButtonLink>
            </>
          )}
        </div>
      </header>

      <main>
        {/* Accroche */}
        <section className="mx-auto grid w-full max-w-7xl items-center gap-16 px-4 pt-10 pb-24 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:pt-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-xs font-bold tracking-[0.08em] text-brand-700 uppercase">
              {svg(sparkle, "size-4")} Le mentor qui comprend votre ambition
            </p>
            <h1 className="mt-7 text-5xl leading-[1.05] font-extrabold tracking-[-0.03em] text-ink-900 sm:text-6xl lg:text-7xl">
              Votre potentiel mérite le{" "}
              <span className="relative inline-block text-brand-600">
                bon guide.
                <svg aria-hidden viewBox="0 0 300 12" preserveAspectRatio="none" className="absolute -bottom-2 left-0 h-3 w-full text-accent-400">
                  <path d="M2 9C80 3 200 2 298 7" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-500 sm:text-xl">
              Accélérez votre parcours grâce à des mentors expérimentés, engagés pour faire grandir
              les talents de Guinée et d&apos;Afrique.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <ButtonLink href={loggedIn ? "/mentors" : "/signup?role=mentee"} className="px-8 py-4 text-base">
                Trouver mon mentor {arrow}
              </ButtonLink>
              <a href="#parcours" className="group inline-flex items-center gap-4 font-semibold text-ink-900">
                <span className="inline-flex size-12 items-center justify-center rounded-full border border-zinc-200 transition-colors group-hover:border-brand-600">
                  {svg(<path d="M9 7v10l8-5z" />, "size-4")}
                </span>
                Découvrir MentorConnect
              </a>
            </div>
          </div>
          <HeroArch />
        </section>

        {/* Votre parcours */}
        <section id="parcours" className="scroll-mt-8 px-4 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="eyebrow">Votre parcours</p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">Grandir, étape par étape</h2>
              <p className="mt-4 text-lg text-ink-500">Un accompagnement clair, humain et adapté à vos ambitions.</p>
            </div>
            <ol className="mt-14 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => (
                <li key={step.title} className="relative rounded-3xl border border-zinc-200 p-8">
                  <span className="absolute top-8 right-8 text-sm font-medium text-zinc-400">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`inline-flex size-16 items-center justify-center rounded-2xl ${step.tile}`}>{step.icon}</span>
                  <h3 className="mt-8 text-xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-relaxed text-ink-500">{step.text}</p>
                  <a href={step.href} className="mt-6 inline-flex items-center gap-2 font-semibold text-brand-700 hover:gap-3">
                    En savoir plus {arrow}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Domaines (lus en base) */}
        <section id="domaines" className="scroll-mt-8 bg-background px-4 py-24 sm:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <p className="eyebrow inline-block border-t-2 border-brand-600 pt-1">
                {domains.length} domaines d&apos;expertise
              </p>
              <h2 className="mt-6 text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
                Une expertise pour chaque ambition.
              </h2>
              <p className="mt-5 max-w-md text-ink-500">
                De la création d&apos;entreprise à la candidature Campus France, des mentors issus de
                tous les secteurs partagent leur expérience.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {domains.map((d, i) => (
                <li key={d.id}>
                  <Link
                    href={`/mentors?domain=${d.slug}`}
                    title={d.name}
                    className="group flex items-center gap-4 rounded-2xl bg-white px-6 py-5 transition hover:shadow-md"
                  >
                    <span className="text-sm text-brand-600">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 font-medium">{DOMAIN_SHORT_LABELS[d.slug] ?? d.name}</span>
                    <span className="text-ink-500 transition-transform group-hover:translate-x-1">
                      {svg(<path d="m9 6 6 6-6 6" />, "size-5")}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* À propos : pour qui, et ce que propose la plateforme */}
        <section id="apropos" className="scroll-mt-8 px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow">À propos</p>
            <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
              Le mentorat, accessible à tous ceux qui veulent avancer.
            </h2>
            <p className="mt-5 max-w-3xl text-lg text-ink-500">
              Né au Salon international du livre de jeunesse de Conakry pendant le Mois du
              Numérique, MentorConnect rapproche les jeunes des professionnels expérimentés pour
              transmettre les savoirs et construire les carrières de demain.
            </p>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {AUDIENCES.map((a) => (
                <li key={a.title} className="rounded-3xl border border-zinc-200 p-6">
                  <span aria-hidden className="text-3xl">{a.icon}</span>
                  <p className="mt-4 font-bold">{a.title}</p>
                  <p className="mt-1 text-sm text-ink-500">{a.text}</p>
                </li>
              ))}
            </ul>
            <ul className="mt-8 flex flex-wrap gap-3">
              {FEATURES.map((f) => (
                <li key={f} className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-sm font-medium text-brand-800">
                  <span aria-hidden>✓</span> {f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Appel à l'action */}
        <section className="bg-ink-900 px-4 py-20 text-white sm:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-block border-t-2 border-accent-400 pt-1 text-xs font-bold tracking-[0.16em] text-accent-400 uppercase">
                Prêt à avancer ?
              </p>
              <h2 className="mt-6 max-w-3xl text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
                Un échange peut changer toute une trajectoire.
              </h2>
              <p className="mt-5 text-lg text-white/70">
                Rejoignez une communauté qui croit au pouvoir de la transmission.
              </p>
            </div>
            <Link
              href={loggedIn ? "/dashboard" : "/signup"}
              className="inline-flex shrink-0 items-center justify-center gap-3 rounded-xl bg-accent-400 px-8 py-5 text-lg font-bold text-ink-900 transition-colors hover:bg-accent-500"
            >
              {loggedIn ? "Aller à mon espace" : "Commencer gratuitement"} {arrow}
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#12223a] px-4 py-8 text-white sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-12">
            <Logo tone="light" />
            <p className="text-sm text-white/70">Une expérience à partager, un avenir à construire.</p>
          </div>
          <p className="text-sm text-white/50">© 2026 MentorConnect · Conakry</p>
        </div>
        <p className="mx-auto mt-6 max-w-7xl text-xs text-white/40">
          L&apos;accompagnement Campus France relève du conseil et du partage d&apos;expérience : il ne
          garantit ni l&apos;admission dans un établissement, ni l&apos;obtention d&apos;un visa.
        </p>
      </footer>
    </div>
  );
}
