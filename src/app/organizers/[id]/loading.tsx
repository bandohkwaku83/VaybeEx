import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the organizer profile page: gradient header + avatar + name + tabs + content grid */
export default function OrganizerProfileLoading() {
  return (
    <div className="mx-auto w-full px-4 py-8 sm:px-6 lg:px-8" style={{ background: "var(--bg)" }}>
      {/* Hero card */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border bg-surface">
        {/* Gradient band */}
        <div className="h-28" style={{ background: "var(--gradient-brand)" }} />

        <div className="relative px-6 pb-0">
          {/* Avatar */}
          <Skeleton className="absolute -top-12 left-6 h-24 w-24 rounded-full border-4 border-surface" />

          {/* Name row */}
          <div className="flex flex-wrap items-start justify-between gap-4 pt-16">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-40 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-5 w-36 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-28 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4 space-y-2">
            <Skeleton className="h-3 w-full max-w-2xl rounded-full" />
            <Skeleton className="h-3 w-[70%] max-w-lg rounded-full" />
          </div>

          {/* Social row */}
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-7 w-7 rounded-none" />
            <Skeleton className="h-7 w-7 rounded-none" />
            <Skeleton className="h-7 w-7 rounded-none" />
          </div>

          {/* Tabs */}
          <div className="mt-5 flex gap-1 border-t border-border">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-none" />
            ))}
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Left */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 rounded-xl" />
              <Skeleton className="h-24 rounded-xl" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-5 w-32 rounded-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="aspect-[3/4] rounded-xl" />
              <Skeleton className="aspect-[3/4] rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-4">
          <Skeleton className="h-40 rounded-[14px]" />
          <Skeleton className="h-56 rounded-[14px]" />
          <Skeleton className="h-40 rounded-[14px]" />
        </aside>
      </div>
    </div>
  );
}
