import Link from "next/link";
import type { MentorSummary } from "../queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";

/** Couleurs douces pour l'en-tête des cartes (choisie à partir de l'identifiant). */
const COVERS = [
  "from-[#e3f3ef] to-[#cdeee6] text-brand-800",
  "from-[#fdf0dc] to-[#f8dfb5] text-[#8a5a12]",
  "from-[#e5ecf6] to-[#cfdcee] text-ink-800",
  "from-[#f6e6e3] to-[#efcfc8] text-[#8a3b2c]",
  "from-[#ece7f6] to-[#d9cff0] text-[#4b3a7a]",
];

function coverFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return COVERS[hash % COVERS.length];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/** Carte mentor (maquette « Découvrir ») : en-tête, compatibilité, note, expérience. */
export function MentorCard({
  mentor,
  compatibility,
}: {
  mentor: MentorSummary;
  /** Score de compatibilité (affiché s'il est significatif) */
  compatibility?: { score: number; reasons: string[] } | null;
}) {
  const showScore = compatibility && compatibility.score >= 20;
  const subtitle = [mentor.job_title, mentor.organization].filter(Boolean).join(" · ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
      {/* En-tête (pas de photo en base : grandes initiales sur fond coloré) */}
      <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${coverFor(mentor.id)}`}>
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-ink-900 shadow-sm">
          <span aria-hidden className="size-1.5 rounded-full bg-brand-600" /> Disponible
        </span>
        <span aria-hidden className="text-6xl font-extrabold tracking-tight opacity-90">
          {initials(mentor.full_name)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-6">
        {showScore && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700" title={compatibility.reasons.join(" · ")}>
            <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
              <path d="M12 3c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7Z" />
            </svg>
            {compatibility.score}% compatible
          </p>
        )}
        <h3 className="text-xl font-bold">{mentor.full_name}</h3>
        {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}

        {showScore && compatibility.reasons[0] && (
          <p className="mt-3 text-xs text-ink-500">✓ {compatibility.reasons[0]}</p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {mentor.domains.map((d) => (
            <span key={d.id} className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-ink-700">
              {DOMAIN_SHORT_LABELS[d.slug] ?? d.name}
            </span>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 text-sm text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="text-accent-400">★</span>
            {mentor.rating ? (
              <>
                <strong className="text-ink-900">{mentor.rating.avg.toLocaleString("fr-FR")}</strong> (
                {mentor.rating.count}
                <span className="sr-only"> avis</span>)
              </>
            ) : (
              "Nouveau"
            )}
          </span>
          {mentor.years_experience !== null && (
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden className="size-3 rounded-full bg-accent-400" />
              {mentor.years_experience} ans d&apos;expérience
            </span>
          )}
        </div>

        <Link
          href={`/mentors/${mentor.id}`}
          className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-4 font-semibold text-brand-700"
        >
          Voir le profil
          <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </article>
  );
}
