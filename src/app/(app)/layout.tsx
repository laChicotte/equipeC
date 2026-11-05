import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, requireUserId } from "@/features/auth/queries";
import { ROLE_LABELS } from "@/features/profiles/labels";
import { getMyMentorships } from "@/features/mentorship/queries";

/**
 * Zone connectée. Le proxy redirige déjà les visiteurs non connectés,
 * mais on revérifie ici (défense en profondeur).
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUserId();
  const profile = await getCurrentProfile();

  // On ne transmet au composant client que ce dont il a besoin
  const user = profile
    ? {
        fullName: profile.full_name,
        roleLabel: ROLE_LABELS[profile.role],
        isMentor: profile.role === "mentor",
      }
    : null;

  // Pastille : demandes en attente de réponse (côté mentor)
  const pendingRequests =
    profile?.role === "mentor"
      ? (await getMyMentorships()).filter((m) => m.status === "pending").length
      : 0;

  return (
    <AppShell user={user} badges={{ "/mentorships": pendingRequests }}>
      {children}
    </AppShell>
  );
}
