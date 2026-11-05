import Link from "next/link";

export type Chip = { href: string; label: string; active: boolean };

/** Rangée de filtres sous forme de pastilles (liens : le filtre est dans l'URL). */
export function FilterChips({ chips, label }: { chips: Chip[]; label: string }) {
  return (
    <nav aria-label={label} className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
      {chips.map((chip) => (
        <Link
          key={chip.href}
          href={chip.href}
          aria-current={chip.active ? "true" : undefined}
          className={`whitespace-nowrap rounded-full border px-5 py-2.5 text-sm transition-colors ${
            chip.active
              ? "border-ink-900 bg-ink-900 font-medium text-white"
              : "border-zinc-200 bg-white text-ink-700 hover:border-ink-900"
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
