import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import type { Domain } from "@/types/database";

const STEPS = [
  { title: "Créez votre profil", text: "Mentor ou mentoré, indiquez vos domaines et vos objectifs." },
  { title: "Trouvez le bon mentor", text: "Recherche par domaine et recommandations personnalisées." },
  { title: "Échangez et progressez", text: "Chat, séances en visio, objectifs et évaluations." },
];

export default async function HomePage() {
  // Lecture publique du catalogue (autorisée par la règle RLS "domains: lecture publique")
  const supabase = await createClient();
  const { data: domains } = await supabase
    .from("domains")
    .select("id, slug, name, description")
    .order("id")
    .returns<Domain[]>();

  return (
    <>
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
        <Logo />
        <nav className="flex items-center gap-2">
          <Link href="/login" className="rounded-lg px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
            Connexion
          </Link>
          <ButtonLink href="/signup" className="hidden sm:inline-flex">
            S&apos;inscrire
          </ButtonLink>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4">
        <section className="py-12 sm:py-20">
          <p className="mb-3 text-sm font-medium text-brand-700">
            Salon international du livre de jeunesse de Conakry · Mois du Numérique 2026
          </p>
          <h1 className="max-w-3xl text-3xl font-bold tracking-tight sm:text-5xl">
            Connecter les talents, transmettre les expériences.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-600">
            MentorConnect met en relation les jeunes avec des professionnels expérimentés pour
            les accompagner dans leurs études, leur insertion et leurs projets.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/signup?role=mentee">Je cherche un mentor</ButtonLink>
            <ButtonLink href="/signup?role=mentor" variant="secondary">
              Je deviens mentor
            </ButtonLink>
          </div>
        </section>

        <section className="grid gap-4 pb-12 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-zinc-200 bg-white p-5">
              <span className="mb-3 inline-flex size-8 items-center justify-center rounded-full bg-accent-400 text-sm font-bold">
                {index + 1}
              </span>
              <h2 className="font-semibold">{step.title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{step.text}</p>
            </div>
          ))}
        </section>

        {domains && domains.length > 0 && (
          <section className="pb-16">
            <h2 className="mb-4 text-xl font-semibold">Domaines d&apos;accompagnement</h2>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => (
                <li key={domain.id} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <p className="font-medium">{domain.name}</p>
                  <p className="mt-1 text-sm text-zinc-600">{domain.description}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        MentorConnect · Hackathon d&apos;innovation numérique · Conakry 2026
      </footer>
    </>
  );
}
