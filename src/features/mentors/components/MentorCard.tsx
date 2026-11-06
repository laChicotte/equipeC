import Link from "next/link";
import type { MentorSummary } from "../queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowRightIcon, SparkleIcon, StarIcon } from "@/components/ui/icons";

/** Bandes de couleur de l'en-tête (choisie à partir de l'identifiant) + pastille d'initiales assortie. */
const COVERS = [
  { band: "from-brand-100 via-brand-50 to-white", initials: "bg-brand-600 text-white" },
  { band: "from-slate-200 via-slate-100 to-white", initials: "bg-ink-900 text-white" },
  { band: "from-sky-100 via-sky-50 to-white", initials: "bg-sky-700 text-white" },
  { band: "from-violet-100 via-violet-50 to-white", initials: "bg-violet-700 text-white" },
  { band: "from-amber-100 via-amber-50 to-white", initials: "bg-amber-700 text-white" },
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

/** Carte mentor (page « Découvrir ») : avatar, compatibilité, domaines, note, expérience. */
export function MentorCard({
  mentor,
  compatibility,
  focusDomain,
}: {
  mentor: MentorSummary;
  /** Score de compatibilité (affiché s'il est significatif) */
  compatibility?: { score: number; reasons: string[] } | null;
  /** Domaine filtré : affiché en priorité sur le ruban */
  focusDomain?: string;
}) {
  const showScore = compatibility && compatibility.score >= 20;
  const subtitle = [mentor.job_title, mentor.organization].filter(Boolean).join(" · ");
  const cover = coverFor(mentor.id);
  const mainDomain = mentor.domains.find((d) => d.slug === focusDomain) ?? mentor.domains[0];
  const otherDomains = mentor.domains.filter((d) => d !== mainDomain);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-card transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-card-hover focus-within:ring-2 focus-within:ring-brand-500">
      {/* Bande colorée + ruban du domaine principal */}
      <div className={`relative h-20 bg-gradient-to-br ${cover.band}`}>
        <span className="absolute top-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-sm">
          <span aria-hidden className="relative flex size-2"><span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-400 opacity-60 motion-reduce:hidden" /><span className="relative inline-flex size-2 rounded-full bg-accent-400" /></span> Disponible
        </span>
        {mainDomain && (
          <span className="absolute top-3 right-4 max-w-[55%] truncate rounded-full bg-ink-900/90 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur">
            {DOMAIN_SHORT_LABELS[mainDomain.slug] ?? mainDomain.name}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-6 pb-6">
        {/* Avatar qui chevauche la bande */}
        <div className="relative z-10 -mt-10 mb-3">
          {mentor.avatar_url ? (
            <Avatar name={mentor.full_name} src={mentor.avatar_url} size="card" className="ring-4 ring-white" />
          ) : (
            <span
              aria-hidden
              className={`inline-flex size-20 items-center justify-center rounded-full text-2xl font-extrabold ring-4 ring-white ${cover.initials}`}
            >
              {initials(mentor.full_name)}
            </span>
          )}
        </div>

        <h3 className="text-lg leading-snug font-bold">
          {/* Toute la carte est cliquable (lien étendu) */}
          <Link href={`/mentors/${mentor.id}`} className="outline-none after:absolute after:inset-0">
            {mentor.full_name}
          </Link>
        </h3>
        {subtitle && <p className="mt-0.5 text-sm text-ink-500">{subtitle}</p>}

        {showScore && (
          <div className="mt-3 rounded-xl bg-brand-50/70 px-3 py-2.5 ring-1 ring-brand-100" title={compatibility.reasons.join(" · ")}>
            <p className="flex items-center justify-between gap-2 text-sm font-bold text-brand-700">
              <span className="inline-flex items-center gap-1.5">
                <SparkleIcon className="size-4 text-brand-500" /> Compatibilité
              </span>
              {compatibility.score}%
            </p>
            {/* Barre de compatibilité */}
            <div
              role="progressbar"
              aria-label="Compatibilité"
              aria-valuenow={compatibility.score}
              aria-valuemin={0}
              aria-valuemax={100}
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand-100"
            >
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-400 transition-[width] duration-700"
                style={{ width: `${Math.min(compatibility.score, 100)}%` }}
              />
            </div>
            {compatibility.reasons[0] && (
              <p className="mt-1.5 text-xs text-brand-700/80">{compatibility.reasons[0]}</p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {otherDomains.map((d) => (
            <span key={d.id} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs text-ink-700">
              {DOMAIN_SHORT_LABELS[d.slug] ?? d.name}
            </span>
          ))}
          {mentor.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              {skill}
            </span>
          ))}
          {mentor.skills.length > 3 && (
            <span className="px-1 py-1 text-xs text-ink-500">+{mentor.skills.length - 3}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <StarIcon className="size-4 text-amber-400" />
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
          {mentor.years_experience !== null && <span>{mentor.years_experience} ans d&apos;expérience</span>}
        </div>

        <span
          aria-hidden
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-brand-200 py-2.5 text-sm font-semibold text-brand-700 transition-colors group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white"
        >
          Voir le profil <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
