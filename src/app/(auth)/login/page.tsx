import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Connexion · MentorConnect" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;

  return (
    <>
      <h1 className="mb-1 text-xl font-semibold">Connexion</h1>
      <p className="mb-6 text-sm text-zinc-600">Heureux de vous revoir.</p>
      <LoginForm next={typeof next === "string" ? next : undefined} />
      <p className="mt-6 text-center text-sm text-zinc-600">
        Pas encore de compte ?{" "}
        <Link href="/signup" className="font-medium text-brand-700 hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </>
  );
}
