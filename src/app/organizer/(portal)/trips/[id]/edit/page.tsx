"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TripFormEditor } from "@/components/organizer/trip-form-editor";
import { useOrganizerTrips } from "@/hooks/use-organizer-trips";
import {
  STATUS_MESSAGES,
  buildTripUpdates,
  tripToAddOns,
  tripToForm,
} from "@/lib/trip-form-utils";
import type { TripStatus } from "@/lib/types";
import type { TripForm } from "@/lib/trip-form-utils";

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { getTrip, updateTrip, isLoading } = useOrganizerTrips();
  const trip = getTrip(id);

  if (isLoading) {
    return <p className="p-8 text-stone-500">Loading trip...</p>;
  }

  if (!trip) {
    return <p className="p-8 text-stone-500">Trip not found.</p>;
  }

  const handleSave = (
    form: TripForm,
    addOns: { name: string; price: string }[],
    status: TripStatus
  ) => {
    updateTrip(id, buildTripUpdates(form, addOns, trip, status));
    toast.success(STATUS_MESSAGES[status] ?? "Trip updated");
    router.push(`/organizer/trips/${id}`);
  };

  return (
    <TripFormEditor
      mode="edit"
      heading="Edit Trip"
      subheading="Update your trip details, pricing, and policies. Changes are saved to your trip listing."
      initialForm={tripToForm(trip)}
      initialAddOns={tripToAddOns(trip)}
      onBack={() => router.push(`/organizer/trips/${id}`)}
      onSave={handleSave}
    />
  );
}
