import type { ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { getCurrentProfile, requireUserId } from "@/features/auth/queries";

/**
 * Zone connectée. Le proxy redirige déjà les visiteurs non connectés,
 * mais on revérifie ici (défense en profondeur).
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireUserId();
  const profile = await getCurrentProfile();

  return (
    <>
      <AppHeader profile={profile} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
    </>
  );
}
