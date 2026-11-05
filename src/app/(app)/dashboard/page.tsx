import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentProfile } from "@/features/auth/queries";
import { ROLE_LABELS } from "@/features/profiles/labels";
import { getMyMentorships } from "@/features/mentorship/queries";
import { MentorshipCard } from "@/features/mentorship/components/MentorshipCard";
import { UpcomingSessions } from "@/features/sessions/components/UpcomingSessions";
import { PageHeader } from "@/components/shared/PageHeader";
import { RecommendedMentors } from "@/features/mentors/components/RecommendedMentors";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Tableau de bord · MentorConnect" };

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-brand-600"
    >
      <p className="text-3xl font-bold text-brand-700">{value}</p>
      <p className="text-sm text-zinc-600">{label}</p>
    </Link>
  );
}

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return (
      <Card>
        <h1 className="mb-2 text-lg font-semibold">Profil introuvable</h1>
        <p className="text-sm text-zinc-600">
          Vous êtes connecté, mais votre profil n&apos;existe pas encore en base. La migration
          SQL (supabase/migrations/0001_init.sql) a-t-elle été exécutée avant l&apos;inscription ?
        </p>
      </Card>
    );
  }

  const isMentor = profile.role === "mentor";
  const mentorships = await getMyMentorships();
  const pending = mentorships.filter((m) => m.status === "pending");
  const active = mentorships.filter((m) => m.status === "accepted");

  return (
    <>
      <PageHeader
        title={`Bonjour ${profile.full_name.split(" ")[0]} 👋`}
        description="Votre espace MentorConnect."
        actions={<Badge tone="brand">{ROLE_LABELS[profile.role]}</Badge>}
      />

      <div className="grid gap-6">
        {!profile.onboarded && (
          <Card className="border-brand-100 bg-brand-50">
            <h2 className="font-semibold text-brand-800">Complétez votre profil</h2>
            <p className="mt-1 mb-4 text-sm text-brand-800/80">
              {isMentor
                ? "Indiquez vos domaines d'expertise et vos disponibilités pour être visible des mentorés."
                : "Indiquez vos objectifs et vos centres d'intérêt pour trouver le bon mentor."}
            </p>
            <ButtonLink href="/onboarding">Compléter mon profil</ButtonLink>
          </Card>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Stat
            label={isMentor ? "Demandes à traiter" : "Demandes en attente"}
            value={pending.length}
            href="/mentorships"
          />
          <Stat
            label={isMentor ? "Mentorés accompagnés" : "Mentors actifs"}
            value={active.length}
            href="/mentorships"
          />
        </div>

        {isMentor && pending.length > 0 && (
          <section>
            <h2 className="mb-3 font-semibold">Nouvelles demandes</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {pending.slice(0, 4).map((m) => (
                <MentorshipCard key={m.id} mentorship={m} viewerRole="mentor" />
              ))}
            </div>
          </section>
        )}

        {active.length > 0 && (
          <section>
            <h2 className="mb-3 font-semibold">{isMentor ? "Vos mentorés" : "Vos mentors"}</h2>
            <div className="grid gap-4 lg:grid-cols-2">
              {active.slice(0, 4).map((m) => (
                <MentorshipCard key={m.id} mentorship={m} viewerRole={profile.role} />
              ))}
            </div>
          </section>
        )}

        {!isMentor && active.length === 0 && pending.length === 0 && profile.onboarded && (
          <Card>
            <h2 className="mb-1 font-semibold">Trouvez votre mentor</h2>
            <p className="mb-4 text-sm text-zinc-600">
              Parcourez les mentors par domaine et envoyez votre première demande.
            </p>
            <ButtonLink href="/mentors">Voir les mentors</ButtonLink>
          </Card>
        )}

        {!isMentor && profile.onboarded && <RecommendedMentors profile={profile} />}
        <UpcomingSessions viewerRole={profile.role} />
      </div>
    </>
  );
}
