import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton matching booking confirmation: success icon + trip summary + receipt */
export default function BookingConfirmLoading() {
  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-lg px-4 py-16 sm:px-6 sm:py-24">
        <div className="space-y-6 text-center">
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto h-8 w-56 rounded-full" />
          <Skeleton className="mx-auto h-4 w-72 rounded-full" />
        </div>

        <div className="mt-8 space-y-4 rounded-2xl border border-border bg-surface p-6">
          <Skeleton className="h-5 w-32 rounded-full" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between">
              <Skeleton className="h-3 w-28 rounded-full" />
              <Skeleton className="h-3 w-20 rounded-full" />
            </div>
          ))}
          <div className="border-t border-border pt-3">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-24 rounded-full" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Skeleton className="h-12 flex-1 rounded-lg" />
          <Skeleton className="h-12 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
