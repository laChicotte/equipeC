import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/features/auth/queries";
import { getDomains, getProfileDomainIds } from "@/features/profiles/queries";
import { ROLE_LABELS } from "@/features/profiles/labels";
import { ProfileForm } from "@/features/profiles/components/ProfileForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Mon profil · MentorConnect" };

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/dashboard");

  const [domains, selected] = await Promise.all([
    getDomains(),
    getProfileDomainIds(profile.id),
  ]);

  return (
    <>
      <PageHeader title="Mon profil" />
      <div className="grid gap-4">
        <Card className="flex items-center gap-4">
          <Avatar name={profile.full_name} size="lg" />
          <div className="flex flex-col items-start gap-1">
            <p className="text-lg font-semibold">{profile.full_name}</p>
            <Badge tone="brand">{ROLE_LABELS[profile.role]}</Badge>
          </div>
        </Card>
        <Card>
          <ProfileForm
            profile={profile}
            domains={domains}
            selectedDomainIds={selected}
            mode="edit"
          />
        </Card>
      </div>
    </>
  );
}
