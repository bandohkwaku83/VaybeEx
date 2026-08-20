import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Messages & Broadcasts portal page */
export default function MessagesLoading() {
  return (
    <div className="w-full p-6 lg:p-8" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <div className="mb-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-56 rounded-full" />
          <Skeleton className="h-4 w-72 rounded-full" />
        </div>
        <div className="flex items-center gap-4">
          <Skeleton className="h-4 w-16 rounded-full" />
          <Skeleton className="h-4 w-16 rounded-full" />
        </div>
      </div>

      {/* Tab bar */}
      <div className="mb-6 mt-4 flex gap-2">
        <Skeleton className="h-10 w-36 rounded-full" />
        <Skeleton className="h-10 w-44 rounded-full" />
      </div>

      {/* Two-column compose layout */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left: Audience panel */}
        <section>
          <Skeleton className="mb-3 h-5 w-24 rounded-full" />
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 space-y-4">
            <div>
              <Skeleton className="mb-1.5 h-3 w-12 rounded-full" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20 rounded-full" />
              <Skeleton className="h-4 w-28 rounded-full" />
            </div>
            <Skeleton className="h-3 w-56 rounded-full" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-9 w-36 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-3 w-64 rounded-full" />
          </div>
        </section>

        {/* Right: Message panel */}
        <section>
          <Skeleton className="mb-3 h-5 w-24 rounded-full" />
          <div className="rounded-2xl border border-[var(--border)] bg-white p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-16 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-b-xl" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-36 rounded-full" />
              <Skeleton className="h-3 w-28 rounded-full" />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Skeleton className="h-10 w-28 rounded-lg" />
          </div>
        </section>
      </div>
    </div>
  );
}
