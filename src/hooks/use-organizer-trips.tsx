"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { getOrganizerTrips } from "@/lib/mock-data";
import type { Trip, TripStatus } from "@/lib/types";

const STORAGE_KEY = "trripx-organizer-trips";
export const ORGANIZER_ID = "org-1";

function seedTrips(): Trip[] {
  return getOrganizerTrips(ORGANIZER_ID);
}

function loadTrips(): Trip[] {
  if (typeof window === "undefined") return seedTrips();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Trip[];
  } catch {
    /* ignore */
  }
  return seedTrips();
}

function persistTrips(next: Trip[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

interface OrganizerTripsContextValue {
  trips: Trip[];
  getTrip: (id: string) => Trip | undefined;
  createTrip: (trip: Omit<Trip, "id">) => Trip;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  updateTripStatus: (id: string, status: TripStatus) => void;
  isLoading: boolean;
}

const OrganizerTripsContext = createContext<OrganizerTripsContextValue | null>(null);

export function OrganizerTripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTrips(loadTrips());
    setIsLoading(false);
  }, []);

  const getTrip = useCallback((id: string) => trips.find((t) => t.id === id), [trips]);

  const createTrip = useCallback((trip: Omit<Trip, "id">) => {
    const newTrip: Trip = { ...trip, id: `trip-${Date.now()}` };
    setTrips((prev) => {
      const next = [...prev, newTrip];
      persistTrips(next);
      return next;
    });
    return newTrip;
  }, []);

  const updateTrip = useCallback((id: string, updates: Partial<Trip>) => {
    setTrips((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      persistTrips(next);
      return next;
    });
  }, []);

  const updateTripStatus = useCallback(
    (id: string, status: TripStatus) => {
      updateTrip(id, { status });
    },
    [updateTrip]
  );

  return (
    <OrganizerTripsContext.Provider
      value={{ trips, getTrip, createTrip, updateTrip, updateTripStatus, isLoading }}
    >
      {children}
    </OrganizerTripsContext.Provider>
  );
}

export function useOrganizerTrips() {
  const ctx = useContext(OrganizerTripsContext);
  if (!ctx) {
    throw new Error("useOrganizerTrips must be used within OrganizerTripsProvider");
  }
  return ctx;
}
