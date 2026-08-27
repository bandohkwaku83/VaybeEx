import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the expeditions page: header → search/filters → trip grid */
export default function ExpeditionsLoading() {
  return (
    <div className="bg-bg">
      <section className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 sm:pb-32 sm:pt-32">
        {/* Back link */}
        <Skeleton className="mb-8 h-4 w-28 rounded-full" />

        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <Skeleton className="h-3 w-36 rounded-full" />
          <Skeleton className="mt-3 h-10 w-[80%] rounded-lg sm:h-14" />
          <Skeleton className="mt-4 h-4 w-[65%] rounded-full" />
        </div>

        {/* Search bar + filters */}
        <div className="mb-10 border-y border-border py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <Skeleton className="h-11 w-full max-w-md rounded-lg" />
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
          <div className="mt-5 flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-16 rounded-full" />
            ))}
          </div>
        </div>

        {/* Trip grid skeleton — 6 cards */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-14 lg:grid-cols-3 lg:gap-y-16">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3 sm:space-y-4">
              <Skeleton className="aspect-[3/4] rounded-lg sm:aspect-[3/2]" />
              <Skeleton className="h-3 w-1/3 rounded-full" />
              <Skeleton className="h-5 w-4/5 rounded-full" />
              <div className="flex items-end justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
