import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { OAuthButtons } from "@/features/auth/components/OAuthButtons";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { AuthHeader, BrandName } from "@/features/auth/components/AuthHeader";
import { UserIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Connexion · MentorConnect" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next, error } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  return (
    <AuthShell>
      <AuthHeader
        icon={<UserIcon className="h-7 w-7" />}
        title={
          <>
            Connexion à <BrandName />
          </>
        }
        subtitle="Accédez à votre espace et poursuivez votre parcours."
      />
      {error === "oauth" && (
        <p role="alert" className="mb-5 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          La connexion avec ce service n&apos;a pas abouti. Réessayez ou utilisez votre email.
        </p>
      )}
      <LoginForm next={nextPath} />
      <OAuthButtons next={nextPath} />
      <p className="mt-6 text-center text-ink-500">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-bold text-brand-700 hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </AuthShell>
  );
}
