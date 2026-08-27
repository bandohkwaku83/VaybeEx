import type { Metadata } from "next";
import { TenantTripClient } from "./tenant-trip-client";
import { getPublicTripByBrand } from "@/lib/api/public-trips";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ brand: string; tripSlug: string }>;
}): Promise<Metadata> {
  const { brand, tripSlug } = await params;
  try {
    const res = await getPublicTripByBrand(brand, tripSlug);
    const trip = res.data?.trip;
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

export default async function TenantTripPage({
  params,
}: {
  params: Promise<{ brand: string; tripSlug: string }>;
}) {
  const { brand, tripSlug } = await params;
  return <TenantTripClient brand={brand} tripSlug={tripSlug} />;
}
