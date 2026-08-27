import type { Metadata } from "next";
import { PublicTripByIdClient } from "./public-trip-by-id-client";
import { getPublicTrip } from "@/lib/api/public-trips";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const res = await getPublicTrip(id);
    const trip = res.data;
    if (!trip) {
      return { title: "Trip Not Found" };
    }
    return {
      title: `${trip.title} — Book on VaybeEx`,
      description: `${trip.title} in ${trip.destination}. ${trip.description ?? "Browse details, pricing, and available seats on VaybeEx."}`,
      openGraph: {
        title: `${trip.title} — VaybeEx`,
        description: `${trip.title} in ${trip.destination}. Book your seat on VaybeEx.`,
        images: trip.image ? [{ url: trip.image, width: 1200, height: 630, alt: trip.title }] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: `${trip.title} — VaybeEx`,
        description: `${trip.title} in ${trip.destination}.`,
        images: trip.image ? [trip.image] : undefined,
      },
    };
  } catch {
    return { title: "Trip — VaybeEx" };
  }
}

/** Legacy ID URL — loads from public API, redirects to tenant URL when possible. */
export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicTripByIdClient id={id} />;
}
