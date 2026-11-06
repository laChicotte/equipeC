/**
 * Haut du tableau de bord MENTOR avec la charte graphique V1 (pilote) :
 * bienvenue, quatre statistiques, bannière de partage d'expérience.
 * Mêmes données, libellés, liens et conditions que la version précédente ;
 * seul l'habillage change. Le tableau de bord mentoré n'est pas concerné.
 */
import Link from "next/link";
import type { ComponentType } from "react";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { ArrowRightIcon, CalendarIcon, CheckIcon, MessageIcon, SparkleIcon, UsersIcon } from "@/components/ui/icons";
import { BRAND_V1 as C, inter, manrope } from "./brand";

type Icon = ComponentType<{ className?: string }>;

function MentorStatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  tone = "mint",
}: {
  icon: Icon;
  label: string;
  value: string;
  hint?: string;
  href: string;
  tone?: "mint" | "amber";
}) {
  return (
    <Link
      href={href}
      style={{ borderColor: C.border }}
      className="group flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgb(16_27_51/0.04)] transition-[box-shadow,transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[#087F65]/40 hover:shadow-[0_8px_24px_-12px_rgb(16_27_51/0.18)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#087F65]"
    >
      <span
        style={tone === "mint" ? { background: C.mint, color: C.primary } : { background: "#FDF3E3", color: "#9A5B0B" }}
        className="inline-flex size-10 items-center justify-center rounded-xl"
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className={`${manrope.className} text-3xl font-extrabold tracking-tight`} style={{ color: C.night }}>
          {value}
        </p>
        <p className="mt-1 text-sm font-medium" style={{ color: C.muted }}>
          {label}
        </p>
        {hint && (
          <p className="mt-0.5 text-xs" style={{ color: C.muted }}>
            {hint}
          </p>
        )}
      </div>
    </Link>
  );
}

export function MentorTop({
  firstName,
  today,
  pendingCount,
  activeCount,
  sessionCount,
  goals,
  overall,
  onboarded,
}: {
  firstName: string;
  today: string;
  pendingCount: number;
  activeCount: number;
  sessionCount: number;
  goals: { done: number; total: number };
  overall: number | null;
  onboarded: boolean;
}) {
  const banner = {
    title: "Partagez votre expérience.",
    // On ne demande de compléter le profil que s'il est incomplet
    text: onboarded
      ? "Publiez un guide, une lecture ou un conseil : toute la communauté pourra en profiter."
      : "Complétez votre profil : les mentorés vous trouveront plus facilement.",
    cta: onboarded ? "Partager une ressource" : "Compléter mon profil",
    href: onboarded ? "/resources" : "/onboarding",
  };

  return (
    <div className={`${inter.className} flex flex-col gap-8`}>
      {/* Fond général de la charte, sur toute la page du tableau de bord mentor */}
      <div aria-hidden className="fixed inset-0 -z-10" style={{ background: C.background }} />

      {/* 1. Bienvenue */}
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase" style={{ color: C.primary }}>
            {today}
          </p>
          <h1
            className={`${manrope.className} mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl`}
            style={{ color: C.night }}
          >
            Bonjour {firstName},
          </h1>
          <p className="mt-2 text-base" style={{ color: C.muted }}>
            {pendingCount > 0
              ? `${pendingCount} demande${pendingCount > 1 ? "s" : ""} de mentorat vous attend${pendingCount > 1 ? "ent" : ""}.`
              : "Merci de partager votre expérience avec la nouvelle génération."}
          </p>
        </div>
        {overall !== null && <ProgressRing percent={overall} label="Mentorés" color={C.primary} trackColor={C.mint} />}
      </header>

      {/* 2. Statistiques : uniquement des chiffres réels */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <MentorStatCard icon={UsersIcon} label="Mentorés suivis" value={String(activeCount)} href="/mentorships" />
        <MentorStatCard
          icon={MessageIcon}
          label="Demandes à traiter"
          value={String(pendingCount)}
          href="/mentorships"
          tone="amber"
        />
        <MentorStatCard icon={CalendarIcon} label="Séances à venir" value={String(sessionCount)} href="/sessions" />
        <MentorStatCard
          icon={CheckIcon}
          label="Objectifs atteints"
          value={goals.total ? `${goals.done}/${goals.total}` : "0"}
          hint={overall !== null ? `${overall} % du parcours` : undefined}
          href="/goals"
        />
      </div>

      {/* 3. Bannière de partage d'expérience */}
      <section
        className="relative overflow-hidden rounded-[20px] p-6 text-white sm:p-8"
        style={{ background: `linear-gradient(110deg, ${C.night}, ${C.deepGreen})` }}
      >
        <div aria-hidden className="absolute -top-20 -right-12 size-64 rounded-full blur-[90px]" style={{ background: "rgb(8 127 101 / 0.35)" }} />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15" style={{ color: C.amber }}>
            <SparkleIcon className="size-6" />
          </span>
          <div className="flex-1">
            <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide" style={{ color: C.amber }}>
              MentorConnect Match
            </p>
            <h2 className={`${manrope.className} mt-3 text-xl font-bold sm:text-2xl`}>{banner.title}</h2>
            <p className="mt-1 text-sm text-white/75">{banner.text}</p>
          </div>
          <Link
            href={banner.href}
            style={{ background: C.amber, color: C.night }}
            className="group inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-semibold transition-[filter,transform] duration-200 hover:brightness-105 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            {banner.cta} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </div>
  );
}
