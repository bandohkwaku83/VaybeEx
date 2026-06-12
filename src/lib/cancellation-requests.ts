import { getOrganizerTrips } from "@/lib/mock-data";
import type { CancellationRequest } from "@/lib/types";

const STORAGE_KEY = "trripx-cancellation-requests";

export function getCancellationRequests(): CancellationRequest[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as CancellationRequest[];
  } catch {
    /* ignore */
  }
  return [];
}

export function saveCancellationRequests(requests: CancellationRequest[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

export function getCancellationByBookingId(bookingId: string): CancellationRequest | undefined {
  return getCancellationRequests().find((r) => r.bookingId === bookingId);
}

export function getCancellationsForTrip(tripId: string): CancellationRequest[] {
  return getCancellationRequests().filter((r) => r.tripId === tripId);
}

export function getOrganizerCancellationRequests(organizerId: string): CancellationRequest[] {
  const tripIds = new Set(getOrganizerTrips(organizerId).map((t) => t.id));
  return getCancellationRequests().filter((r) => tripIds.has(r.tripId));
}

export function getPendingRefundCount(organizerId: string): number {
  return getOrganizerCancellationRequests(organizerId).filter(
    (r) => r.status === "pending" || r.status === "processing"
  ).length;
}

export function addCancellationRequest(request: CancellationRequest): void {
  const requests = getCancellationRequests();
  saveCancellationRequests([request, ...requests]);
}

export function updateCancellationRequest(
  id: string,
  updates: Partial<CancellationRequest>
): CancellationRequest | undefined {
  const requests = getCancellationRequests();
  const index = requests.findIndex((r) => r.id === id);
  if (index === -1) return undefined;

  const updated = { ...requests[index], ...updates };
  requests[index] = updated;
  saveCancellationRequests(requests);
  return updated;
}

export const CANCELLATION_STATUS_LABELS: Record<CancellationRequest["status"], string> = {
  pending: "Pending review",
  processing: "Refund processing",
  refunded: "Refunded",
  denied: "Not eligible",
};
