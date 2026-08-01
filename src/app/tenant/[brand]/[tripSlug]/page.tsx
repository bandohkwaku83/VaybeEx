import { TenantTripClient } from "./tenant-trip-client";

export default async function TenantTripPage({
  params,
}: {
  params: Promise<{ brand: string; tripSlug: string }>;
}) {
  const { brand, tripSlug } = await params;
  return <TenantTripClient brand={brand} tripSlug={tripSlug} />;
}
