import type { Metadata } from "next";
import Link from "next/link";
import { getPlatformImpact, getPublicTestimonials } from "@/features/impact/queries";
import { ROLE_LABELS } from "@/features/profiles/labels";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatShortDate } from "@/lib/datetime";

export const metadata: Metadata = { title: "Impact & restitution · MentorConnect" };

/** Déroulement du programme (cahier des charges) et ce que fait la plateforme à chaque étape. */
const STEPS = [
  {
    title: "Identification des besoins et des attentes",
    how: "Profil guidé (situation, objectifs, besoins précis) et orientation intelligente.",
    links: [{ href: "/domains", label: "Orientation" }, { href: "/profile", label: "Mon profil" }],
  },
  {
    title: "Présentation des mentors et de leurs domaines",
    how: "Catalogue des 7 domaines, fiches mentors avec expertises, compétences et avis.",
    links: [{ href: "/domains", label: "Domaines" }, { href: "/mentors", label: "Découvrir" }],
  },
  {
    title: "Mise en relation mentors / participants",
    how: "Recommandations expliquées (score de compatibilité), demande puis acceptation par le mentor.",
    links: [{ href: "/mentors", label: "Recommandations" }, { href: "/mentorships", label: "Mes mentorats" }],
  },
  {
    title: "Sessions de mentorat et ateliers thématiques",
    how: "Séances individuelles planifiées avec visio intégrée, ateliers collectifs à places limitées.",
    links: [{ href: "/sessions", label: "Rendez-vous" }, { href: "/workshops", label: "Ateliers" }],
  },
  {
    title: "Conception de la plateforme numérique",
    how: "MentorConnect : chat temps réel, visio, objectifs, ressources et opportunités, sécurisés en base.",
    links: [{ href: "/dashboard", label: "Tableau de bord" }],
  },
  {
    title: "Tests, amélioration et finalisation",
    how: "Évaluation de chaque séance et bilans de fin de mentorat pour améliorer l'accompagnement.",
    links: [{ href: "/sessions", label: "Évaluer une séance" }],
  },
  {
    title: "Restitution des expériences de mentorat",
    how: "Chiffres d'impact et témoignages partagés par les participants (cette page).",
    links: [],
  },
];

export default async function ImpactPage() {
  const [impact, testimonials] = await Promise.all([getPlatformImpact(), getPublicTestimonials(9)]);

  const stats = impact
    ? [
        { value: impact.mentors, label: "mentors engagés" },
        { value: impact.mentees, label: "participants accompagnés" },
        { value: impact.mentorships, label: "mentorats démarrés" },
        { value: impact.sessions_held, label: "séances réalisées" },
        { value: impact.workshops_held, label: "ateliers animés" },
        { value: impact.goals_done, label: "objectifs atteints" },
        {
          value: impact.avg_rating !== null ? `${impact.avg_rating.toLocaleString("fr-FR")}/5` : "–",
          label: `satisfaction (${impact.reviews} avis)`,
        },
        { value: impact.testimonials, label: "témoignages partagés" },
      ]
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Programme · Étape 7"
        title="Impact & restitution"
        description="Ce que le programme de mentorat a produit, et ce qu'en disent celles et ceux qui l'ont vécu."
      />

      {!impact ? (
        <p className="mb-10 rounded-2xl bg-amber-50 p-5 text-sm text-amber-900 ring-1 ring-amber-200">
          Les chiffres d&apos;impact ne sont pas encore activés : exécutez la migration
          <code className="mx-1 font-mono">0005_workshops_and_impact.sql</code> dans Supabase.
        </p>
      ) : (
        <dl className="mb-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)]">
              <dt className="sr-only">{s.label}</dt>
              <dd>
                <span className="block text-3xl font-bold text-ink-900 sm:text-4xl">{s.value}</span>
                <span className="mt-1 block text-sm text-ink-500">{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}

      <section className="mb-12">
        <h2 className="text-2xl font-bold">Témoignages</h2>
        <p className="mt-1 text-ink-500">Bilans rédigés à la fin d&apos;un mentorat et partagés par leurs auteurs.</p>
        {testimonials.length === 0 ? (
          <p className="mt-5 rounded-3xl border border-dashed border-zinc-200 bg-white p-8 text-center text-ink-500">
            Les premiers témoignages apparaîtront ici à la fin des premiers mentorats.{" "}
            <Link href="/mentorships" className="font-medium text-brand-700 hover:underline">
              Rédiger mon bilan
            </Link>
          </p>
        ) : (
          <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.map((t, i) => (
              <li key={i} className="flex flex-col justify-between gap-5 rounded-3xl bg-white p-6 shadow-[0_1px_3px_rgba(23,43,69,0.04)] ring-1 ring-zinc-100">
                <p className="leading-relaxed text-ink-700 italic">« {t.content} »</p>
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-10 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                    {t.first_name[0]?.toUpperCase()}
                  </span>
                  <div className="min-w-0 text-sm">
                    <p className="font-semibold">
                      {t.first_name} · <span className="font-normal text-ink-500">{ROLE_LABELS[t.role]}</span>
                    </p>
                    <p className="truncate text-xs text-ink-500">
                      {t.domain_name ?? "Mentorat"} · {formatShortDate(t.created_at)}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-bold">Le programme en 7 étapes</h2>
        <p className="mt-1 text-ink-500">Le déroulement prévu par le programme, et ce que fait MentorConnect à chaque étape.</p>
        <ol className="mt-5 grid gap-4 md:grid-cols-2">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 rounded-3xl border border-zinc-100 bg-white p-5">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink-900 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <h3 className="font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-ink-500">{step.how}</p>
                {step.links.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {step.links.map((l) => (
                      <Link key={l.href + l.label} href={l.href} className="font-semibold text-brand-700 hover:underline">
                        {l.label} →
                      </Link>
                    ))}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
