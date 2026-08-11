import { PublicBookByIdClient } from "./public-book-by-id-client";

export default async function BookTripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ waitlist?: string }>;
}) {
  const { id } = await params;
  const { waitlist } = await searchParams;
  return (
    <PublicBookByIdClient id={id} isWaitlist={waitlist === "true"} />
  );
}
