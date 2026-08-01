import { PublicTripByIdClient } from "./public-trip-by-id-client";

/** Legacy ID URL — loads from public API, redirects to tenant URL when possible. */
export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicTripByIdClient id={id} />;
}
