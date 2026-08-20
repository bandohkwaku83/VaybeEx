import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Organizer Onboarding page */
export default function OnboardingLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Progress bar */}
      <div className="mb-10 flex items-center gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-1 items-center gap-2">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            {i < 3 && <Skeleton className="h-0.5 flex-1 rounded-full" />}
          </div>
        ))}
      </div>

      {/* Header */}
      <Skeleton className="mb-2 h-3 w-24 rounded-full" />
      <Skeleton className="h-8 w-56 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-72 rounded-full" />

      {/* Form fields */}
      <div className="mt-8 space-y-5">
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-11 w-full rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-32 rounded-full" />
          <Skeleton className="h-11 w-full rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-24 rounded-full" />
          <Skeleton className="h-11 w-full rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-20 rounded-full" />
          <Skeleton className="h-24 w-full rounded-none" />
        </div>
      </div>

      <div className="mt-8 flex justify-end gap-3">
        <Skeleton className="h-11 w-24 rounded-none" />
        <Skeleton className="h-11 w-32 rounded-none" />
      </div>
    </div>
  );
}
