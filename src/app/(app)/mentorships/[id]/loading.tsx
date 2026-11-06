import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

/** Chargement d'une conversation : liste, discussion et panneaux en squelette. */
export default function Loading() {
  return (
    <SkeletonPage label="Chargement de la conversation">
      <Skeleton className="h-5 w-36" />
      <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Skeleton className="hidden h-96 rounded-3xl lg:block" />
        <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex h-[58vh] min-h-80 flex-col gap-4 px-6 py-6">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="ml-auto h-10 w-1/2" />
            <Skeleton className="h-16 w-3/5" />
            <Skeleton className="ml-auto h-10 w-2/5" />
          </div>
          <div className="border-t border-slate-100 p-4">
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    </SkeletonPage>
  );
}
