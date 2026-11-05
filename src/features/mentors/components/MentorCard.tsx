import Link from "next/link";
import type { MentorSummary } from "../queries";
import { DOMAIN_SHORT_LABELS } from "@/features/profiles/labels";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowRightIcon, SparkleIcon, StarIcon } from "@/components/ui/icons";

/** Bandes de couleur de l'en-tête (choisie à partir de l'identifiant) + pastille d'initiales assortie. */
const COVERS = [
  { band: "from-brand-100 to-brand-50", initials: "bg-brand-600 text-white" },
  { band: "from-accent-50 to-paper-200", initials: "bg-accent-500 text-ink-900" },
  { band: "from-paper-200 to-paper", initials: "bg-brand-900 text-white" },
  { band: "from-[#e5ecf6] to-[#f1f5fa]", initials: "bg-ink-800 text-white" },
  { band: "from-[#f6e6e3] to-[#fbf3f1]", initials: "bg-[#8a3b2c] text-white" },
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
    <article className="group relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-brand-600">
      {/* Bande colorée + ruban du domaine principal */}
      <div className={`relative h-20 bg-gradient-to-br ${cover.band}`}>
        <span className="absolute top-3 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-ink-900 shadow-sm">
          <span aria-hidden className="size-1.5 rounded-full bg-brand-500" /> Disponible
        </span>
        {mainDomain && (
          <span className="absolute top-0 right-4 max-w-[55%] truncate bg-brand-900 px-3 pt-2 pb-3 text-[11px] font-bold tracking-wide text-white uppercase [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]">
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
          <div className="mt-3 rounded-xl bg-brand-50 px-3 py-2" title={compatibility.reasons.join(" · ")}>
            <p className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-800">
              <SparkleIcon className="size-4 text-accent-500" />
              {compatibility.score}% compatible
            </p>
            {compatibility.reasons[0] && (
              <p className="mt-0.5 text-xs text-brand-800/80">{compatibility.reasons[0]}</p>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {otherDomains.map((d) => (
            <span key={d.id} className="rounded-lg bg-zinc-100 px-2.5 py-1 text-xs text-ink-700">
              {DOMAIN_SHORT_LABELS[d.slug] ?? d.name}
            </span>
          ))}
          {mentor.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="rounded-lg bg-paper px-2.5 py-1 text-xs text-ink-700 ring-1 ring-paper-200">
              {skill}
            </span>
          ))}
          {mentor.skills.length > 3 && (
            <span className="px-1 py-1 text-xs text-ink-500">+{mentor.skills.length - 3}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm text-ink-500">
          <span className="inline-flex items-center gap-1.5">
            <StarIcon className="size-4 text-accent-500" />
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
