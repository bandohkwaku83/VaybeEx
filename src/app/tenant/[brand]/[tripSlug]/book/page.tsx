import { TenantBookClient } from "./tenant-book-client";

export default async function TenantBookTripPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string; tripSlug: string }>;
  searchParams: Promise<{ waitlist?: string }>;
}) {
  const { brand, tripSlug } = await params;
  const { waitlist } = await searchParams;

  return (
    <TenantBookClient
      brand={brand}
      tripSlug={tripSlug}
      isWaitlist={waitlist === "true"}
    />
  );
}
