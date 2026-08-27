import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUsersLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Mobile header */}
      <div className="mb-6 flex flex-col gap-2 lg:hidden sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-7 w-24" />
          <Skeleton className="mt-2 h-4 w-52" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>

      {/* Queue tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5"
            style={{
              boxShadow: i === 0 ? "none" : "inset 0 0 0 1px #e5e5e5",
              background: i === 0 ? "#171717" : "#fff",
            }}
          >
            <Skeleton
              className="h-3.5 w-16"
              style={{ background: i === 0 ? "rgba(255,255,255,0.15)" : "#f5f5f5" }}
            />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-8 w-64 rounded-md" />
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl" style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}>
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 border-b border-[#e5e5e5] bg-[#fafafa] px-4 py-3">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-3 w-14" />
        </div>

        {/* Table rows */}
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 border-b border-[#e5e5e5] px-4 py-3.5 last:border-0"
          >
            {/* Person */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-[10px]" />
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-36" />
              </div>
            </div>

            {/* Role */}
            <Skeleton className="h-3 w-16" />

            {/* Status */}
            <Skeleton className="h-5 w-20 rounded-full" />

            {/* Joined */}
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-2.5 w-16" />
            </div>

            {/* Last seen */}
            <div className="space-y-1">
              <Skeleton className="h-2.5 w-14" />
              <Skeleton className="h-2.5 w-18" />
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
