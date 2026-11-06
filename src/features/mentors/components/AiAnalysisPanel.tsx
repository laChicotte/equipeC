import Link from "next/link";
import type { AiAnalysis } from "../ai";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { DomainIcon } from "@/features/profiles/domainIcons";
import { SparkleIcon } from "@/components/ui/icons";

/** Résultat de l'analyse IA d'un objectif : compréhension, domaines, premières étapes. */
export function AiAnalysisPanel({ analysis }: { analysis: AiAnalysis }) {
  return (
    <section
      aria-labelledby="analyse-ia"
      className="relative overflow-hidden rounded-3xl bg-ink-950 p-6 text-white sm:p-8"
    >
      <div aria-hidden className="absolute -top-20 -right-16 size-64 rounded-full bg-brand-500/30 blur-[80px]" />
      <div className="relative">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold tracking-wide text-accent-300 uppercase">
          <SparkleIcon className="size-4" /> Analyse par l&apos;IA
        </p>
        <h2 id="analyse-ia" className="sr-only">
          Analyse de votre objectif
        </h2>
        <p className="mt-4 text-lg leading-relaxed font-medium sm:text-xl">{analysis.understanding}</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {analysis.domains.length > 0 && (
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-white/60 uppercase">Domaines conseillés</p>
              <ul className="mt-3 flex flex-col gap-3">
                {analysis.domains.map((d) => (
                  <li key={d.slug} className="flex gap-3">
                    <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-accent-400">
                      <DomainIcon slug={d.slug} className="size-4" />
                    </span>
                    <span className="min-w-0">
                      <Link href={`/mentors?domain=${d.slug}`} className="font-semibold hover:text-accent-300 hover:underline">
                        {DOMAIN_SHORT_LABELS[d.slug] ?? d.slug}
                      </Link>
                      <span className="block text-sm text-white/70">{d.reason}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {analysis.steps.length > 0 && (
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-white/60 uppercase">Vos premières étapes</p>
              <ol className="mt-3 flex flex-col gap-2.5">
                {analysis.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-sm text-white/85">
                    <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-400 text-xs font-bold text-ink-950">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
        <p className="mt-6 text-xs text-white/50">
          Proposition générée par une IA (Claude, d&apos;Anthropic) à partir des profils publics des mentors : à valider
          avec votre mentor.
        </p>
      </div>
    </section>
  );
}
