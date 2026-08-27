import { Skeleton } from "@/components/ui/skeleton";

export default function AdminUserDetailLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-3" />
        <Skeleton className="h-4 w-28" />
      </div>

      {/* Identity header */}
      <div
        className="rounded-2xl bg-white p-4 sm:p-5"
        style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-3.5">
            <Skeleton className="h-14 w-14 shrink-0 rounded-xl sm:h-16 sm:w-16" />
            <div className="min-w-0 flex-1 space-y-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-16 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-48" />
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20 rounded-lg" />
            <Skeleton className="h-9 w-20 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content grid */}
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        {/* Profile card */}
        <div
          className="rounded-2xl p-5 sm:p-6"
          style={{ background: "#fff", boxShadow: "inset 0 0 0 1px #e5e5e5" }}
        >
          <Skeleton className="mb-4 h-4.5 w-16" />
          <div className="space-y-3.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-start justify-between border-b border-[#f0f0f0] py-3.5 last:border-0">
                <div className="space-y-1.5">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="h-3.5 w-32" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats + Activity */}
        <div className="space-y-5">
          {/* Stats */}
          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{ background: "#fff", boxShadow: "inset 0 0 0 1px #e5e5e5" }}
          >
            <Skeleton className="mb-4 h-4.5 w-12" />
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-2.5 w-12" />
                  <Skeleton className="h-7 w-14" />
                  <Skeleton className="h-2.5 w-10" />
                </div>
              ))}
            </div>
          </div>

          {/* Activity */}
          <div
            className="rounded-2xl p-5 sm:p-6"
            style={{ background: "#fff", boxShadow: "inset 0 0 0 1px #e5e5e5" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-4.5 w-16" />
              <Skeleton className="h-3.5 w-16" />
            </div>
            <div className="space-y-0">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex gap-3 border-b border-[#f0f0f0] py-3.5 last:border-0"
                >
                  <Skeleton className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-36" />
                    <Skeleton className="h-2.5 w-44" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
