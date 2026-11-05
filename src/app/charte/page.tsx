import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { CAMPUS_FRANCE_NOTICE } from "@/features/profiles/labels";

export const metadata: Metadata = { title: "Charte du mentorat · MentorConnect" };

// Engagements repris du cahier des charges (§9 profils des mentors, §12 participants)
const SECTIONS = [
  {
    eyebrow: "Mentors",
    title: "Je m'engage à…",
    items: [
      "Partager mon expérience avec bienveillance, écoute et professionnalisme.",
      "Aider le mentoré à développer son autonomie et sa capacité de décision, sans faire à sa place.",
      "Indiquer des disponibilités réalistes et honorer les séances planifiées.",
      "Rester dans mon domaine de compétence et orienter vers d'autres mentors si besoin.",
    ],
  },
  {
    eyebrow: "Mentorés",
    title: "Je m'engage à…",
    items: [
      "Définir mes objectifs d'accompagnement et les faire évoluer avec mon mentor.",
      "Participer activement aux séances et prévenir en cas d'empêchement.",
      "Mettre en pratique les conseils reçus et partager mes avancées.",
      "Respecter le temps et l'expérience que mon mentor me consacre.",
    ],
  },
  {
    eyebrow: "Tous",
    title: "Ensemble, nous…",
    items: [
      "Échangeons avec respect, sans discrimination d'aucune sorte.",
      "Préservons la confidentialité de ce qui est partagé pendant l'accompagnement.",
      "Utilisons le chat et la visio de la plateforme pour nos échanges, en particulier avec les plus jeunes.",
      "Évaluons honnêtement les séances pour améliorer la qualité de l'accompagnement.",
    ],
  },
];

export default function CharterPage() {
  return (
    <div className="bg-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-6 sm:px-8">
        <Logo />
        <Link href="/signup" className="font-semibold text-brand-700 hover:underline">
          Créer un compte →
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 sm:px-8">
        <p className="eyebrow mt-8">Charte du mentorat</p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Une relation de confiance et de transmission.
        </h1>
        <p className="mt-5 max-w-3xl text-lg text-ink-500">
          Le mentorat repose sur l&apos;accompagnement, la confiance et la transmission. Le mentor
          ne se substitue pas au mentoré dans la réalisation de ses projets : il l&apos;aide à
          développer son autonomie et sa capacité de décision.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SECTIONS.map((s) => (
            <section key={s.eyebrow} className="rounded-3xl border border-zinc-200 p-7">
              <p className="eyebrow">{s.eyebrow}</p>
              <h2 className="mt-3 text-xl font-bold">{s.title}</h2>
              <ul className="mt-5 flex flex-col gap-3">
                {s.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-700">
                    <span aria-hidden className="mt-0.5 text-brand-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className="mt-10 rounded-2xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200">
          ℹ️ {CAMPUS_FRANCE_NOTICE}
        </p>
      </main>
    </div>
  );
}
