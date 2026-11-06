import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

/** Chargement d'une fiche mentor : en-tête puis deux colonnes. */
export default function Loading() {
  return (
    <SkeletonPage label="Chargement du profil">
      <Skeleton className="h-5 w-32" />
      <div className="flex items-center gap-5 rounded-3xl border border-slate-200/70 bg-white p-6">
        <Skeleton className="size-24 shrink-0 rounded-full" />
        <div className="flex flex-1 flex-col gap-3">
          <Skeleton className="h-7 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-56 rounded-3xl" />
      </div>
    </SkeletonPage>
  );
}
