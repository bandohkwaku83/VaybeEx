"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/client";
import {
  createOrganizerTrip,
  deleteOrganizerTrip,
  getOrganizerTrip,
  listOrganizerTrips,
  patchOrganizerTripFields,
  publishOrganizerTrip,
  updateOrganizerTrip,
  type CreateTripFiles,
} from "@/lib/api/organizer-trips";
import { getOrganizerProfile } from "@/lib/organizer-profile";
import type { TripForm } from "@/lib/trip-form-utils";
import type { Trip, TripStatus } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { handleOrganizerKycError } from "@/lib/organizer-kyc";
import { useRouter } from "next/navigation";

/** @deprecated Prefer trip.organizerId from the API. Kept for legacy imports. */
export const ORGANIZER_ID = "org-1";

interface OrganizerTripsContextValue {
  trips: Trip[];
  getTrip: (id: string) => Trip | undefined;
  refreshTrips: (status?: TripStatus | "all") => Promise<void>;
  refreshTrip: (id: string) => Promise<Trip | undefined>;
  createTrip: (
    form: TripForm,
    addOns: { name: string; price: string }[],
    status: TripStatus,
    files?: CreateTripFiles
  ) => Promise<Trip>;
  updateTrip: (
    id: string,
    form: TripForm,
    addOns: { name: string; price: string }[],
    status?: TripStatus,
    files?: CreateTripFiles
  ) => Promise<Trip>;
  updateTripStatus: (
    id: string,
    status: TripStatus,
    options?: { scheduledPublishAt?: string }
  ) => Promise<void>;
  removeTrip: (id: string) => Promise<void>;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const OrganizerTripsContext = createContext<OrganizerTripsContextValue | null>(
  null
);

function contactFromSession(email?: string) {
  const profile = getOrganizerProfile();
  return {
    phone: profile.phone || undefined,
    email: email || undefined,
  };
}

export function OrganizerTripsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertTrip = useCallback((trip: Trip) => {
    setTrips((prev) => {
      const idx = prev.findIndex((t) => t.id === trip.id);
      if (idx === -1) return [trip, ...prev];
      const next = [...prev];
      next[idx] = trip;
      return next;
    });
  }, []);

  const refreshTrips = useCallback(async (status: TripStatus | "all" = "all") => {
    setError(null);
    try {
      const response = await listOrganizerTrips({
        status: status === "all" ? undefined : status,
        limit: 100,
      });
      setTrips(response.data.trips);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to load trips. Please try again.";
      setError(message);
      throw err;
    }
  }, []);

  const refreshTrip = useCallback(
    async (id: string) => {
      try {
        const response = await getOrganizerTrip(id);
        if (response.data) {
          upsertTrip(response.data);
          return response.data;
        }
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.message
            : "Unable to load trip. Please try again.";
        setError(message);
      }
      return undefined;
    },
    [upsertTrip]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        await refreshTrips();
      } catch {
        /* error already stored */
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTrips]);

  const getTrip = useCallback(
    (id: string) => trips.find((t) => t.id === id),
    [trips]
  );

  const createTrip = useCallback(
    async (
      form: TripForm,
      addOns: { name: string; price: string }[],
      status: TripStatus,
      files?: CreateTripFiles
    ) => {
      setIsSaving(true);
      setError(null);
      try {
        const response = await createOrganizerTrip({
          form,
          addOns,
          status,
          files,
          contact: contactFromSession(user?.email),
        });
        if (!response.data) {
          throw new ApiError("Trip was created but no data was returned.", 500);
        }
        upsertTrip(response.data);
        return response.data;
      } catch (err) {
        handleOrganizerKycError(err, router);
        const message =
          err instanceof ApiError
            ? err.message
            : "Unable to create trip. Please try again.";
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [upsertTrip, user?.email, router]
  );

  const updateTrip = useCallback(
    async (
      id: string,
      form: TripForm,
      addOns: { name: string; price: string }[],
      status?: TripStatus,
      files?: CreateTripFiles
    ) => {
      setIsSaving(true);
      setError(null);
      try {
        const response = await updateOrganizerTrip(id, {
          form,
          addOns,
          status,
          files,
          contact: contactFromSession(user?.email),
        });
        if (!response.data) {
          throw new ApiError("Trip was updated but no data was returned.", 500);
        }
        upsertTrip(response.data);
        return response.data;
      } catch (err) {
        handleOrganizerKycError(err, router);
        const message =
          err instanceof ApiError
            ? err.message
            : "Unable to update trip. Please try again.";
        setError(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [upsertTrip, user?.email, router]
  );

  const updateTripStatus = useCallback(
    async (
      id: string,
      status: TripStatus,
      options?: { scheduledPublishAt?: string }
    ) => {
      setIsSaving(true);
      setError(null);
      try {
        if (status === "live" || status === "draft" || status === "scheduled") {
          const trip = trips.find((t) => t.id === id);
          if (status === "scheduled") {
            const when = options?.scheduledPublishAt?.trim();
            if (!when) {
              throw new ApiError(
                "Select a publish date before scheduling this trip.",
                400
              );
            }
            const publishAt = new Date(when);
            if (Number.isNaN(publishAt.getTime())) {
              throw new ApiError("Invalid publish date.", 400);
            }
          }

          const response = await publishOrganizerTrip(id, {
            action:
              status === "live"
                ? "publish"
                : status === "scheduled"
                  ? "schedule"
                  : "draft",
            visibility: status === "draft" ? "private" : "public",
            publishConfirmed: status !== "draft",
            scheduledPublishAt:
              status === "scheduled"
                ? new Date(options!.scheduledPublishAt!).toISOString()
                : undefined,
          });
          if (response.data) upsertTrip(response.data);
          else if (trip) {
            upsertTrip({
              ...trip,
              status,
              scheduledPublishAt:
                status === "scheduled"
                  ? new Date(options!.scheduledPublishAt!).toISOString()
                  : undefined,
            });
          }
        } else {
          const response = await patchOrganizerTripFields(id, { status });
          if (response.data) upsertTrip(response.data);
          else {
            setTrips((prev) =>
              prev.map((t) => (t.id === id ? { ...t, status } : t))
            );
          }
        }
      } catch (err) {
        handleOrganizerKycError(err, router);
        const message =
          err instanceof ApiError
            ? err.message
            : "Unable to update trip status.";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [trips, upsertTrip, router]
  );

  const removeTrip = useCallback(async (id: string) => {
    setIsSaving(true);
    setError(null);
    try {
      await deleteOrganizerTrip(id);
      setTrips((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to delete trip. Please try again.";
      setError(message);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return (
    <OrganizerTripsContext.Provider
      value={{
        trips,
        getTrip,
        refreshTrips,
        refreshTrip,
        createTrip,
        updateTrip,
        updateTripStatus,
        removeTrip,
        isLoading,
        isSaving,
        error,
      }}
    >
      {children}
    </OrganizerTripsContext.Provider>
  );
}

export function useOrganizerTrips() {
  const ctx = useContext(OrganizerTripsContext);
  if (!ctx) {
    throw new Error(
      "useOrganizerTrips must be used within OrganizerTripsProvider"
    );
  }
  return ctx;
}
