import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the wishlist page: header → trip grid */
export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8">
        {/* Header */}
        <header className="mb-10 sm:mb-12">
          <Skeleton className="h-3 w-20 rounded-full" />
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-40 rounded-lg" />
                <Skeleton className="h-8 min-w-8 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-4 w-48 rounded-full" />
            </div>
            <Skeleton className="h-4 w-36 rounded-full" />
          </div>
        </header>

        {/* Grid of skeleton cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/5] rounded-2xl" />
              <Skeleton className="h-3 w-1/3 rounded-full" />
              <Skeleton className="h-5 w-4/5 rounded-full" />
              <div className="flex items-end justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
