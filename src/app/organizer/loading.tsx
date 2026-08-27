import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the organizer landing page layout */
export default function OrganizerLoading() {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* ── Hero skeleton ── */}
      <section className="relative flex min-h-svh flex-col overflow-hidden bg-[var(--primary-dark)]">
        <div className="relative flex flex-1 flex-col justify-center px-4 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl space-y-6">
              <Skeleton className="h-16 w-[85%] rounded-lg bg-white/10 sm:h-24 lg:h-28" />
              <Skeleton className="h-16 w-[60%] rounded-lg bg-white/10 sm:h-24 lg:h-28" />
              <div className="mt-10 flex gap-3">
                <Skeleton className="h-12 w-52 rounded-lg bg-white/10" />
                <Skeleton className="h-12 w-40 rounded-lg bg-white/10" />
              </div>
              <div className="mt-16 flex gap-10 border-t border-white/20 pt-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg bg-white/10" />
                    <div className="space-y-1">
                      <Skeleton className="h-5 w-16 rounded-full bg-white/10" />
                      <Skeleton className="h-3 w-24 rounded-full bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Horizontal Slider skeleton ── */}
      <section className="relative h-screen overflow-hidden bg-[var(--primary-dark)]">
        <div className="absolute left-0 top-0 h-1 w-full bg-white/10" />
        <div className="flex h-full items-center justify-center px-8">
          <div className="max-w-3xl text-center space-y-4">
            <Skeleton className="mx-auto h-4 w-48 rounded-full bg-white/10" />
            <Skeleton className="mx-auto h-16 w-[80%] rounded-lg bg-white/10" />
            <Skeleton className="mx-auto h-5 w-[60%] rounded-full bg-white/10" />
          </div>
        </div>
      </section>

      {/* ── HowItWorks skeleton ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-20 max-w-2xl space-y-4">
            <Skeleton className="h-3 w-40 rounded-full" />
            <Skeleton className="h-12 w-[70%] rounded-lg" />
            <Skeleton className="h-5 w-[80%] rounded-full" />
          </div>
          <div className="relative space-y-16">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-8">
                <div className="flex shrink-0 flex-col items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-3 w-20 rounded-full" />
                  <Skeleton className="h-7 w-48 rounded-full" />
                  <Skeleton className="h-4 w-full max-w-lg rounded-full" />
                  <Skeleton className="h-3 w-32 rounded-full" />
                </div>
                <div className="hidden w-[44%] shrink-0 lg:block">
                  <Skeleton className="h-48 rounded-2xl border border-border" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools skeleton ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,520px)_1fr] lg:gap-12">
            <div className="space-y-4">
              <Skeleton className="h-3 w-36 rounded-full" />
              <Skeleton className="h-10 w-[80%] rounded-lg" />
              <Skeleton className="h-4 w-full rounded-full" />
              <div className="mt-8 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-2xl" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-3 w-24 rounded-full" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4 px-4 py-7 sm:px-8 sm:py-9">
                    <Skeleton className="h-11 w-11 rounded-xl" />
                    <Skeleton className="h-5 w-32 rounded-full" />
                    <Skeleton className="h-3 w-full rounded-full" />
                    <Skeleton className="h-3 w-[70%] rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Payments skeleton ── */}
      <section className="bg-[var(--primary-dark)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="space-y-6">
              <Skeleton className="h-3 w-32 rounded-full bg-white/10" />
              <Skeleton className="h-12 w-[80%] rounded-lg bg-white/10" />
              <Skeleton className="h-4 w-[90%] rounded-full bg-white/10" />
              <div className="mt-10 space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 shrink-0 rounded-full bg-white/10" />
                    <Skeleton className="h-4 flex-1 rounded-full bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid h-[480px] grid-cols-2 grid-rows-2 gap-3">
              <Skeleton className="col-start-1 row-start-1 row-span-2 rounded-2xl bg-white/5" />
              <Skeleton className="col-start-2 row-start-1 rounded-2xl bg-white/5" />
              <Skeleton className="col-start-2 row-start-2 rounded-2xl bg-white/5" />
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ skeleton ── */}
      <section className="mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-16 max-w-xl space-y-4">
          <Skeleton className="h-3 w-32 rounded-full" />
          <Skeleton className="h-12 w-48 rounded-lg" />
          <Skeleton className="h-4 w-[80%] rounded-full" />
        </div>
        <div className="space-y-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-start gap-5 border-b border-border px-1 py-7">
              <Skeleton className="h-3 w-6 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-[70%] rounded-full" />
              </div>
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA skeleton ── */}
      <section className="relative overflow-hidden border-t border-border bg-[var(--primary-dark)]">
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <Skeleton className="mx-auto h-3 w-12 rounded-full bg-white/10" />
          <Skeleton className="mx-auto mt-6 h-12 w-[80%] rounded-lg bg-white/10 sm:h-16" />
          <Skeleton className="mx-auto mt-6 h-5 w-[60%] rounded-full bg-white/10" />
          <div className="mt-10 flex justify-center gap-3">
            <Skeleton className="h-12 w-40 rounded-lg bg-white/10" />
            <Skeleton className="h-12 w-40 rounded-lg bg-white/10" />
          </div>
        </div>
      </section>
    </div>
  );
}
