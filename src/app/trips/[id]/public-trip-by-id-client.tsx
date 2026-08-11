"use client";

import { useEffect, useState } from "react";
import { TripDetailClient } from "@/app/trips/[id]/trip-detail-client";
import {
  getPublicTrip,
  organizerFromPublicTrip,
} from "@/lib/api/public-trips";
import type { Organizer, Trip } from "@/lib/types";

/**
 * Apex `/trips/:id` detail — render in place.
 * Do not hard-redirect to the tenant host: that crosses origins, drops
 * per-host localStorage, and was signing travelers out mid-browse.
 */
export function PublicTripByIdClient({ id }: { id: string }) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
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

        setTrip(data);
        setOrganizer(organizerFromPublicTrip(data, res.raw));
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
      <div
        className="flex min-h-[40vh] items-center justify-center text-sm"
        style={{ color: "var(--text-tertiary)" }}
      >
        Loading trip…
      </div>
    );
  }

  if (notFound || !trip || !organizer) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1
          className="font-display text-2xl font-semibold"
          style={{ color: "var(--text)" }}
        >
          Trip not found
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
          This trip may have been removed or isn&apos;t public yet.
        </p>
      </div>
    );
  }

  return <TripDetailClient trip={trip} organizer={organizer} />;
}
