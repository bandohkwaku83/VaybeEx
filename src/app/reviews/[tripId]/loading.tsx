import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the reviews page: header + review cards */
export default function ReviewsLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-4xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-28">
        {/* Header */}
        <div className="mb-10">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="mt-3 h-10 w-64 rounded-lg" />
          <Skeleton className="mt-3 h-4 w-72 rounded-full" />
        </div>

        {/* Rating summary */}
        <div className="mb-8 flex gap-5 rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-col items-center gap-2 pr-6 border-r border-border">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-4 w-4" />
              ))}
            </div>
            <Skeleton className="h-3 w-16 rounded-full" />
          </div>
          <div className="flex-1 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-3 w-24 rounded-full" />
                <Skeleton className="h-[5px] flex-1 rounded-full" />
                <Skeleton className="h-3 w-7 rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Review cards */}
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-5">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded-full" />
                    <Skeleton className="h-3 w-36 rounded-full" />
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Skeleton key={j} className="h-3.5 w-3.5" />
                  ))}
                </div>
              </div>
              <Skeleton className="h-4 w-full rounded-full" />
              <Skeleton className="mt-1 h-4 w-[85%] rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
