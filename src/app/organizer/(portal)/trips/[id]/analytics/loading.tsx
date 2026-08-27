import { Skeleton } from "@/components/ui/skeleton";

/** Minimal skeleton — this page redirects to the trip detail page */
export default function TripAnalyticsLoading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" style={{ background: "#f5f5f5" }}>
      <Skeleton className="h-6 w-40 rounded-full" />
    </div>
  );
}
