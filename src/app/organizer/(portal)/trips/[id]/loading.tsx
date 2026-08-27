import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Trip Detail portal page: header with image, stat cards, tabs, attendee table */
export default function TripDetailLoading() {
  return (
    <div className="w-full" style={{ background: "#f5f5f5" }}>
      {/* Hero image + overlay */}
      <div className="relative h-56 w-full overflow-hidden bg-[var(--bg-secondary)]">
        <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/60 to-transparent p-6">
          <Skeleton className="h-3 w-20 rounded-full bg-white/20" />
          <Skeleton className="mt-2 h-7 w-64 rounded-full bg-white/20" />
          <div className="mt-2 flex gap-3">
            <Skeleton className="h-3 w-24 rounded-full bg-white/20" />
            <Skeleton className="h-3 w-20 rounded-full bg-white/20" />
          </div>
        </div>
      </div>

      <div className="p-6 lg:p-8">
        {/* Back button */}
        <Skeleton className="mb-5 h-4 w-24 rounded-full" />

        {/* Stat cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-[var(--border)] bg-white p-4">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="mt-2 h-7 w-20 rounded-full" />
              <Skeleton className="mt-1 h-3 w-12 rounded-full" />
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="mb-5 flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>

        {/* Content area: attendee list */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-white p-4">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-36 rounded-full" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
              <Skeleton className="h-6 w-14 rounded-full" />
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-3 w-14 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
