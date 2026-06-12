import { notFound } from "next/navigation";
import { BookingFlowClient } from "./booking-flow-client";
import { getTripById } from "@/lib/mock-data";

export default async function BookTripPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ waitlist?: string }>;
}) {
  const { id } = await params;
  const { waitlist } = await searchParams;
  const trip = getTripById(id);
  if (!trip) notFound();

  return <BookingFlowClient trip={trip} isWaitlist={waitlist === "true"} />;
}
