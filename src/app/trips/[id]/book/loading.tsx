import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the booking page: trip summary + booking form + price breakdown */
export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Back link */}
        <Skeleton className="mb-8 h-4 w-24 rounded-full" />

        {/* Trip summary card */}
        <div className="mb-8 flex gap-4 rounded-2xl border border-border bg-surface p-4">
          <Skeleton className="h-20 w-28 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-5 w-48 rounded-full" />
            <Skeleton className="h-3 w-36 rounded-full" />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 rounded-full" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <Skeleton className="h-5 w-28 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-border p-3">
                  <Skeleton className="h-4 w-24 rounded-full" />
                  <Skeleton className="mt-2 h-3 w-16 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="rounded-2xl border border-border bg-surface p-5 space-y-3">
            <Skeleton className="h-5 w-32 rounded-full" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between">
                <Skeleton className="h-3 w-28 rounded-full" />
                <Skeleton className="h-3 w-16 rounded-full" />
              </div>
            ))}
            <div className="border-t border-border pt-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-5 w-24 rounded-full" />
              </div>
            </div>
          </div>

          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
