import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Create Trip page: header stats, search bar, filter tabs, trip card grid */
export default function TripsNewLoading() {
  return (
    <div className="w-full p-6 lg:p-8" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-40 rounded-full" />
          <Skeleton className="h-4 w-64 rounded-full" />
        </div>
        <Skeleton className="h-11 w-36 rounded-lg" />
      </div>

      {/* Stat strip */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-white p-4">
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="mt-2 h-7 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Search + filter tabs */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-64 rounded-lg" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* Trip cards grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
            <Skeleton className="h-40 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32 rounded-full" />
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24 rounded-full" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
