import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

/** Chargement de la liste des mentorats. */
export default function Loading() {
  return (
    <SkeletonPage label="Chargement des mentorats">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-9 w-80 max-w-full" />
      <Skeleton className="h-11 w-72 max-w-full rounded-xl" />
      <div className="mt-2 grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-44 rounded-3xl" />
        ))}
      </div>
    </SkeletonPage>
  );
}
