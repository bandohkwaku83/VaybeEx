import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the tenant brand landing: hero + trip grid */
export default function TenantBrandLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[var(--primary-dark)] py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <Skeleton className="h-20 w-20 shrink-0 rounded-full bg-white/10" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-56 rounded-lg bg-white/10" />
              <Skeleton className="h-4 w-72 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 rounded-xl bg-white/5" />
            ))}
          </div>
        </div>
      </section>

      {/* Trip grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <Skeleton className="mb-8 h-8 w-48 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[3/4] rounded-2xl" />
              <Skeleton className="h-3 w-1/3 rounded-full" />
              <Skeleton className="h-5 w-4/5 rounded-full" />
              <div className="flex items-end justify-between">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
