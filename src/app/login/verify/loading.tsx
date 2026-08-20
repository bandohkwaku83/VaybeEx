import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching OTP verification page: icon + OTP inputs + button */
export default function VerifyLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        <Skeleton className="mx-auto h-14 w-14 rounded-full" />
        <Skeleton className="mx-auto h-6 w-48 rounded-full" />
        <Skeleton className="mx-auto h-4 w-56 rounded-full" />

        {/* OTP slots */}
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-14 w-12 rounded-lg" />
          ))}
        </div>

        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="mx-auto h-3 w-36 rounded-full" />
      </div>
    </div>
  );
}
