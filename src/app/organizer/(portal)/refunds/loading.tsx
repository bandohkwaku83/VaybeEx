import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Refunds / Cancellation Requests portal page */
export default function RefundsLoading() {
  return (
    <div className="w-full p-6 lg:p-8" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48 rounded-full" />
          <Skeleton className="h-4 w-64 rounded-full" />
        </div>
        <Skeleton className="h-4 w-20 rounded-full" />
      </div>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-[14px] border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-8 w-12 rounded-full" />
            <Skeleton className="mt-1 h-3 w-20 rounded-full" />
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="mt-6 flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-9 w-20 rounded-full" />
        ))}
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-[var(--border-subtle)] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-32 rounded-full" />
                <Skeleton className="h-2.5 w-24 rounded-full" />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-3">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-3 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
