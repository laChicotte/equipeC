import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { logout } from "@/features/auth/actions";
import { isRoleReady } from "@/features/profiles/roles";
import { getMyMentorships } from "@/features/mentorship/queries";
import { MentorshipCard } from "@/features/mentorship/components/MentorshipCard";
import { getUpcomingSessions } from "@/features/sessions/queries";
import { NextSessionCard } from "@/features/sessions/components/NextSessionCard";
import { getMyJourneys } from "@/features/goals/queries";
import { JourneyCard } from "@/features/goals/components/JourneyCard";
import { RecommendedMentors } from "@/features/mentors/components/RecommendedMentors";
import { Card } from "@/components/ui/Card";
import { ProgressRing } from "@/components/ui/ProgressRing";
import { formatToday } from "@/lib/datetime";
import { ArrowRightIcon, CalendarIcon, CheckIcon, MessageIcon, SparkleIcon, UsersIcon } from "@/components/ui/icons";
import type { ComponentType } from "react";
import { MentorTop } from "./MentorTop";

export const metadata: Metadata = { title: "Accueil · MentorConnect" };

/** Bandeau « MentorConnect Match » : bleu nuit, halo émeraude. */
function MatchBanner({ isMentor, onboarded }: { isMentor: boolean; onboarded: boolean }) {
  const content = isMentor
    ? {
        title: "Partagez votre expérience.",
        // Texte adapté : on ne demande de compléter le profil que s'il est incomplet
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
    <section className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-8">
      <div aria-hidden className="absolute -top-24 -right-10 size-72 rounded-full bg-brand-500/30 blur-[90px]" />
      <div aria-hidden className="absolute -bottom-28 left-20 size-60 rounded-full bg-accent-400/15 blur-[80px]" />
      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-accent-400 ring-1 ring-white/10">
          <SparkleIcon className="size-7" />
        </span>
        <div className="flex-1">
          <p className="text-xs font-bold tracking-[0.16em] text-accent-400 uppercase">MentorConnect Match</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">{content.title}</h2>
          <p className="mt-1 text-sm text-white/70">{content.text}</p>
        </div>
        <Link
          href={content.href}
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent-400 px-6 py-3.5 font-semibold text-ink-950 shadow-lg shadow-accent-400/20 transition-[background-color,transform] duration-200 hover:bg-accent-300 active:scale-[0.97]"
        >
          {content.cta} <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}

/** Carte de statistique (chiffres réels, calculés à partir des données de l'utilisateur). */
function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  href,
  tone = "brand",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint?: string;
  href: string;
  tone?: "brand" | "amber" | "sky" | "violet";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    sky: "bg-sky-50 text-sky-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <Link
      href={href}
      className="group reveal flex flex-col gap-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-card-hover"
    >
      <span className={`inline-flex size-11 items-center justify-center rounded-xl ${tones[tone]}`}>
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-3xl font-extrabold tracking-tight text-ink-900">{value}</p>
        <p className="mt-1 text-sm font-medium text-ink-500">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-500/80">{hint}</p>}
      </div>
    </Link>
  );
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <Card>
        <h1 className="mb-2 text-lg font-semibold">Votre profil n&apos;a pas pu être chargé</h1>
        <p className="text-sm text-ink-500">
          Vous êtes bien connecté, mais votre profil est introuvable. Déconnectez-vous puis
          reconnectez-vous ; si le problème continue, contactez l&apos;équipe MentorConnect.
        </p>
        <form action={logout} className="mt-4">
          <button className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
            Se déconnecter
          </button>
        </form>
      </Card>
    );
  }

  const isMentor = profile.role === "mentor";
  const [mentorships, sessions, journeys] = await Promise.all([
    getMyMentorships(),
    getUpcomingSessions(),
    getMyJourneys(),
  ]);
  const pending = mentorships.filter((m) => m.status === "pending");
  const active = mentorships.filter((m) => m.status === "accepted");

  // Parcours mis en avant : le mentorat actif le moins avancé (à faire progresser)
  const activeJourneys = journeys.filter((j) => j.active);
  const journey = activeJourneys[0] ?? journeys[0] ?? null;
  // Anneau : progression globale de tous les objectifs actifs
  const totals = activeJourneys.reduce((acc, j) => ({ done: acc.done + j.done, total: acc.total + j.total }), {
    done: 0,
    total: 0,
  });
  const overall = totals.total ? Math.round((totals.done / totals.total) * 100) : null;

  return (
    <div className="flex flex-col gap-8">
      {isMentor ? (
        <MentorTop
          firstName={profile.full_name.split(" ")[0]}
          today={formatToday()}
          pendingCount={pending.length}
          activeCount={active.length}
          sessionCount={sessions.length}
          goals={totals}
          overall={overall}
          onboarded={isRoleReady(profile)}
        />
      ) : (
        <>
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="eyebrow">{formatToday()}</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Bonjour {profile.full_name.split(" ")[0]},
            </h1>
            <p className="mt-2 text-ink-500">
              {isMentor
                ? pending.length > 0
                  ? `${pending.length} demande${pending.length > 1 ? "s" : ""} de mentorat vous attend${pending.length > 1 ? "ent" : ""}.`
                  : "Merci de partager votre expérience avec la nouvelle génération."
                : "Envie de faire avancer vos ambitions aujourd'hui ?"}
            </p>
          </div>
          {overall !== null && <ProgressRing percent={overall} label={isMentor ? "Mentorés" : "Parcours"} />}
        </header>

        {/* Statistiques : uniquement des chiffres réels */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={UsersIcon}
            label={isMentor ? "Mentorés suivis" : "Mentorats actifs"}
            value={String(active.length)}
            href="/mentorships"
          />
          <StatCard
            icon={MessageIcon}
            label={isMentor ? "Demandes à traiter" : "Demandes en attente"}
            value={String(pending.length)}
            href="/mentorships"
            tone="amber"
          />
          <StatCard
            icon={CalendarIcon}
            label="Séances à venir"
            value={String(sessions.length)}
            href="/sessions"
            tone="sky"
          />
          <StatCard
            icon={CheckIcon}
            label="Objectifs atteints"
            value={totals.total ? `${totals.done}/${totals.total}` : "0"}
            hint={overall !== null ? `${overall} % du parcours` : undefined}
            href="/goals"
            tone="violet"
          />
        </div>

        <MatchBanner isMentor={isMentor} onboarded={isRoleReady(profile)} />
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <NextSessionCard sessions={sessions} viewerRole={profile.role} />
        <JourneyCard journey={journey} isMentor={isMentor} />
      </div>

      {isMentor && pending.length > 0 && (
        <section>
          <p className="eyebrow mb-4">Nouvelles demandes</p>
          <div className="grid gap-4 lg:grid-cols-2">
            {pending.slice(0, 4).map((m) => (
              <MentorshipCard key={m.id} mentorship={m} viewerRole="mentor" />
            ))}
          </div>
        </section>
      )}

      {!isMentor && profile.is_mentee && <RecommendedMentors profile={profile} />}

      {active.length > 0 && (
        <section>
          <p className="eyebrow mb-4">{isMentor ? "Vos mentorés" : "Vos mentors"}</p>
          <div className="grid gap-4 lg:grid-cols-2">
            {active.slice(0, 4).map((m) => (
              <MentorshipCard key={m.id} mentorship={m} viewerRole={profile.role} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
