import { Skeleton, SkeletonPage } from "@/components/ui/Skeleton";

/** Chargement d'une conversation : même disposition que la page (discussion | panneaux). */
export default function Loading() {
  return (
    <SkeletonPage label="Chargement de la conversation">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-6 w-32 rounded-full" />
      </div>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white lg:h-[calc(100dvh-8.5rem)] lg:min-h-[30rem]">
          <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>
          <div className="flex h-[58vh] min-h-80 flex-col gap-4 px-6 py-6 lg:h-auto lg:flex-1">
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="ml-auto h-10 w-1/2" />
            <Skeleton className="h-16 w-3/5" />
            <Skeleton className="ml-auto h-10 w-2/5" />
          </div>
          <div className="border-t border-slate-100 p-4">
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-16 rounded-3xl" />
        </div>
      </div>
    </SkeletonPage>
  );
}
