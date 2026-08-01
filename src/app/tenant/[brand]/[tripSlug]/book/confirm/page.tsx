"use client";

import { Suspense, use, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BookingConfirmReceipt } from "@/components/booking/booking-confirm-receipt";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import {
  extractBookingReceiptDetails,
  listMyBookings,
  mapBookingFromApi,
  verifyBookingPayment,
  type BookingReceiptDetails,
} from "@/lib/api/bookings";
import { getPublicTripByBrand } from "@/lib/api/public-trips";
import {
  getOrganizerBrandSlug,
  getRootDomain,
  getTenantTripUrl,
  getTripPublicSlug,
  resolveTenantTripClient,
} from "@/lib/tenant";
import type { Booking, Organizer, Trip } from "@/lib/types";

function ConfirmContent({
  brand,
  tripSlug,
  waitlist,
  reference,
}: {
  brand: string;
  tripSlug: string;
  waitlist: boolean;
  reference: string | null;
}) {
  const [resolved, setResolved] = useState<{
    trip: Trip;
    organizer: Organizer;
  } | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [details, setDetails] = useState<BookingReceiptDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      let tripData: { trip: Trip; organizer: Organizer } | null = null;

      try {
        const res = await getPublicTripByBrand(brand, tripSlug);
        if (!cancelled && res.data) tripData = res.data;
      } catch (err) {
        if (!(err instanceof ApiError && err.status === 404)) {
          /* try fallback */
        }
      }

      if (!tripData) {
        tripData = resolveTenantTripClient(brand, tripSlug);
      }

      if (cancelled) return;
      setResolved(tripData);

      if (reference && !waitlist) {
        try {
          const res = await verifyBookingPayment({ reference });
          if (!cancelled && res.data) {
            const raw = res.data as unknown as Record<string, unknown>;
            setBooking(mapBookingFromApi(raw));
            setDetails(extractBookingReceiptDetails(raw));
          }
        } catch {
          try {
            const list = await listMyBookings({
              status: "upcoming",
              limit: 20,
            });
            if (!cancelled && tripData) {
              const match = list.data?.bookings.find(
                (b) =>
                  b.tripId === tripData!.trip.id ||
                  b.tripTitle === tripData!.trip.title
              );
              if (match) setBooking(match);
            }
          } catch {
            /* ignore */
          }
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [brand, tripSlug, reference, waitlist]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--primary)" }}
        />
      </div>
    );
  }

  if (!resolved) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-16 pt-24 text-center sm:pt-28">
        <h1
          className="font-display text-xl font-semibold"
          style={{ color: "var(--text)" }}
        >
          Trip not found
        </h1>
        <Button
          className="mt-6 h-11 font-semibold"
          style={{ background: "var(--primary)", color: "#fbf7f1" }}
          asChild
        >
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  const { trip, organizer } = resolved;
  const tripHref = getTenantTripUrl(
    getOrganizerBrandSlug({
      brandSlug: organizer.brandSlug ?? trip.organizerBrandSlug,
      organizerName: organizer.name ?? trip.organizerName,
    }),
    getTripPublicSlug(trip)
  );
  const apex = `http://${getRootDomain()}`;

  const title =
    booking?.tripTitle?.trim() || trip.title?.trim() || "Your trip";
  const total =
    details?.totalAmount || booking?.amount || trip.price || 0;

  return (
    <BookingConfirmReceipt
      waitlist={waitlist}
      title={title}
      destination={booking?.destination || trip.destination}
      image={booking?.image || trip.image || trip.images?.[0]}
      startDate={booking?.startDate || trip.startDate}
      endDate={booking?.endDate || trip.endDate}
      total={total}
      travelers={
        details?.partySize || booking?.travelers || details?.guests.length
      }
      reference={reference ?? details?.reference ?? booking?.id ?? null}
      dashboardHref={`${apex}/dashboard`}
      tripHref={tripHref}
      dashboardAsExternal
      organizerName={organizer.name || trip.organizerName}
      meetingPoint={trip.meetingPoint}
      durationDays={trip.durationDays}
      details={details}
    />
  );
}

export default function TenantBookingConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string; tripSlug: string }>;
  searchParams: Promise<{ waitlist?: string; reference?: string }>;
}) {
  const { brand, tripSlug } = use(params);
  const sp = use(searchParams);

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: "var(--primary)" }}
          />
        </div>
      }
    >
      <ConfirmContent
        brand={brand}
        tripSlug={tripSlug}
        waitlist={sp.waitlist === "true"}
        reference={sp.reference ?? null}
      />
    </Suspense>
  );
}
