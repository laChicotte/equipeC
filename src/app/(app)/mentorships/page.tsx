import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/queries";
import { getMyMentorships, type MentorshipView } from "@/features/mentorship/queries";
import { MentorshipCard } from "@/features/mentorship/components/MentorshipCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Mes mentorats · MentorConnect" };

export default async function MentorshipsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/dashboard");

  const all = await getMyMentorships();
  const isMentor = profile.role === "mentor";

  const groups: { title: string; items: MentorshipView[] }[] = [
    {
      title: isMentor ? "Demandes à traiter" : "Demandes en attente",
      items: all.filter((m) => m.status === "pending"),
    },
    { title: "Mentorats actifs", items: all.filter((m) => m.status === "accepted") },
    {
      title: "Historique",
      items: all.filter((m) => m.status === "declined" || m.status === "ended"),
    },
  ];

  return (
    <>
      <PageHeader
        title="Mes mentorats"
        description={
          isMentor
            ? "Les demandes reçues et les personnes que vous accompagnez."
            : "Vos demandes et vos mentors."
        }
      />

      {all.length === 0 ? (
        <Card className="text-center">
          <p className="mb-4 text-sm text-zinc-600">
            {isMentor
              ? "Vous n'avez pas encore reçu de demande. Un profil complet attire davantage de mentorés."
              : "Vous n'avez pas encore envoyé de demande."}
          </p>
          <ButtonLink href={isMentor ? "/profile" : "/mentors"}>
            {isMentor ? "Compléter mon profil" : "Trouver un mentor"}
          </ButtonLink>
        </Card>
      ) : (
        <div className="flex flex-col gap-8">
          {groups
            .filter((g) => g.items.length > 0)
            .map((group) => (
              <section key={group.title}>
                <h2 className="mb-3 text-sm font-semibold tracking-wide text-zinc-500 uppercase">
                  {group.title} ({group.items.length})
                </h2>
                <div className="grid gap-4 lg:grid-cols-2">
                  {group.items.map((m) => (
                    <MentorshipCard key={m.id} mentorship={m} viewerRole={profile.role} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      )}
    </>
  );
}
