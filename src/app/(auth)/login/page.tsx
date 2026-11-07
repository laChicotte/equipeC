import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { AuthShell, AuthTabs } from "@/features/auth/components/AuthShell";
import { AuthHeader, BrandName } from "@/features/auth/components/AuthHeader";

export const metadata: Metadata = { title: "Connexion · MentorConnect" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  return (
    <AuthShell>
      <AuthTabs active="login" />
      <AuthHeader
        title={
          <>
            Connexion à <BrandName />
          </>
        }
        subtitle="Accédez à votre espace et poursuivez votre parcours."
      />
      {error === "link" && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          Ce lien n&apos;est plus valide. Connectez-vous avec votre email et votre mot de passe.
        </p>
      )}
      <LoginForm next={nextPath} />
      <p className="mt-4 text-center text-ink-500 sm:mt-6 short:sm:mt-4">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-bold text-brand-700 hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </AuthShell>
  );
}
