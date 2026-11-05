import type { Metadata } from "next";
import Link from "next/link";
import { SignupForm } from "@/features/auth/components/SignupForm";

export const metadata: Metadata = { title: "Inscription · MentorConnect" };

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { role } = await searchParams;

  return (
    <>
      <p className="eyebrow mb-3">Commencer gratuitement</p>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Créer un compte</h1>
      <p className="mb-8 text-ink-500">Gratuit, en moins d&apos;une minute.</p>
      <SignupForm defaultRole={role === "mentor" ? "mentor" : "mentee"} />
      <p className="mt-6 text-center text-sm text-ink-500">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-medium text-brand-700 hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
