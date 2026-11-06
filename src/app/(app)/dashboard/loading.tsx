import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

/** Chargement du tableau de bord : salutation, statistiques, bandeau et cartes. */
export default function Loading() {
  return (
    <SkeletonPage label="Chargement du tableau de bord">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-9 w-72 max-w-full" />
      <div className="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-36 rounded-3xl" />
        ))}
      </div>
      <Skeleton className="h-36 rounded-3xl" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-56 rounded-3xl" />
        <Skeleton className="h-56 rounded-3xl" />
      </div>
    </SkeletonPage>
  );
}
