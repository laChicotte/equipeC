import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
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

export const metadata: Metadata = { title: "Accueil · MentorConnect" };

const sparkle = (
  <svg aria-hidden viewBox="0 0 24 24" className="size-7" fill="currentColor">
    <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7ZM19 15c.3 1.9 1.1 2.7 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.3 2.7-1.1 3-3Z" />
  </svg>
);

/** Bandeau bleu nuit « MentorConnect Match » (maquette). */
function MatchBanner({ isMentor, onboarded }: { isMentor: boolean; onboarded: boolean }) {
  const content = isMentor
    ? {
        title: "Partagez votre expérience.",
        text: "Complétez votre profil et publiez vos conseils : les mentorés vous trouveront plus facilement.",
        cta: onboarded ? "Partager une ressource" : "Compléter mon profil",
        href: onboarded ? "/resources" : "/onboarding",
      }
    : {
        title: "Trouvez le mentor qui vous correspond vraiment.",
        text: "Décrivez votre objectif, notre algorithme de mise en relation s'occupe du reste.",
        cta: "Décrire mon objectif",
        href: onboarded ? "/profile" : "/onboarding",
      };

  return (
    <section className="relative overflow-hidden rounded-3xl bg-ink-900 p-6 text-white sm:p-8">
      {/* Cercles décoratifs */}
      <span aria-hidden className="absolute -top-24 right-40 size-72 rounded-full border border-white/5" />
      <span aria-hidden className="absolute -bottom-32 right-10 size-72 rounded-full border border-white/5" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
        <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-accent-400">
          {sparkle}
        </span>
        <div className="flex-1">
          <p className="text-xs font-bold tracking-[0.16em] text-brand-500 uppercase">MentorConnect Match</p>
          <h2 className="mt-2 text-xl font-bold sm:text-2xl">{content.title}</h2>
          <p className="mt-1 text-sm text-white/70">{content.text}</p>
        </div>
        <Link
          href={content.href}
          className="inline-flex items-center justify-center gap-3 rounded-xl bg-brand-600 px-6 py-4 font-semibold transition-colors hover:bg-brand-500"
        >
          {content.cta} <span aria-hidden>→</span>
        </Link>
      </div>
    </section>
  );
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <Card>
        <h1 className="mb-2 text-lg font-semibold">Profil introuvable</h1>
        <p className="text-sm text-ink-500">
          Vous êtes connecté, mais votre profil n&apos;existe pas encore en base. La migration
          SQL (supabase/migrations/0001_init.sql) a-t-elle été exécutée avant l&apos;inscription ?
        </p>
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
      <header className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <p className="eyebrow">{formatToday()}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
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

      <MatchBanner isMentor={isMentor} onboarded={isRoleReady(profile)} />

      <div className="grid gap-6 lg:grid-cols-2">
        <NextSessionCard sessions={sessions} viewerRole={profile.role} />
        <JourneyCard journey={journey} />
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
