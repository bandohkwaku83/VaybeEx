import { Skeleton } from "@/components/ui/skeleton";

export default function AdminMessageDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Message header */}
      <div
        className="rounded-2xl bg-white p-5 sm:p-6"
        style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-7 w-64" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>

      {/* Message body */}
      <div
        className="mt-5 rounded-2xl bg-white p-5 sm:p-6"
        style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
      >
        <Skeleton className="mb-4 h-4.5 w-24" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-3.5" style={{ width: `${90 - i * 12}%` }} />
          ))}
        </div>
      </div>

      {/* Recipients list */}
      <div className="mt-5">
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>

        <div className="overflow-hidden rounded-xl" style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 border-b border-[#e5e5e5] px-4 py-3 last:border-0"
            >
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-3.5 w-28" />
                <Skeleton className="h-2.5 w-36" />
              </div>
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
