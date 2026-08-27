import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the home page layout: hero → parallax → featured → steps → CTA → reviews */
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* ── Hero skeleton ── */}
      <section className="relative flex min-h-svh flex-col overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[var(--primary-dark)]" />
        <div className="relative flex flex-1 flex-col justify-end px-5 pb-10 pt-28 sm:px-6 sm:pb-12 sm:pt-28 lg:justify-center lg:px-6">
          <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16">
            <div>
              <Skeleton className="mb-2 h-3 w-48 rounded-full" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-[80%] rounded-lg sm:h-24 lg:h-28" />
                <Skeleton className="h-16 w-[60%] rounded-lg sm:h-24 lg:h-28" />
              </div>
              <div className="mt-10 flex gap-4">
                <Skeleton className="h-12 w-44 rounded-lg" />
                <Skeleton className="h-12 w-36 rounded-lg" />
              </div>
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-9 w-9 rounded-full border-2 border-bg" />
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-28 rounded-full" />
                  <Skeleton className="h-3 w-36 rounded-full" />
                </div>
              </div>
            </div>
            {/* Polaroid stack */}
            <div className="relative mx-auto hidden h-[560px] w-full max-w-md lg:block">
              <Skeleton className="absolute left-[8%] top-[4%] h-[420px] w-[60%] rounded-md" />
              <Skeleton className="absolute left-[70%] top-[2%] h-[320px] w-[45%] rounded-md" />
              <Skeleton className="absolute left-[22%] top-[46%] h-[280px] w-[40%] rounded-md" />
            </div>
          </div>
        </div>
      </section>

      {/* ── ParallaxBlock skeleton ── */}
      <section className="border-y border-border bg-surface-raised py-14 sm:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:gap-12 sm:px-6 lg:grid-cols-2">
          <div className="space-y-4">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-10 w-[90%] rounded-lg sm:h-14" />
            <Skeleton className="h-4 w-[80%] rounded-full" />
            <Skeleton className="h-4 w-[60%] rounded-full" />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          </div>
          <div className="relative mx-auto h-[300px] w-full max-w-md sm:h-[520px] sm:max-w-none">
            <Skeleton className="h-full w-full rounded-2xl" />
          </div>
        </div>
      </section>

      {/* ── Featured Trips skeleton ── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-28">
        <div className="mb-6 flex items-end justify-between sm:mb-10">
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-full" />
            <Skeleton className="h-8 w-64 rounded-lg sm:h-10" />
          </div>
          <Skeleton className="h-4 w-20 rounded-full" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-12 lg:grid-rows-2 lg:min-h-[36rem]">
          <Skeleton className="col-span-2 aspect-[16/10] rounded-2xl sm:aspect-[16/9] lg:col-span-7 lg:row-span-2 lg:aspect-auto lg:h-full" />
          <Skeleton className="aspect-[3/4] rounded-2xl sm:aspect-[4/5] lg:col-span-5 lg:aspect-auto lg:h-full" />
          <Skeleton className="aspect-[3/4] rounded-2xl sm:aspect-[4/5] lg:col-span-5 lg:aspect-auto lg:h-full" />
        </div>
      </section>

      {/* ── HowItWorks skeleton ── */}
      <section className="border-t border-border bg-bg-secondary py-14 sm:py-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mb-12 text-center sm:mb-20">
            <Skeleton className="mx-auto h-3 w-28 rounded-full" />
            <Skeleton className="mx-auto mt-3 h-8 w-72 rounded-lg sm:h-12" />
          </div>
          <div className="relative grid gap-12 md:grid-cols-3 md:gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <Skeleton className="mb-6 h-14 w-14 rounded-full" />
                <div className="w-full max-w-sm space-y-3 rounded-3xl border border-border bg-surface p-7">
                  <Skeleton className="h-12 w-16 rounded-lg" />
                  <Skeleton className="h-6 w-40 rounded-full" />
                  <Skeleton className="h-4 w-full rounded-full" />
                  <Skeleton className="h-4 w-[80%] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Big CTA skeleton ── */}
      <section className="relative isolate overflow-hidden bg-[var(--primary-dark)]">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-36">
          <Skeleton className="mx-auto h-12 w-[80%] rounded-lg bg-white/10 sm:h-20" />
          <Skeleton className="mx-auto mt-6 h-5 w-[60%] rounded-full bg-white/10" />
          <div className="mt-8 flex justify-center gap-3 sm:mt-9">
            <Skeleton className="h-12 w-36 rounded-lg bg-white/15" />
            <Skeleton className="h-12 w-36 rounded-lg bg-white/10" />
          </div>
        </div>
      </section>

      {/* ── Reviews skeleton ── */}
      <section className="border-t border-border bg-bg py-14 sm:py-32">
        <div className="mx-auto mb-10 max-w-3xl px-4 text-center sm:mb-14 sm:px-6">
          <Skeleton className="mx-auto h-3 w-28 rounded-full" />
          <Skeleton className="mx-auto mt-3 h-8 w-64 rounded-lg sm:h-14" />
        </div>
        <div className="space-y-6 overflow-hidden px-4">
          {[0, 1].map((row) => (
            <div key={row} className="flex gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  className="h-[240px] w-[min(300px,82vw)] shrink-0 rounded-lg sm:h-[272px] sm:w-[360px]"
                />
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
