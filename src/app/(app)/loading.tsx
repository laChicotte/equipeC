/**
 * Affiché instantanément pendant le chargement d'une page de la zone connectée
 * (le menu latéral reste visible). Squelette animé plutôt qu'un écran blanc.
 */
export default function Loading() {
  const block = "animate-pulse rounded-2xl bg-zinc-200/70";
  return (
    <div role="status" aria-label="Chargement" className="flex flex-col gap-4">
      <div className={`${block} h-8 w-64`} />
      <div className={`${block} h-4 w-80 max-w-full`} />
      <div className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className={`${block} h-40`} />
        ))}
      </div>
      <span className="sr-only">Chargement…</span>
    </div>
  );
}
