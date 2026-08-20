import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the organizer dashboard: stat strip + trip overview + recent bookings */
export default function OrganizerDashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-1">
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border border-border bg-surface p-5">
            <Skeleton className="h-4 w-24 rounded-full" />
            <Skeleton className="mt-3 h-8 w-20 rounded-full" />
            <Skeleton className="mt-1 h-3 w-16 rounded-full" />
          </div>
        ))}
      </div>

      {/* Trip overview + activity */}
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-3">
          <Skeleton className="h-5 w-32 rounded-full" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
              <Skeleton className="h-14 w-20 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40 rounded-full" />
                <Skeleton className="h-3 w-28 rounded-full" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <Skeleton className="h-5 w-28 rounded-full" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-3 w-32 rounded-full" />
                <Skeleton className="h-2.5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3 w-12 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
