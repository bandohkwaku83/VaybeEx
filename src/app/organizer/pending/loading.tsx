import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Organizer Pending / review page */
export default function PendingLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-md text-center space-y-5">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-7 w-48 rounded-full" />
        <Skeleton className="mx-auto h-4 w-64 rounded-full" />
        <Skeleton className="mx-auto h-4 w-56 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-11 w-40 rounded-none" />
      </div>
    </div>
  );
}
