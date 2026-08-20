import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Organizer Profile Setup page */
export default function ProfileSetupLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      {/* Header */}
      <Skeleton className="mb-2 h-3 w-24 rounded-full" />
      <Skeleton className="h-8 w-48 rounded-lg" />
      <Skeleton className="mt-2 h-4 w-64 rounded-full" />

      {/* Profile image */}
      <div className="mt-8 flex items-center gap-5">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32 rounded-full" />
          <Skeleton className="h-3 w-40 rounded-full" />
        </div>
      </div>

      {/* Form fields */}
      <div className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20 rounded-full" />
            <Skeleton className="h-11 w-full rounded-none" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded-full" />
            <Skeleton className="h-11 w-full rounded-none" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-28 rounded-full" />
          <Skeleton className="h-11 w-full rounded-none" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-16 rounded-full" />
          <Skeleton className="h-24 w-full rounded-none" />
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <Skeleton className="h-11 w-36 rounded-none" />
      </div>
    </div>
  );
}
