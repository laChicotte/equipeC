/**
 * Haut du tableau de bord MENTOR — page pilote du Design System
 * (charte « vert profond et émeraude », police Inter).
 * Bienvenue, quatre statistiques, bannière de partage d'expérience.
 * Mêmes données, libellés, liens et conditions qu'avant : seul l'habillage change.
 * Le tableau de bord mentoré n'est pas concerné.
 */
import Link from "next/link";
import type { ComponentType } from "react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ArrowRightIcon, CalendarIcon, CheckIcon, MessageIcon, SparkleIcon, UsersIcon } from "@/components/ui/icons";

type Icon = ComponentType<{ className?: string }>;
type Tone = "green" | "amber" | "blue" | "violet";

/** Teintes des cartes de statistiques (fond très léger + pastille d'icône). */
const TONES: Record<Tone, { card: string; icon: string }> = {
  green: { card: "from-brand-50/80", icon: "bg-brand-100 text-brand-700" },
  amber: { card: "from-amber-50/80", icon: "bg-amber-100 text-amber-700" },
  blue: { card: "from-sky-50/80", icon: "bg-sky-100 text-sky-700" },
  violet: { card: "from-violet-50/80", icon: "bg-violet-100 text-violet-700" },
};

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  tone,
}: {
  icon: Icon;
  label: string;
  value: string;
  hint?: string;
  href: string;
  tone: Tone;
}) {
  const t = TONES[tone];
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-gradient-to-br ${t.card} to-surface p-4 shadow-soft transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-soft-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 sm:p-5`}
    >
      <span className="flex items-center gap-3">
        <span className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl ${t.icon}`}>
          <Icon className="size-5" />
        </span>
        <span className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">{value}</span>
      </span>
      <span className="text-sm font-medium text-ink-700">{label}</span>
      {hint && <span className="-mt-1.5 text-xs text-ink-500">{hint}</span>}
    </Link>
  );
}

export function MentorTop({
  isMentor = true,
  firstName,
  today,
  pendingCount,
  activeCount,
  sessionCount,
  goals,
  overall,
  onboarded,
}: {
  /** false : tableau de bord mentoré (mêmes blocs, libellés adaptés) */
  isMentor?: boolean;
  firstName: string;
  today: string;
  pendingCount: number;
  activeCount: number;
  sessionCount: number;
  goals: { done: number; total: number };
  overall: number | null;
  onboarded: boolean;
}) {
  const banner = isMentor
    ? {
    title: "Partagez votre expérience.",
    // On ne demande de compléter le profil que s'il est incomplet
    text: onboarded
      ? "Publiez un guide, une lecture ou un conseil : toute la communauté pourra en profiter."
      : "Complétez votre profil : les mentorés vous trouveront plus facilement.",
    cta: onboarded ? "Partager une ressource" : "Compléter mon profil",
    href: onboarded ? "/resources" : "/onboarding",
  }
    : {
        title: "Trouvez le mentor qui vous correspond vraiment.",
        // Texte et bouton cohérents avec la destination réelle du lien
        text: onboarded
          ? "Vos recommandations s'appuient sur vos domaines et vos objectifs, chacune expliquée."
          : "Décrivez votre objectif, notre algorithme de mise en relation s'occupe du reste.",
        cta: onboarded ? "Découvrir les mentors" : "Décrire mon objectif",
        href: onboarded ? "/mentors" : "/onboarding",
      };

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* 1. Bienvenue */}
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.14em] text-brand-700 uppercase">{today}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Bonjour {firstName},{" "}
            <span aria-hidden className="inline-block">
              👋
            </span>
          </h1>
          <p className="mt-1.5 text-base text-ink-700">
            {!isMentor
              ? "Envie de faire avancer vos ambitions aujourd'hui ?"
              : pendingCount > 0
                ? `${pendingCount} demande${pendingCount > 1 ? "s" : ""} de mentorat vous attend${pendingCount > 1 ? "ent" : ""}.`
                : "Merci de partager votre expérience avec la nouvelle génération."}
          </p>
        </div>
        {overall !== null && (
          <ProgressRing percent={overall} label={isMentor ? "Mentorés" : "Parcours"} color="#10b981" trackColor="#d1fae5" />
        )}
      </header>

      {/* 2. Statistiques : uniquement des chiffres réels */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={UsersIcon} label={isMentor ? "Mentorés suivis" : "Mentorats actifs"} value={String(activeCount)} href="/mentorships" tone="green" />
        <StatCard
          icon={MessageIcon}
          label={isMentor ? "Demandes à traiter" : "Demandes en attente"}
          value={String(pendingCount)}
          href="/mentorships"
          tone="amber"
        />
        <StatCard icon={CalendarIcon} label="Séances à venir" value={String(sessionCount)} href="/sessions" tone="blue" />
        <StatCard
          icon={CheckIcon}
          label="Objectifs atteints"
          value={goals.total ? `${goals.done}/${goals.total}` : "0"}
          hint={overall !== null ? `${overall} % du parcours` : undefined}
          href="/goals"
          tone="violet"
        />
      </div>

      {/* 3. Bannière de partage d'expérience (dégradé principal) */}
      <section className="relative overflow-hidden rounded-[20px] bg-gradient-brand p-6 text-white shadow-soft sm:p-7">
        {/* Courbes décoratives, comme sur la maquette */}
        <svg
          aria-hidden
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-2/3 text-white/10"
        >
          <path d="M120 200C180 120 260 60 400 40v160Z" fill="currentColor" />
          <path d="M220 200C270 150 330 115 400 100v100Z" fill="currentColor" />
        </svg>
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20">
            <SparkleIcon className="size-6" />
          </span>
          <div className="flex-1">
            <p className="text-xs font-semibold tracking-[0.14em] text-brand-100 uppercase">MentorConnect Match</p>
            <h2 className="mt-1.5 text-xl font-bold sm:text-2xl">{banner.title}</h2>
            <p className="mt-1 text-sm text-white/90">{banner.text}</p>
          </div>
          <Link
            href={banner.href}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-sm transition-[background-color,transform] duration-200 hover:bg-mint active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {banner.cta} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
