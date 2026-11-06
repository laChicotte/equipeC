import type { Metadata } from "next";
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
import { formatToday } from "@/lib/datetime";
import { MentorTop } from "./MentorTop";

export const metadata: Metadata = { title: "Accueil · MentorConnect" };

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
          <button className="rounded-xl bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
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
      <MentorTop
        isMentor={isMentor}
        firstName={profile.full_name.split(" ")[0]}
        today={formatToday()}
        pendingCount={pending.length}
        activeCount={active.length}
        sessionCount={sessions.length}
        goals={totals}
        overall={overall}
        onboarded={isRoleReady(profile)}
      />

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
