"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { TripFormEditor } from "@/components/organizer/trip-form-editor";
import { useOrganizerTrips } from "@/hooks/use-organizer-trips";
import { ApiError } from "@/lib/api/client";
import type { CreateTripFiles } from "@/lib/api/organizer-trips";
import {
  STATUS_MESSAGES,
  tripToAddOns,
  tripToForm,
} from "@/lib/trip-form-utils";
import type { TripStatus } from "@/lib/types";
import type { TripForm } from "@/lib/trip-form-utils";
import { useAuth } from "@/hooks/use-auth";
import {
  handleOrganizerKycError,
  kycFromAuthUser,
  organizerCannotPublishReason,
} from "@/lib/organizer-kyc";

export default function EditTripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const kyc = kycFromAuthUser(user);
  const { getTrip, updateTrip, refreshTrip, isLoading, isSaving } =
    useOrganizerTrips();
  const trip = getTrip(id);

  useEffect(() => {
    if (!isLoading && !trip) {
      void refreshTrip(id);
    }
  }, [id, isLoading, trip, refreshTrip]);

  if (isLoading) {
    return <p className="p-8 text-stone-500">Loading trip...</p>;
  }

  if (!trip) {
    return <p className="p-8 text-stone-500">Trip not found.</p>;
  }

  const handleSave = async (
    form: TripForm,
    addOns: { name: string; price: string }[],
    status: TripStatus,
    files: CreateTripFiles
  ) => {
    try {
      await updateTrip(id, form, addOns, status, files);
      toast.success(STATUS_MESSAGES[status] ?? "Trip updated");
      router.push(`/organizer/trips/${id}`);
    } catch (error) {
      if (handleOrganizerKycError(error, router)) {
        toast.error(
          error instanceof ApiError
            ? error.message
            : organizerCannotPublishReason(kyc)
        );
        return;
      }
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Unable to update trip. Please try again."
      );
    }
  };

  return (
    <TripFormEditor
      mode="edit"
      heading="Edit Trip"
      subheading="Update your trip details, pricing, and policies. Changes are saved to your trip listing."
      initialForm={tripToForm(trip)}
      initialAddOns={tripToAddOns(trip)}
      isSaving={isSaving}
      onBack={() => router.push(`/organizer/trips/${id}`)}
      onSave={handleSave}
      canPublish={kyc.canPublish}
      publishBlockedReason={organizerCannotPublishReason(kyc)}
    />
  );
}
