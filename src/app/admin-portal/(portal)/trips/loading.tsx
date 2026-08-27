import { Skeleton } from "@/components/ui/skeleton";

export default function AdminTripsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Mobile header */}
      <div className="mb-6 lg:hidden">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="mt-2 h-4 w-32" />
      </div>

      {/* Filter buttons + search */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
        <Skeleton className="h-8 w-64 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl" style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}>
        {/* Table header */}
        <div className="grid grid-cols-7 gap-4 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-14" />
          <Skeleton className="h-3 w-8" />
        </div>

        {/* Table rows */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-7 gap-4 border-b border-[#e5e5e5] px-4 py-4 last:border-0"
          >
            {/* Trip with thumbnail */}
            <div className="col-span-1 flex items-center gap-3">
              <Skeleton className="h-11 w-14 shrink-0 rounded-lg" />
              <div className="min-w-0 space-y-1.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>

            {/* Organizer */}
            <div className="col-span-1 space-y-1.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-28" />
            </div>

            {/* Dates */}
            <Skeleton className="h-3 w-24" />

            {/* Status */}
            <Skeleton className="h-5 w-16 rounded-full" />

            {/* Bookings */}
            <Skeleton className="h-3 w-6" />

            {/* Revenue */}
            <Skeleton className="h-3.5 w-16" />

            {/* View */}
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
