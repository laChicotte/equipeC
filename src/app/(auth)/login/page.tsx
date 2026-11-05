import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Connexion · MentorConnect" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;

  return (
    <>
      <p className="eyebrow mb-3">Bon retour</p>
      <h1 className="mb-2 text-3xl font-bold tracking-tight">Connexion</h1>
      <p className="mb-8 text-ink-500">Heureux de vous revoir. Votre parcours vous attend.</p>
      <LoginForm next={typeof next === "string" ? next : undefined} />
      <p className="mt-6 text-center text-sm text-ink-500">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-medium text-brand-700 hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </>
  );
}
