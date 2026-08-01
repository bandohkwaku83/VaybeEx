"use client";

import { useEffect, useState } from "react";
import { BookingFlowClient } from "./booking-flow-client";
import {
  getPublicTrip,
  organizerFromPublicTrip,
} from "@/lib/api/public-trips";
import {
  getOrganizerBrandSlug,
  getTenantTripUrl,
  getTripPublicSlug,
} from "@/lib/tenant";
import type { Trip } from "@/lib/types";

export function PublicBookByIdClient({
  id,
  isWaitlist,
}: {
  id: string;
  isWaitlist: boolean;
}) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripHref, setTripHref] = useState(`/trips/${id}`);
  const [bookBase, setBookBase] = useState(`/trips/${id}/book`);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getPublicTrip(id);
        if (cancelled) return;
        const data = res.data;
        if (!data) {
          setNotFound(true);
          return;
        }

        const org = organizerFromPublicTrip(data, res.raw);
        const brand = getOrganizerBrandSlug({
          brandSlug: data.organizerBrandSlug ?? org.brandSlug,
          businessName: data.organizerName ?? org.name,
          organizerName: data.organizerName ?? org.name,
        });
        const slug = getTripPublicSlug(data);

        // Stay on apex /trips/:id/book — don't router.push tenant absolute URLs
        // (Next strips the host and 404s on /{slug}/book).
        setTrip(data);
        setTripHref(
          data.organizerBrandSlug || (brand && brand !== "organizer")
            ? getTenantTripUrl(brand, slug)
            : `/trips/${id}`
        );
        setBookBase(`/trips/${id}/book`);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-stone-400">
        Loading…
      </div>
    );
  }

  if (notFound || !trip) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-16 pt-24 text-center sm:pt-28">
        <h1 className="text-xl font-semibold text-stone-900">Trip not found</h1>
        <p className="mt-2 text-sm text-stone-500">
          This trip may be unavailable or the link is incorrect.
        </p>
      </div>
    );
  }

  return (
    <BookingFlowClient
      trip={trip}
      isWaitlist={isWaitlist}
      tripHref={tripHref}
      bookBaseHref={bookBase}
    />
  );
}
