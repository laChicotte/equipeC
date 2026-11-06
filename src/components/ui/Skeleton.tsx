import type { ReactNode } from "react";

/**
 * Blocs de chargement (squelettes) : affichés pendant qu'une page charge ses
 * données, à la place d'un écran blanc. Annoncés une seule fois aux lecteurs
 * d'écran par le conteneur `SkeletonPage`.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />;
}

export function SkeletonPage({ children, label = "Chargement" }: { children: ReactNode; label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-4">
      {children}
      <span className="sr-only">{label}…</span>
    </div>
  );
}

/** Squelette d'une carte mentor (catalogue). */
export function MentorCardSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white">
      <Skeleton className="h-20 rounded-none" />
      <div className="px-6 pb-6">
        <Skeleton className="-mt-10 size-20 rounded-full border-4 border-white" />
        <Skeleton className="mt-4 h-5 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <div className="mt-4 flex gap-2">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-6 w-16 rounded-lg" />
        </div>
        <Skeleton className="mt-6 h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}
