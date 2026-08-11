"use client";

import { useEffect, useState } from "react";
import { TripDetailClient } from "@/app/trips/[id]/trip-detail-client";
import { ApiError } from "@/lib/api/client";
import {
  getPublicTripByBrand,
  organizerFromPublicTrip,
} from "@/lib/api/public-trips";
import { resolveTenantTripClient } from "@/lib/tenant";
import type { Organizer, Trip } from "@/lib/types";

export function TenantTripClient({
  brand,
  tripSlug,
}: {
  brand: string;
  tripSlug: string;
}) {
  const [resolved, setResolved] = useState<{
    trip: Trip;
    organizer: Organizer;
  } | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setReady(false);
      setError(null);
      try {
        const res = await getPublicTripByBrand(brand, tripSlug);
        if (cancelled) return;
        if (res.data) {
          setResolved(res.data);
          setReady(true);
          return;
        }
      } catch (err) {
        if (cancelled) return;
        // Fall through to local/mock resolver for draft previews
        if (!(err instanceof ApiError && err.status === 404)) {
          setError(
            err instanceof Error ? err.message : "Unable to load this trip."
          );
        }
      }

      const fallback = resolveTenantTripClient(brand, tripSlug);
      if (!cancelled) {
        setResolved(fallback);
        setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [brand, tripSlug]);

  if (!ready) {
    return (
      <div
        className="flex min-h-[40vh] items-center justify-center text-sm"
        style={{ color: "var(--text-tertiary)" }}
      >
        Loading trip…
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1
          className="font-display text-2xl font-semibold"
          style={{ color: "var(--text)" }}
        >
          Trip not found
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          {error ??
            "This link may be incorrect, or the trip isn't published yet."}
        </p>
      </div>
    );
  }

  return (
    <TripDetailClient
      trip={resolved.trip}
      organizer={
        resolved.organizer.name
          ? resolved.organizer
          : organizerFromPublicTrip(resolved.trip, undefined, brand)
      }
    />
  );
}
