import type { Metadata } from "next";
import { getCurrentProfile } from "@/features/auth/queries";
import { ROLE_LABELS } from "@/features/profiles/labels";
import { PageHeader } from "@/components/shared/PageHeader";
import { ComingSoon } from "@/components/shared/ComingSoon";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";

export const metadata: Metadata = { title: "Tableau de bord · MentorConnect" };

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

  return (
    <>
      <PageHeader
        title={`Bonjour ${profile.full_name.split(" ")[0]} 👋`}
        description="Votre espace MentorConnect."
        actions={<Badge tone="brand">{ROLE_LABELS[profile.role]}</Badge>}
      />

      <div className="grid gap-4">
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

        {isMentor ? (
          <ComingSoon
            task="T5"
            title="Demandes de mentorat reçues"
            items={[
              "Liste des demandes en attente avec le message du mentoré",
              "Boutons Accepter / Refuser",
              "Liste de vos mentorés actifs",
            ]}
          />
        ) : (
          <>
            <ComingSoon
              task="T9"
              title="Mentors recommandés pour vous"
              items={["Score de compatibilité selon vos domaines et objectifs", "Raison affichée"]}
            />
            <ComingSoon
              task="T5"
              title="Mes demandes et mes mentors"
              items={["Statut de chaque demande (en attente, acceptée, refusée)", "Accès au chat"]}
            />
          </>
        )}

        <ComingSoon
          task="T7"
          title="Prochaines séances"
          items={["Date, heure et sujet", "Lien pour rejoindre la visio"]}
        />
      </div>
    </>
  );
}
