import { Skeleton } from "@/components/ui/skeleton";

export default function AdminActivityLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Mobile header */}
      <div className="mb-6 lg:hidden">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="mt-2 h-4 w-64" />
      </div>

      {/* Role tabs */}
      <div className="mb-4 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-md" />
        ))}
      </div>

      {/* Category chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-md" />
        ))}
      </div>

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Skeleton className="h-8 w-40 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-32 rounded-md" />
        <Skeleton className="h-8 w-56 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl" style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-[#e5e5e5] px-4 py-3.5 last:border-0"
          >
            {/* Event */}
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-44" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>

            {/* Time */}
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-2.5 w-16" />
            </div>

            {/* Device */}
            <Skeleton className="h-3 w-32" />

            {/* Type */}
            <Skeleton className="h-5 w-16 rounded-full" />

            {/* IP */}
            <Skeleton className="h-3 w-24 font-mono" />

            {/* Actor */}
            <div className="space-y-1">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2.5 w-16" />
            </div>

            {/* Related */}
            <div className="space-y-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-2.5 w-20" />
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
