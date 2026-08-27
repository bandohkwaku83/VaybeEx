import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Withdrawals portal page: header, stat cards, filter tabs, table */
export default function WithdrawalsLoading() {
  return (
    <div className="w-full p-6 lg:p-8" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-40 rounded-full" />
          <Skeleton className="h-4 w-60 rounded-full" />
        </div>
        <Skeleton className="h-10 w-36 rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border border-[var(--border)] bg-white p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-xl" />
            </div>
            <Skeleton className="mt-3 h-7 w-24 rounded-full" />
            <Skeleton className="mt-1 h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Filter tabs + search */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-56 rounded-lg" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-white">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 border-b border-[var(--border-subtle)] px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-28 rounded-full" />
                <Skeleton className="h-2.5 w-20 rounded-full" />
              </div>
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
