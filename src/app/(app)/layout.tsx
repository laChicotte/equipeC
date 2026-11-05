import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile, requireUserId } from "@/features/auth/queries";
import { ROLE_LABELS } from "@/features/profiles/labels";

/**
 * Zone connectée. Le proxy redirige déjà les visiteurs non connectés,
 * mais on revérifie ici (défense en profondeur).
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUserId();
  const profile = await getCurrentProfile();

  // On ne transmet au composant client que ce dont il a besoin
  const user = profile
    ? { fullName: profile.full_name, roleLabel: ROLE_LABELS[profile.role] }
    : null;

  return <AppShell user={user}>{children}</AppShell>;
}
