import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/features/auth/components/SignupForm";
import { AuthShell, AuthTabs } from "@/features/auth/components/AuthShell";
import { AuthHeader, BrandName } from "@/features/auth/components/AuthHeader";

export const metadata: Metadata = { title: "Inscription · MentorConnect" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { role } = await searchParams;

  return (
    <AuthShell variant="signup">
      <AuthTabs active="signup" />
      <AuthHeader
        compact
        title={
          <>
            Rejoindre <BrandName />
          </>
        }
        subtitle="Gratuit, en moins d'une minute."
      />
      <SignupForm defaultRole={role === "mentor" ? "mentor" : "mentee"} />
      <p className="mt-4 text-center text-ink-500 short:mt-3">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-bold text-brand-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthShell>
  );
}
