import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the traveler dashboard: sidebar + stat cards + recent trips */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <Skeleton className="h-4 w-64 rounded-full" />
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="mt-3 h-8 w-16 rounded-full" />
            </div>
          ))}
        </div>

        {/* Content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
                <Skeleton className="h-16 w-24 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                </div>
                <Skeleton className="h-8 w-20 rounded-full" />
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
