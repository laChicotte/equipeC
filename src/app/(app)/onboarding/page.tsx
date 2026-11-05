import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/queries";
import { getDomains, getProfileDomainIds } from "@/features/profiles/queries";
import { ProfileForm } from "@/features/profiles/components/ProfileForm";
import { PageHeader } from "@/components/shared/PageHeader";

export const metadata: Metadata = { title: "Compléter mon profil · MentorConnect" };

export default async function OnboardingPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/dashboard"); // le tableau de bord explique le problème

  const [domains, selected] = await Promise.all([
    getDomains(),
    getProfileDomainIds(profile.id),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Bienvenue"
        title="Complétez votre profil"
        description={
          profile.role === "mentor"
            ? "Ces informations permettent aux mentorés de vous trouver."
            : "Ces informations nous aident à vous recommander les bons mentors."
        }
      />
      <ProfileForm
        profile={profile}
        domains={domains}
        selectedDomainIds={selected}
        mode="onboarding"
      />
    </>
  );
}
