import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the tenant trip detail: hero image → content + booking sidebar */
export default function TenantTripLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Hero image */}
      <div className="relative h-[50vh] w-full bg-[var(--bg-secondary)]">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Left */}
          <div className="space-y-6">
            {/* Brand breadcrumb */}
            <Skeleton className="h-3 w-48 rounded-full" />
            <Skeleton className="h-10 w-[85%] rounded-lg" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-3 gap-2">
              <Skeleton className="col-span-2 aspect-[4/3] rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="aspect-square rounded-lg" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Skeleton className="h-5 w-32 rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="h-4 w-[85%] rounded-full" />
            </div>

            {/* Itinerary */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-28 rounded-full" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-border p-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-3 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — booking sidebar */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <div className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
              <Skeleton className="h-8 w-32 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
              <div className="border-t border-border pt-4">
                <Skeleton className="h-4 w-full rounded-full" />
                <Skeleton className="mt-2 h-4 w-[80%] rounded-full" />
              </div>
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-10 w-full rounded-lg" />
              <div className="space-y-2 pt-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-3 w-full rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
