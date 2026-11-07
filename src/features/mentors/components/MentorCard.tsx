import Link from "next/link";
import type { MentorSummary } from "../queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowRightIcon, StarIcon } from "@/components/ui/icons";

/** Couleur de la pastille d'initiales (choisie à partir de l'identifiant). */
const INITIALS_TONES = [
  "bg-brand-700 text-white",
  "bg-ink-900 text-white",
  "bg-sky-700 text-white",
  "bg-violet-600 text-white",
  "bg-fuchsia-600 text-white",
  "bg-orange-600 text-white",
];

function toneFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return INITIALS_TONES[hash % INITIALS_TONES.length];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/**
 * Carte mentor (page « Découvrir ») : disponibilité, domaine principal,
 * identité, compatibilité, compétences, note, expérience. Toute la carte est cliquable.
 */
export function MentorCard({
  mentor,
  compatibility,
  focusDomain,
}: {
  mentor: MentorSummary;
  /** Score de compatibilité (affiché s'il est significatif) */
  compatibility?: { score: number; reasons: string[] } | null;
  /** Domaine filtré : affiché en priorité sur la pastille */
  focusDomain?: string;
}) {
  const showScore = compatibility && compatibility.score >= 20;
  const subtitle = [mentor.job_title, mentor.organization]
    .filter(Boolean)
    .join(" · ");
  const mainDomain =
    mentor.domains.find((d) => d.slug === focusDomain) ?? mentor.domains[0];
  const otherDomains = mentor.domains.filter((d) => d !== mainDomain);
  // Sans doublon (une compétence peut porter le nom d'un domaine, ex. « Campus France »)
  const tags = [
    ...new Map(
      [
        ...otherDomains.map((d) => DOMAIN_SHORT_LABELS[d.slug] ?? d.name),
        ...mentor.skills,
      ].map((t) => [t.toLowerCase(), t]),
    ).values(),
  ];

  return (
    <article className="group relative flex flex-col rounded-3xl border border-slate-100 bg-white p-5 shadow-[0_1px_3px_rgba(23,43,69,0.05)] transition-[box-shadow,transform,border-color] duration-300 focus-within:ring-2 focus-within:ring-brand-500 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
      {/* Disponibilité + domaine principal */}
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-900">
          <span aria-hidden className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-60 motion-reduce:hidden" />
            <span className="relative inline-flex size-2 rounded-full bg-accent-400" />
          </span>
          Disponible
        </span>
        {mainDomain && (
          <span className="max-w-[60%] truncate rounded-full bg-ink-900 px-2.5 py-1 text-[11px] font-semibold text-white">
            {DOMAIN_SHORT_LABELS[mainDomain.slug] ?? mainDomain.name}
          </span>
        )}
      </div>

      {/* Identité */}
      <div className="mt-4 flex items-center gap-3.5">
        {mentor.avatar_url ? (
          <Avatar
            name={mentor.full_name}
            src={mentor.avatar_url}
            size="listing"
          />
        ) : (
          <span
            aria-hidden
            className={`inline-flex size-14 shrink-0 items-center justify-center rounded-full text-lg font-extrabold ${toneFor(mentor.id)}`}
          >
            {initials(mentor.full_name)}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="text-base leading-snug font-bold text-ink-900">
            {/* Toute la carte est cliquable (lien étendu) */}
            <Link
              href={`/mentors/${mentor.id}`}
              className="outline-none after:absolute after:inset-0"
            >
              {mentor.full_name}
            </Link>
          </h3>
          {subtitle && (
            <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {showScore && (
        <div className="mt-4" title={compatibility.reasons.join(" · ")}>
          <p className="flex items-center justify-between gap-2 text-sm font-bold text-ink-900">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden
                className="text-base leading-none text-brand-600"
              >
                +
              </span>
              Compatibilité
            </span>
            {compatibility.score}%
          </p>
          <div
            role="progressbar"
            aria-label="Compatibilité"
            aria-valuenow={compatibility.score}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500 transition-[width] duration-700"
              style={{ width: `${Math.min(compatibility.score, 100)}%` }}
            />
          </div>
          {compatibility.reasons[0] && (
            <p className="mt-2 rounded-xl bg-brand-50/70 px-3 py-2 text-xs leading-relaxed text-ink-700">
              {compatibility.reasons[0]}
            </p>
          )}
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-brand-100 bg-brand-50/60 px-2.5 py-1 text-xs font-medium text-brand-800"
            >
              {tag}
            </span>
          ))}
          {tags.length > 5 && (
            <span className="px-1 py-1 text-xs text-ink-500">
              +{tags.length - 5}
            </span>
          )}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 pt-4 text-sm text-ink-500">
        <span className="inline-flex items-center gap-1.5">
          <StarIcon className="size-4 text-amber-400" />
          {mentor.rating ? (
            <>
              <strong className="text-ink-900">
                {mentor.rating.avg.toLocaleString("fr-FR")}
              </strong>{" "}
              ({mentor.rating.count}
              <span className="sr-only"> avis</span>)
            </>
          ) : (
            "Nouveau"
          )}
        </span>
        {mentor.years_experience !== null && (
          <span>{mentor.years_experience} ans d&apos;expérience</span>
        )}
      </div>

      <span
        aria-hidden
        className="mt-3 inline-flex items-center justify-center gap-2 rounded-xl border border-brand-600 py-2.5 text-sm font-semibold text-brand-800 transition-colors group-hover:bg-brand-700 group-hover:text-white"
      >
        Voir le profil{" "}
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </article>
  );
}
