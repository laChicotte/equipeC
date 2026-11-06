import { MentorCardSkeleton, Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

/** Chargement du catalogue : en-tête, recherche, filtres et grille de cartes. */
export default function Loading() {
  return (
    <SkeletonPage label="Chargement des mentors">
      <Skeleton className="h-44 rounded-3xl" />
      <Skeleton className="h-28 rounded-3xl" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="mt-2 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <MentorCardSkeleton key={i} />
        ))}
      </div>
    </SkeletonPage>
  );
}
