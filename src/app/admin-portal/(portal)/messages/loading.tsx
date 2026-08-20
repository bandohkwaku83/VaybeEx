import { Skeleton } from "@/components/ui/skeleton";

export default function AdminMessagesLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Mobile header */}
      <div className="mb-6 lg:hidden">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="mt-2 h-4 w-52" />
      </div>

      {/* Compose section */}
      <section
        className="rounded-2xl bg-white p-5 sm:p-6"
        style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
      >
        <Skeleton className="mb-5 h-5 w-40" />

        {/* Step 1: Who */}
        <div className="space-y-5">
          <div className="border-t border-[#f0f0f0] pt-5">
            <div className="mb-3 flex items-start gap-3">
              <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-44" />
              </div>
            </div>
            <div className="pl-9 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-8 w-24 rounded-md" />
                <Skeleton className="h-8 w-24 rounded-md" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-22 rounded-md" />
                <Skeleton className="h-8 w-22 rounded-md" />
                <Skeleton className="h-8 w-28 rounded-md" />
              </div>
            </div>
          </div>

          {/* Step 2: Channel */}
          <div className="border-t border-[#f0f0f0] pt-5">
            <div className="mb-3 flex items-start gap-3">
              <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-44" />
                <Skeleton className="h-2.5 w-52" />
              </div>
            </div>
            <div className="pl-9 flex gap-2">
              <Skeleton className="h-8 w-28 rounded-md" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          </div>

          {/* Step 3: Message */}
          <div className="border-t border-[#f0f0f0] pt-5">
            <div className="mb-3 flex items-start gap-3">
              <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-2.5 w-56" />
              </div>
            </div>
            <div className="pl-9 space-y-3">
              <Skeleton className="h-32 w-full rounded-lg" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>

          {/* Preview bar */}
          <div className="border-t border-[#f0f0f0] pt-5">
            <div className="rounded-xl px-4 py-3" style={{ background: "#fafafa" }}>
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="mt-4 flex justify-end">
              <Skeleton className="h-9 w-48 rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* History section */}
      <section className="mt-10">
        <Skeleton className="mb-1 h-5 w-32" />
        <Skeleton className="mb-4 h-3.5 w-48" />
        <div className="mb-4 flex gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-16 rounded-md" />
          ))}
          <Skeleton className="h-8 w-28 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
        </div>

        {/* Table skeleton */}
        <div className="overflow-hidden rounded-xl" style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-[#e5e5e5] px-4 py-3.5 last:border-0"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-2.5 w-56" />
              </div>
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-5 w-12 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-2.5 w-14" />
                <Skeleton className="h-2.5 w-16" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
