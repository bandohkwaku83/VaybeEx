import type { Trip } from "@/lib/types";

/**
 * Remaining spots for travelers.
 * Prefer API `seatsAvailable`; fall back to capacity − booked when absent.
 * `null` = unlimited / open capacity.
 */
export function getSpotsLeft(trip: Trip): number | null {
  if (typeof trip.seatsAvailable === "number") {
    return Math.max(0, trip.seatsAvailable);
  }

  // Explicit null from API = unlimited
  if (trip.seatsAvailable === null) return null;

  if (trip.isUnlimitedCapacity || trip.capacity == null) return null;

  return Math.max(0, trip.capacity - trip.booked);
}

export function isUnlimitedCapacity(trip: Trip): boolean {
  if (typeof trip.seatsAvailable === "number") return false;
  return (
    trip.seatsAvailable === null ||
    trip.isUnlimitedCapacity === true ||
    trip.capacity == null
  );
}

/** Sold out only when capacity is capped and no seats remain. */
export function isTripFull(trip: Trip): boolean {
  const left = getSpotsLeft(trip);
  return left === 0;
}

/** Prefer API `isBookable`; fall back to live status for mock/legacy data. */
export function isTripBookable(trip: Trip): boolean {
  if (typeof trip.isBookable === "boolean") return trip.isBookable;
  return trip.status === "live";
}

export function formatCapacityLabel(trip: Trip): string {
  if (isUnlimitedCapacity(trip)) return "Unlimited";
  return String(trip.capacity);
}

export function formatBookedCapacity(trip: Trip): string {
  if (isUnlimitedCapacity(trip)) return `${trip.booked} booked`;
  return `${trip.booked}/${trip.capacity}`;
}

export function formatSpotsLeftLabel(trip: Trip): string {
  const left = getSpotsLeft(trip);
  if (left == null) return "Open spots";
  if (left === 0) return "Fully booked";
  return `${left} spot${left === 1 ? "" : "s"} left`;
}

export function capacityFillPercent(trip: Trip): number {
  if (isUnlimitedCapacity(trip) || !trip.capacity) return 0;
  return Math.min(100, Math.round((trip.booked / trip.capacity) * 100));
}
