"use client";

import { useEffect, useState } from "react";
import { BookingFlowClient } from "@/app/trips/[id]/book/booking-flow-client";
import { ApiError } from "@/lib/api/client";
import { getPublicTripByBrand } from "@/lib/api/public-trips";
import {
  getOrganizerBrandSlug,
  getTenantTripUrl,
  getTripPublicSlug,
  resolveTenantTripClient,
} from "@/lib/tenant";
import type { Organizer, Trip } from "@/lib/types";

export function TenantBookClient({
  brand,
  tripSlug,
  isWaitlist,
}: {
  brand: string;
  tripSlug: string;
  isWaitlist: boolean;
}) {
  const [resolved, setResolved] = useState<{
    trip: Trip;
    organizer: Organizer;
  } | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setReady(false);
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
        if (!(err instanceof ApiError && err.status === 404)) {
          /* try fallback below */
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
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-stone-400">
        Loading…
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-16 pt-24 text-center sm:pt-28">
        <h1 className="text-xl font-semibold text-stone-900">Trip not found</h1>
        <p className="mt-2 text-sm text-stone-500">
          This trip may be a draft, cancelled, or the link is incorrect.
        </p>
      </div>
    );
  }

  const brandName = getOrganizerBrandSlug({
    brandSlug: resolved.organizer.brandSlug ?? resolved.trip.organizerBrandSlug,
    organizerName: resolved.organizer.name ?? resolved.trip.organizerName,
  });
  const slug = getTripPublicSlug(resolved.trip);
  const tripHref = getTenantTripUrl(brandName, slug);
  const bookBase = getTenantTripUrl(brandName, slug, "/book");

  return (
    <BookingFlowClient
      trip={resolved.trip}
      isWaitlist={isWaitlist}
      tripHref={tripHref}
      bookBaseHref={bookBase}
    />
  );
}
