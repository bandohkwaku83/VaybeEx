"use client";

import { Suspense, use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BookingConfirmReceipt } from "@/components/booking/booking-confirm-receipt";
import { ApiError } from "@/lib/api/client";
import {
  extractBookingReceiptDetails,
  listMyBookings,
  mapBookingFromApi,
  verifyBookingPayment,
  type BookingReceiptDetails,
} from "@/lib/api/bookings";
import { getPublicTrip, organizerFromPublicTrip } from "@/lib/api/public-trips";
import {
  getOrganizerBrandSlug,
  getTenantTripUrl,
  getTripPublicSlug,
} from "@/lib/tenant";
import type { Booking, Trip } from "@/lib/types";

function ConfirmInner({
  tripId,
  waitlist,
  reference,
}: {
  tripId: string;
  waitlist: boolean;
  reference: string | null;
}) {
  const router = useRouter();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [details, setDetails] = useState<BookingReceiptDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getPublicTrip(tripId);
        if (cancelled) return;
        const data = res.data;
        if (data) {
          const org = organizerFromPublicTrip(data, res.raw);
          const brand = getOrganizerBrandSlug({
            brandSlug: data.organizerBrandSlug ?? org.brandSlug,
            organizerName: data.organizerName ?? org.name,
          });
          if (!reference && !waitlist && brand && brand !== "organizer") {
            const qs = waitlist ? "?waitlist=true" : "";
            router.replace(
              getTenantTripUrl(
                brand,
                getTripPublicSlug(data),
                `/book/confirm${qs}`
              )
            );
            return;
          }
          setTrip(data);
        }
      } catch {
        /* continue without trip */
      }

      if (reference) {
        try {
          const res = await verifyBookingPayment({ reference });
          if (!cancelled && res.data) {
            const raw = res.data as unknown as Record<string, unknown>;
            setBooking(mapBookingFromApi(raw));
            setDetails(extractBookingReceiptDetails(raw));
          }
        } catch {
          try {
            const list = await listMyBookings({ status: "upcoming", limit: 20 });
            if (!cancelled) {
              const match = list.data?.bookings.find((b) => b.tripId === tripId);
              if (match) setBooking(match);
            }
          } catch (err) {
            if (!(err instanceof ApiError)) {
              /* ignore */
            }
          }
        }
      }

      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [tripId, reference, waitlist, router]);

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

  const title =
    booking?.tripTitle?.trim() ||
    trip?.title?.trim() ||
    "Your trip";
  const total =
    details?.totalAmount ||
    booking?.amount ||
    trip?.price ||
    0;
  const start = booking?.startDate || trip?.startDate || "";
  const end = booking?.endDate || trip?.endDate || "";
  const destination = booking?.destination || trip?.destination || "";
  const image = booking?.image || trip?.image || trip?.images?.[0];
  const travelers =
    details?.partySize || booking?.travelers || details?.guests.length;
  const tripHref =
    trip &&
    (() => {
      const brand = getOrganizerBrandSlug({
        brandSlug: trip.organizerBrandSlug,
        organizerName: trip.organizerName,
      });
      if (brand && brand !== "organizer") {
        return getTenantTripUrl(brand, getTripPublicSlug(trip));
      }
      return `/trips/${tripId}`;
    })() ||
    `/trips/${tripId}`;

  return (
    <BookingConfirmReceipt
      waitlist={waitlist}
      title={title}
      destination={destination}
      image={image}
      startDate={start}
      endDate={end}
      total={total}
      travelers={travelers}
      reference={
        reference ?? details?.reference ?? booking?.id ?? null
      }
      dashboardHref="/dashboard"
      tripHref={tripHref}
      organizerName={trip?.organizerName}
      meetingPoint={trip?.meetingPoint}
      durationDays={trip?.durationDays}
      details={details}
    />
  );
}

export default function BookingConfirmPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ waitlist?: string; reference?: string }>;
}) {
  const { id } = use(params);
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
      <ConfirmInner
        tripId={id}
        waitlist={sp.waitlist === "true"}
        reference={sp.reference ?? null}
      />
    </Suspense>
  );
}
