import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { ForgotPasswordForm } from "@/features/auth/components/PasswordResetForms";
import { ArrowLeftIcon, KeyIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Mot de passe oublié · MentorConnect" };

export default async function ForgotPasswordPage({ searchParams }: PageProps<"/forgot-password">) {
  const { error } = await searchParams;

  return (
    <AuthShell>
      <AuthHeader
        icon={<KeyIcon className="h-8 w-8" />}
        title="Mot de passe oublié ?"
        subtitle="Indiquez votre email : nous vous envoyons un lien pour en choisir un nouveau."
      />
      {error === "link" && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Ce lien est invalide ou a expiré. Faites une nouvelle demande.
        </p>
      )}
      <ForgotPasswordForm />
      <p className="mt-8 text-center">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-700 hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Retour à la connexion
        </Link>
      </p>
    </AuthShell>
  );
}
