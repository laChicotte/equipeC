import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/queries";
import { getMentorshipById } from "@/features/mentorship/queries";
import { MentorshipCard } from "@/features/mentorship/components/MentorshipCard";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Espace de mentorat · MentorConnect" };

export default async function MentorshipPage({ params }: PageProps<"/mentorships/[id]">) {
  const { id } = await params;
  const [profile, mentorship] = await Promise.all([getCurrentProfile(), getMentorshipById(id)]);
  if (!profile) redirect("/dashboard");
  // Introuvable OU pas participant (RLS ne renvoie rien) : même réponse 404
  if (!mentorship) notFound();

  return (
    <>
      <Link href="/mentorships" className="mb-4 inline-block text-sm text-brand-700 hover:underline">
        ← Mes mentorats
      </Link>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="grid content-start gap-4 lg:col-span-2">
          <MentorshipCard mentorship={mentorship} viewerRole={profile.role} />
          {mentorship.status === "accepted" && (
            <ComingSoon
              task="T6"
              title="Discussion"
              items={["Messages en temps réel entre mentor et mentoré", "Historique de la conversation"]}
            />
          )}
        </div>
        {mentorship.status === "accepted" && (
          <div className="grid content-start gap-4">
            <ComingSoon
              task="T7 · T8"
              title="Séances"
              items={["Planifier une séance", "Rejoindre la visio", "Évaluer la séance"]}
            />
            <ComingSoon
              task="T10"
              title="Objectifs"
              items={["Ajouter et cocher des objectifs", "Barre de progression"]}
            />
          </div>
        )}
      </div>
    </>
  );
}
