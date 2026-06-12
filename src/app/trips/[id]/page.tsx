import { notFound } from "next/navigation";
import { TripDetailClient } from "./trip-detail-client";
import { getTripById, getOrganizerById } from "@/lib/mock-data";

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = getTripById(id);
  if (!trip) notFound();

  const organizer = getOrganizerById(trip.organizerId);
  if (!organizer) notFound();

  return <TripDetailClient trip={trip} organizer={organizer} />;
}
