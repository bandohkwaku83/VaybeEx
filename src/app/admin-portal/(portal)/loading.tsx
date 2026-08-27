import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboardLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-32 rounded-full" />
      </div>

      {/* Attention tiles */}
      <section className="mb-10">
        <div className="mb-4 flex items-end justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 sm:p-6"
              style={{
                boxShadow:
                  i === 0
                    ? "0 18px 40px -24px rgba(23,23,23,0.55)"
                    : "inset 0 0 0 1px #e5e5e5",
                background: i === 0 ? "#171717" : "#fff",
              }}
            >
              <div className="flex items-start justify-between">
                <Skeleton
                  className="h-10 w-10 rounded-xl"
                  style={{
                    background: i === 0 ? "rgba(255,255,255,0.1)" : "#f5f5f5",
                  }}
                />
                <Skeleton
                  className="h-10 w-14"
                  style={{
                    background: i === 0 ? "rgba(255,255,255,0.1)" : "#f5f5f5",
                  }}
                />
              </div>
              <div className="mt-5 space-y-2">
                <Skeleton
                  className="h-4 w-28"
                  style={{
                    background: i === 0 ? "rgba(255,255,255,0.1)" : "#f5f5f5",
                  }}
                />
                <Skeleton
                  className="h-3 w-44"
                  style={{
                    background: i === 0 ? "rgba(255,255,255,0.1)" : "#f5f5f5",
                  }}
                />
              </div>
              <Skeleton
                className="mt-5 h-3 w-24"
                style={{
                  background: i === 0 ? "rgba(255,255,255,0.1)" : "#f5f5f5",
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Platform pulse metrics */}
      <section className="mb-10">
        <Skeleton className="mb-5 h-5 w-32" />
        <div className="grid gap-5 border-y border-[#e5e5e5] py-7 sm:grid-cols-2 lg:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border-b border-[#e5e5e5] pb-5 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-6 last:border-0 last:sm:border-r-0 last:sm:pr-0 lg:pr-8"
            >
              <Skeleton className="h-2.5 w-16" />
              <Skeleton className="mt-3 h-9 w-20" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
          ))}
        </div>
        <Skeleton className="mt-4 h-4 w-48" />
      </section>

      {/* Trips + Money */}
      <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
        <div className="lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-3 w-40" />
            </div>
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-3 w-full rounded-full" />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <Skeleton className="h-3.5 w-20" />
                </div>
                <Skeleton className="h-3.5 w-8" />
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="mb-5 h-5 w-28" />
          <div
            className="rounded-2xl bg-white p-5"
            style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
          >
            <Skeleton className="h-2.5 w-14" />
            <Skeleton className="mt-2 h-8 w-28" />
            <Skeleton className="mt-1 h-3 w-32" />
            <div className="mt-5 space-y-3 border-t border-[#e5e5e5] pt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-baseline justify-between">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-3.5 w-16" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Organizer pipeline + shortcuts */}
      <div className="mt-10 grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
          <div
            className="rounded-2xl bg-white px-5 py-5 sm:px-6"
            style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
          >
            <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-1 py-4 sm:px-4 sm:py-0">
                  <Skeleton className="h-2.5 w-16" />
                  <Skeleton className="mt-2 h-7 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="mb-4 h-5 w-16" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-white px-4 py-3"
                style={{ boxShadow: "inset 0 0 0 1px #e5e5e5" }}
              >
                <Skeleton className="h-4 w-4 shrink-0" />
                <Skeleton className="h-3.5 flex-1" />
                <Skeleton className="h-3.5 w-3.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
