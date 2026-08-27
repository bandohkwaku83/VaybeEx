import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRefundsLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Mobile header */}
      <div className="mb-6 lg:hidden">
        <Skeleton className="h-7 w-22" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Status stat cards */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-white px-3.5 py-3"
            style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
          >
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="mt-2 h-6 w-20" />
            <Skeleton className="mt-1 h-3 w-12" />
          </div>
        ))}
      </div>

      {/* Filter buttons */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
        <Skeleton className="h-8 w-56 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl" style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#e5e5e5] px-4 py-3.5 last:border-0"
          >
            {/* Trip */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-2.5 w-24" />
            </div>

            {/* Traveler */}
            <Skeleton className="h-3.5 w-24" />

            {/* Organizer */}
            <Skeleton className="h-3.5 w-24" />

            {/* Paid */}
            <Skeleton className="h-3.5 w-16" />

            {/* Refund */}
            <Skeleton className="h-3.5 w-16" />

            {/* Status */}
            <Skeleton className="h-5 w-20 rounded-full" />

            {/* Requested */}
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-3.5 w-20" />
        <div className="flex gap-1">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}
