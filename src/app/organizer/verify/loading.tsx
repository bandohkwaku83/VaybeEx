import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching the Organizer email verification page */
export default function VerifyLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-5">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-6 w-48 rounded-full" />
        <Skeleton className="mx-auto h-4 w-56 rounded-full" />

        {/* OTP inputs */}
        <div className="flex justify-center gap-3 pt-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-12 w-11 rounded-lg" />
          ))}
        </div>

        <Skeleton className="mx-auto h-11 w-full rounded-none pt-2" />
        <Skeleton className="mx-auto h-4 w-40 rounded-full" />
      </div>
    </div>
  );
}
