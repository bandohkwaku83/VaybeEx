import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Organizer Login page — split layout */
export default function OrganizerLoginLoading() {
  return (
    <div className="flex min-h-screen">
      {/* Left form panel */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-sm space-y-6">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-4 w-56 rounded-full" />

          <div className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-16 rounded-full" />
              <Skeleton className="h-11 w-full rounded-none" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-20 rounded-full" />
              <Skeleton className="h-11 w-full rounded-none" />
            </div>
          </div>

          <Skeleton className="h-11 w-full rounded-none" />
          <Skeleton className="h-11 w-full rounded-none" />

          <div className="pt-2 text-center">
            <Skeleton className="mx-auto h-4 w-48 rounded-full" />
          </div>
        </div>
      </div>

      {/* Right image panel */}
      <div className="hidden w-1/2 bg-[var(--bg-secondary)] lg:block" />
    </div>
  );
}
