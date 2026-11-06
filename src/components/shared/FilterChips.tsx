import Link from "next/link";

export type Chip = { href: string; label: string; active: boolean };

/**
 * Rangée de filtres sous forme de pastilles (liens : le filtre est dans l'URL).
 * `scroll` : sur mobile, une seule ligne qui défile horizontalement (avec un
 * fondu au bord) ; à partir de la tablette, retour à la ligne.
 */
export function FilterChips({ chips, label, scroll = false }: { chips: Chip[]; label: string; scroll?: boolean }) {
  return (
    <nav
      aria-label={label}
      className={
        scroll
          ? "no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:[mask-image:none]"
          : "flex flex-wrap gap-2"
      }
    >
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          aria-current={chip.active ? "true" : undefined}
          className={`shrink-0 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition-colors ${
            chip.active
              ? "border-ink-900 bg-ink-900 font-medium text-white"
              : "border-slate-200 bg-white text-ink-700 hover:border-brand-600 hover:text-brand-700"
          }`}
        >
          {chip.label}
        </Link>
      ))}
    </nav>
  );
}

/** Construit une URL en conservant les autres filtres. */
export function withParams(path: string, params: Record<string, string | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value) sp.set(key, value);
  const qs = sp.toString();
  return qs ? `${path}?${qs}` : path;
}
