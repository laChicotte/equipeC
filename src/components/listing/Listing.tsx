/**
 * Briques communes des pages « liste » (maquette Opportunités) :
 * en-tête à pastille, barre de chiffres clés, filtres avec compteurs,
 * ligne de résultats + recherche, carte compacte, bannière d'appel à l'action.
 * Utilisées par Opportunités, Bibliothèque, Ateliers et Domaines.
 */
import Link from "next/link";
import type { ReactNode } from "react";

/** Classes de la carte cliquable (déclencheur de <Modal>). */
export const listingCardClasses =
  "group flex h-full w-full min-w-0 flex-col rounded-3xl border border-slate-100 bg-white p-5 text-left shadow-[0_1px_3px_rgba(23,43,69,0.04)] transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600";

/** Bouton principal vert de l'en-tête. */
export const primaryActionClasses =
  "inline-flex items-center gap-2 rounded-xl bg-brand-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-800";

/** En-tête : pastille, titre, description, action à droite. */
export function ListingHeader({
  pill,
  title,
  description,
  action,
}: {
  pill: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-3xl min-w-0">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold tracking-wide text-brand-700 uppercase ring-1 ring-brand-100">
          <span aria-hidden className="size-1.5 rounded-full bg-brand-600" />{" "}
          {pill}
        </span>
        <h1 className="mt-4 text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-ink-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

/** Barre de chiffres clés (2 colonnes sur mobile, une ligne sur ordinateur). */
export function StatsBar({
  items,
}: {
  items: { icon: string; value: ReactNode; label: string }[];
}) {
  return (
    <dl
      className={`mb-6 grid grid-cols-2 gap-3 rounded-3xl border border-slate-100 bg-white p-4 shadow-[0_1px_3px_rgba(23,43,69,0.04)] ${
        items.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"
      }`}
    >
      {items.map((s) => (
        <div
          key={s.label}
          className="flex min-w-0 items-center gap-3 rounded-2xl px-2 py-1"
        >
          <span
            aria-hidden
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-background"
          >
            {s.icon}
          </span>
          <div className="flex min-w-0 flex-col-reverse">
            <dt className="truncate text-xs text-ink-500">{s.label}</dt>
            <dd className="text-xl font-bold text-ink-900">{s.value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

/** Filtres en pastilles avec compteur ; la pastille active est verte. */
export function CountChips({
  label,
  chips,
}: {
  label: string;
  chips: {
    href: string;
    label: string;
    /** Emoji ou icône (composant) */
    icon?: ReactNode;
    count: number;
    active: boolean;
  }[];
}) {
  return (
    <nav aria-label={label} className="mb-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.href + chip.label}
          href={chip.href}
          aria-current={chip.active ? "page" : undefined}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            chip.active
              ? "bg-brand-700 text-white"
              : "border border-slate-200 bg-white text-ink-900 hover:border-brand-300"
          }`}
        >
          {chip.icon && (
            <span
              aria-hidden
              className={`inline-flex [&>svg]:size-4 ${chip.active ? "" : "text-brand-700"}`}
            >
              {chip.icon}
            </span>
          )}
          {chip.label}
          <span
            className={`rounded-full px-1.5 text-xs font-semibold ${chip.active ? "bg-white/20" : "bg-slate-100 text-ink-500"}`}
          >
            {chip.count}
          </span>
        </Link>
      ))}
    </nav>
  );
}

/** Ligne « ✓ Affichage de N … » + champ de recherche (formulaire GET). */
export function ResultsBar({
  summary,
  clearHref,
  query,
  action,
  hidden = {},
  placeholder,
}: {
  summary: string;
  /** Lien « effacer » quand une recherche est active */
  clearHref?: string;
  query?: string;
  action?: string;
  hidden?: Record<string, string | undefined>;
  placeholder?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <p className="flex flex-wrap items-center gap-x-2 text-sm text-ink-500">
        <span aria-hidden className="text-brand-600">
          ✓
        </span>
        {summary}
        {query && clearHref && (
          <>
            · pour « {query} » ·
            <Link
              href={clearHref}
              className="font-medium text-brand-700 hover:underline"
            >
              effacer
            </Link>
          </>
        )}
      </p>
      {action && (
        <form
          action={action}
          className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 sm:w-80"
        >
          {Object.entries(hidden).map(
            ([k, v]) => v && <input key={k} type="hidden" name={k} value={v} />,
          )}
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="size-4 shrink-0 text-ink-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" strokeLinecap="round" />
          </svg>
          <label htmlFor="q" className="sr-only">
            {placeholder ?? "Rechercher"}
          </label>
          <input
            id="q"
            name="q"
            defaultValue={query}
            placeholder={placeholder ?? "Rechercher…"}
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm outline-none placeholder:text-ink-500/70"
          />
        </form>
      )}
    </div>
  );
}

/**
 * Contenu d'une carte compacte (uniquement des <span> : elle vit dans un bouton).
 * Icône + pastille, surtitre, titre (2 lignes), résumé (3 lignes), méta, pied.
 */
export function ListingCardBody({
  icon,
  pill,
  eyebrow,
  title,
  description,
  meta,
  footer,
  action = "Voir le détail",
  muted = false,
}: {
  icon: ReactNode;
  pill?: ReactNode;
  eyebrow?: ReactNode;
  title: string;
  description?: string | null;
  meta?: { icon: ReactNode; text: ReactNode } | null;
  footer?: ReactNode;
  action?: string;
  muted?: boolean;
}) {
  return (
    <>
      <span className="flex w-full items-start justify-between gap-3">
        {icon}
        {pill}
      </span>
      {eyebrow && (
        <span className="mt-4 block text-[11px] font-bold tracking-[0.08em] text-brand-700 uppercase">
          {eyebrow}
        </span>
      )}
      <span
        className={`mt-1 line-clamp-2 block text-lg leading-snug font-bold break-words text-ink-900 ${muted ? "line-through opacity-70" : ""}`}
      >
        {title}
      </span>
      {description && (
        <span className="mt-2 line-clamp-3 block text-sm leading-relaxed break-words text-ink-500">
          {description}
        </span>
      )}
      {meta && (
        <span className="mt-3 flex min-w-0 items-center gap-1.5 text-sm font-medium text-ink-700">
          {meta.icon}
          <span className="truncate">{meta.text}</span>
        </span>
      )}
      <span className="mt-auto flex w-full items-center justify-between gap-2 border-t border-slate-100 pt-4 text-xs text-ink-500">
        <span className="min-w-0 truncate">{footer}</span>
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-900">
          {action}
          <span
            aria-hidden
            className="transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </span>
      </span>
    </>
  );
}

/** Icône carrée d'une carte. */
export function CardIcon({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "amber";
}) {
  return (
    <span
      aria-hidden
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-xl ${tone === "amber" ? "bg-amber-50 text-accent-600" : "bg-brand-50 text-brand-700"}`}
    >
      {children}
    </span>
  );
}

/** Grille de cartes : jamais plus large que l'écran. */
export function CardGrid({
  children,
  columns = 3,
}: {
  children: ReactNode;
  columns?: 3 | 4;
}) {
  return (
    <ul
      className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${columns === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}
    >
      {children}
    </ul>
  );
}

/** Message quand la liste est vide. */
export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center text-ink-500">
      {children}
    </p>
  );
}

/** Bannière verte d'appel à l'action (bas de page). */
export function CtaBanner({
  pill,
  title,
  text,
  actions,
}: {
  pill: string;
  title: string;
  text: string;
  actions: ReactNode;
}) {
  return (
    <section className="mt-10 flex flex-col gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-800 p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-10">
      <div className="max-w-xl min-w-0">
        <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
          {pill}
        </span>
        <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h2>
        <p className="mt-2 text-white/80">{text}</p>
      </div>
      <div className="flex shrink-0 flex-col gap-3">{actions}</div>
    </section>
  );
}

/** Styles des boutons de la bannière. */
export const ctaPrimaryClasses =
  "rounded-xl bg-white px-5 py-3 text-center text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50";
export const ctaSecondaryClasses =
  "rounded-xl bg-white/10 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-white/20";

const STAT_TONES = {
  brand: {
    card: "border-slate-100 bg-white",
    icon: "bg-brand-50 text-brand-700",
  },
  amber: {
    card: "border-amber-100 bg-gradient-to-br from-amber-50 to-white",
    icon: "bg-white text-amber-600",
  },
  blue: { card: "border-slate-100 bg-white", icon: "bg-blue-50 text-blue-700" },
  red: { card: "border-slate-100 bg-white", icon: "bg-red-50 text-red-600" },
} as const;

/** Fonds teintés (variante `soft`, maquette Bibliothèque). */
const SOFT_CARDS: Record<keyof typeof STAT_TONES, string> = {
  brand: "border-brand-100 bg-gradient-to-br from-brand-50 to-white",
  amber: "border-amber-100 bg-gradient-to-br from-amber-50 to-white",
  blue: "border-blue-100 bg-gradient-to-br from-blue-50 to-white",
  red: "border-rose-100 bg-gradient-to-br from-rose-50 to-white",
};
const SOFT_ICONS: Record<keyof typeof STAT_TONES, string> = {
  brand: "bg-white shadow-sm text-brand-700",
  amber: "bg-white shadow-sm text-amber-600",
  blue: "bg-white shadow-sm text-blue-700",
  red: "bg-white shadow-sm text-rose-600",
};

/** Chiffre clé en carte séparée, pastille d'icône colorée (maquettes 2026). */
export function StatCard({
  icon,
  value,
  label,
  tone = "brand",
  soft = false,
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  tone?: keyof typeof STAT_TONES;
  /** Fond teinté de la couleur de la pastille */
  soft?: boolean;
}) {
  const t = STAT_TONES[tone];
  return (
    <div
      className={`flex min-w-0 items-center gap-4 rounded-2xl border p-4 shadow-[0_1px_3px_rgba(23,43,69,0.05)] ${soft ? SOFT_CARDS[tone] : t.card}`}
    >
      <span
        aria-hidden
        className={`inline-flex size-12 shrink-0 items-center justify-center rounded-full [&>svg]:size-6 ${soft ? SOFT_ICONS[tone] : t.icon}`}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col-reverse">
        <dt className="truncate text-sm text-ink-500">{label}</dt>
        <dd className="text-2xl leading-tight font-bold text-ink-900">
          {value}
        </dd>
      </div>
    </div>
  );
}
