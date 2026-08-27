import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Edit Trip page — mirrors the TripFormEditor layout */
export default function EditTripLoading() {
  return (
    <div className="w-full p-6 lg:p-8" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-7 w-40 rounded-full" />
          <Skeleton className="h-4 w-56 rounded-full" />
        </div>
      </div>

      {/* Form sections */}
      <div className="space-y-6">
        {/* Image upload area */}
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <Skeleton className="mb-4 h-4 w-28 rounded-full" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>

        {/* Basic details — two columns */}
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <Skeleton className="mb-4 h-4 w-32 rounded-full" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 rounded-full" />
              <Skeleton className="h-11 w-full rounded-none" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded-full" />
              <Skeleton className="h-11 w-full rounded-none" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-16 rounded-full" />
              <Skeleton className="h-11 w-full rounded-none" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 rounded-full" />
              <Skeleton className="h-11 w-full rounded-none" />
            </div>
          </div>
        </div>

        {/* Description textarea */}
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <Skeleton className="mb-4 h-4 w-24 rounded-full" />
          <Skeleton className="h-32 w-full rounded-none" />
        </div>

        {/* Pricing */}
        <div className="rounded-xl border border-[var(--border)] bg-white p-5">
          <Skeleton className="mb-4 h-4 w-20 rounded-full" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-3.5 w-16 rounded-full" />
                <Skeleton className="h-11 w-full rounded-none" />
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3">
          <Skeleton className="h-10 w-24 rounded-none" />
          <Skeleton className="h-10 w-32 rounded-none" />
        </div>
      </div>
    </div>
  );
}
