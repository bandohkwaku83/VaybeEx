import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the organizer verification page */
export default function VerificationLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
        <Skeleton className="mb-2 h-3 w-32 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="mt-2 h-4 w-72 rounded-full" />

        <div className="mt-8 space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-40 rounded-full" />
                  <Skeleton className="h-3 w-56 rounded-full" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <Skeleton className="mt-8 h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
