import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the login page split layout: left form panel + right image panel */
export default function LoginLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Left — form panel */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm space-y-6">
          {/* Logo */}
          <Skeleton className="h-8 w-32 rounded-full" />

          {/* Tab switcher */}
          <div className="flex gap-1">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16 rounded-full" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 rounded-full" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>

          {/* Submit button */}
          <Skeleton className="h-12 w-full rounded-lg" />

          {/* Divider */}
          <div className="flex items-center gap-3">
            <Skeleton className="h-px flex-1" />
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="h-px flex-1" />
          </div>

          {/* Google button */}
          <Skeleton className="h-12 w-full rounded-lg" />

          {/* Footer text */}
          <Skeleton className="mx-auto h-3 w-48 rounded-full" />
        </div>
      </div>

      {/* Right — image panel (desktop only) */}
      <div className="hidden bg-[var(--primary-dark)] lg:block lg:w-[45%]">
        <div className="flex h-full items-center justify-center p-12">
          <div className="max-w-sm space-y-4 text-center">
            <Skeleton className="mx-auto h-4 w-40 rounded-full bg-white/10" />
            <Skeleton className="mx-auto h-10 w-[80%] rounded-lg bg-white/10" />
            <Skeleton className="mx-auto h-10 w-[60%] rounded-lg bg-white/10" />
            <Skeleton className="mx-auto h-4 w-[70%] rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  );
}
