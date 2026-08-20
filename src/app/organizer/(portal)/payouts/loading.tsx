import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Payouts portal page */
export default function PayoutsLoading() {
  return (
    <div className="w-full px-4 py-8 sm:px-6 lg:px-10 lg:py-10" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-32 rounded-full" />
          <Skeleton className="h-4 w-56 rounded-full" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[14px] border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-8 w-24 rounded-full" />
            <Skeleton className="mt-1 h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Trip selector + filter tabs */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-16 rounded-full" />
          <Skeleton className="h-9 w-16 rounded-full" />
          <Skeleton className="h-9 w-16 rounded-full" />
          <Skeleton className="h-9 w-16 rounded-full" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        <div className="flex items-center gap-4 border-b border-[var(--border)] px-4 py-3">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        {/* Table header */}
        <div className="grid grid-cols-6 gap-4 border-b border-[var(--border)] px-4 py-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-3 w-16 rounded-full" />
          ))}
        </div>
        {/* Table rows */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="grid grid-cols-6 items-center gap-4 border-b border-[var(--border-subtle)] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28 rounded-full" />
                <Skeleton className="h-2.5 w-20 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-3 w-20 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-3 w-14 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
