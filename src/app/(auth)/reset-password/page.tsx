import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { ResetPasswordForm } from "@/features/auth/components/PasswordResetForms";
import { LockIcon } from "@/components/ui/icons";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nouveau mot de passe · MentorConnect" };

/** Atteinte via le lien reçu par email (session ouverte par /auth/callback). */
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/forgot-password?error=link");

  return (
    <AuthShell>
      <AuthHeader
        icon={<LockIcon className="h-8 w-8" />}
        title="Nouveau mot de passe"
        subtitle="Choisissez un mot de passe d'au moins 8 caractères."
      />
      <ResetPasswordForm />
    </AuthShell>
  );
}
