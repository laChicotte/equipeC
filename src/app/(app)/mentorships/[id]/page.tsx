import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/PageHeader";
import { ComingSoon } from "@/components/shared/ComingSoon";

export const metadata: Metadata = { title: "Espace de mentorat · MentorConnect" };

export default async function MentorshipPage({ params }: PageProps<"/mentorships/[id]">) {
  const { id } = await params;

  return (
    <>
      <PageHeader title="Espace de mentorat" description={`Relation ${id}`} />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComingSoon
            task="T6"
            title="Discussion"
            items={["Messages en temps réel entre mentor et mentoré", "Historique de la conversation"]}
          />
        </div>
        <div className="grid gap-4">
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
      </div>
    </>
  );
}
