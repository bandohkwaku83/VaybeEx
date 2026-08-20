import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the complete-profile page: heading + form fields + button */
export default function CompleteProfileLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-full" />
          <Skeleton className="h-4 w-56 rounded-full" />
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-3 w-12 rounded-full" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>

        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}
