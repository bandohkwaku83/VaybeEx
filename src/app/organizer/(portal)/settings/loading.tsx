import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Organizer Settings page */
export default function SettingsLoading() {
  return (
    <div className="w-full p-6 lg:p-8" style={{ background: "#f5f5f5" }}>
      {/* Header */}
      <Skeleton className="mb-2 h-7 w-36 rounded-full" />
      <Skeleton className="mb-6 h-4 w-52 rounded-full" />

      {/* Tab bar */}
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-full" />
        <Skeleton className="h-10 w-20 rounded-full" />
      </div>

      {/* Profile form */}
      <div className="space-y-6">
        {/* Profile image */}
        <div className="flex items-center gap-5">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-3 w-48 rounded-full" />
          </div>
        </div>

        {/* Form fields — two columns */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-24 rounded-full" />
            <Skeleton className="h-11 w-full rounded-none" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-20 rounded-full" />
            <Skeleton className="h-11 w-full rounded-none" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-28 rounded-full" />
            <Skeleton className="h-11 w-full rounded-none" />
          </div>
          <div className="space-y-1.5">
            <Skeleton className="h-3.5 w-16 rounded-full" />
            <Skeleton className="h-11 w-full rounded-none" />
          </div>
        </div>

        {/* Bio textarea */}
        <div className="space-y-1.5">
          <Skeleton className="h-3.5 w-12 rounded-full" />
          <Skeleton className="h-24 w-full rounded-none" />
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <Skeleton className="h-11 w-32 rounded-none" />
        </div>
      </div>
    </div>
  );
}
