import { Skeleton } from "@/components/ui/skeleton";

export default function AdminRefundDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Refund header card */}
      <div
        className="rounded-2xl bg-white p-5 sm:p-6"
        style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-3.5 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-lg" />
            <Skeleton className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Info cards */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {/* Trip info */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "#fff", boxShadow: "inset 0 0 0 1px #e5e5e5" }}
        >
          <Skeleton className="mb-4 h-4.5 w-10" />
          <div className="space-y-3.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-2.5 w-16" />
                <Skeleton className="h-3.5 w-36" />
              </div>
            ))}
          </div>
        </div>

        {/* Traveler info */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "#fff", boxShadow: "inset 0 0 0 1px #e5e5e5" }}
        >
          <Skeleton className="mb-4 h-4.5 w-16" />
          <div className="space-y-3.5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton className="h-2.5 w-12" />
                <Skeleton className="h-3.5 w-32" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline / Status history */}
      <div className="mt-5">
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{ background: "#fff", boxShadow: "inset 0 0 0 1px #e5e5e5" }}
        >
          <Skeleton className="mb-4 h-4.5 w-28" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  {i < 2 && <Skeleton className="mt-1 h-8 w-0.5" />}
                </div>
                <div className="flex-1 pb-4 space-y-1.5">
                  <Skeleton className="h-3.5 w-32" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
