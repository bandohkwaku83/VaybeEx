import { apiRequest } from "./client";
import { getTravelerToken, getOrganizerToken } from "./auth-token";
import type { CancellationRequest, CancellationStatus } from "@/lib/types";

function travelerHeaders(): HeadersInit {
  const token = getTravelerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function organizerHeaders(): HeadersInit {
  const token = getOrganizerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function asId(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (typeof value === "object" && value && "toString" in value) {
    return String((value as { toString: () => string }).toString());
  }
  return "";
}

function asDate(value: unknown): string {
  if (typeof value !== "string" || !value) return "";
  return value;
}

function mapCancellationStatus(value: unknown): CancellationStatus {
  const status = String(value ?? "").toLowerCase();
  if (
    status === "pending" ||
    status === "processing" ||
    status === "refunded" ||
    status === "denied"
  ) {
    return status;
  }
  return "pending";
}

export function mapCancellationFromApi(
  raw: Record<string, unknown>
): CancellationRequest {
  const traveler =
    raw.traveler && typeof raw.traveler === "object"
      ? (raw.traveler as Record<string, unknown>)
      : null;

  return {
    id: asId(raw.id ?? raw._id),
    bookingId: asId(raw.bookingId ?? raw.booking_id),
    tripId: asId(raw.tripId ?? raw.trip_id),
    tripTitle: String(raw.tripTitle ?? raw.trip_title ?? "Trip"),
    destination: String(raw.destination ?? ""),
    startDate: asDate(raw.startDate ?? raw.start_date).slice(0, 10),
    amountPaid: Number(raw.amountPaid ?? raw.amount_paid ?? 0) || 0,
    refundAmount: Number(raw.refundAmount ?? raw.refund_amount ?? 0) || 0,
    refundEligible: Boolean(raw.refundEligible ?? raw.refund_eligible),
    reason: String(raw.reason ?? "").trim() || undefined,
    status: mapCancellationStatus(raw.status),
    requestedAt: asDate(raw.requestedAt ?? raw.requested_at) || new Date().toISOString(),
    processedAt: asDate(raw.processedAt ?? raw.processed_at) || undefined,
    refundDestination:
      String(raw.refundDestination ?? raw.refund_destination ?? "").trim() ||
      undefined,
    paymentMethod: String(raw.paymentMethod ?? raw.payment_method ?? "").trim() || undefined,
    travelerName:
      String(raw.travelerName ?? traveler?.fullName ?? "").trim() || undefined,
    travelerEmail:
      String(raw.travelerEmail ?? traveler?.email ?? "").trim() || undefined,
    phone: String(raw.phone ?? traveler?.phone ?? "").trim() || undefined,
    organizerNote: String(raw.organizerNote ?? "").trim() || undefined,
    refundFailureReason:
      String(
        raw.refundFailureReason ?? raw.refund_failure_reason ?? ""
      ).trim() || undefined,
  };
}

export type CancellationPreview = {
  bookingId: string;
  tripId: string;
  tripTitle: string;
  destination: string;
  startDate: string;
  paymentMethod?: string;
  amountPaid: number;
  daysUntilDeparture: number;
  policy: string;
  deadlineDays: number;
  refundPercentage?: number;
  refundPolicySummary?: string;
  eligible: boolean;
  refundAmount: number;
  message: string;
};

function mapCancellationPreview(
  raw: Record<string, unknown>
): CancellationPreview {
  return {
    bookingId: asId(raw.bookingId),
    tripId: asId(raw.tripId),
    tripTitle: String(raw.tripTitle ?? "Trip"),
    destination: String(raw.destination ?? ""),
    startDate: asDate(raw.startDate).slice(0, 10),
    paymentMethod: String(raw.paymentMethod ?? "").trim() || undefined,
    amountPaid: Number(raw.amountPaid ?? 0) || 0,
    daysUntilDeparture: Number(raw.daysUntilDeparture ?? 0) || 0,
    policy: String(raw.policy ?? "none"),
    deadlineDays: Number(raw.deadlineDays ?? 0) || 0,
    refundPercentage:
      raw.refundPercentage != null ? Number(raw.refundPercentage) : undefined,
    refundPolicySummary:
      String(raw.refundPolicySummary ?? "").trim() || undefined,
    eligible: Boolean(raw.eligible),
    refundAmount: Number(raw.refundAmount ?? 0) || 0,
    message: String(raw.message ?? ""),
  };
}

/** GET /api/bookings/me/cancellations */
export async function listMyCancellations(params?: {
  status?: CancellationStatus;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  const response = await apiRequest<{
    requests?: Record<string, unknown>[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>(`/api/bookings/me/cancellations${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: travelerHeaders(),
  });

  const raw = response.data?.requests ?? [];
  return {
    ...response,
    data: {
      requests: raw.map(mapCancellationFromApi),
      pagination: response.data?.pagination ?? {
        page: 1,
        limit: 20,
        total: raw.length,
        pages: 1,
      },
    },
  };
}

/** GET /api/bookings/:id/cancellation-preview */
export async function getCancellationPreview(bookingId: string) {
  const response = await apiRequest<Record<string, unknown>>(
    `/api/bookings/${bookingId}/cancellation-preview`,
    {
      method: "GET",
      headers: travelerHeaders(),
    }
  );
  return {
    ...response,
    data: response.data ? mapCancellationPreview(response.data) : undefined,
  };
}

/** POST /api/bookings/:id/cancel */
export async function requestBookingCancellation(
  bookingId: string,
  input?: { reason?: string }
) {
  const response = await apiRequest<{
    request?: Record<string, unknown>;
    booking?: Record<string, unknown>;
    estimate?: Record<string, unknown>;
  }>(`/api/bookings/${bookingId}/cancel`, {
    method: "POST",
    headers: travelerHeaders(),
    body: JSON.stringify({ reason: input?.reason?.trim() || undefined }),
  });

  return {
    ...response,
    data: response.data
      ? {
          request: response.data.request
            ? mapCancellationFromApi(response.data.request)
            : undefined,
          estimate: response.data.estimate
            ? mapCancellationPreview({
                bookingId,
                ...response.data.estimate,
              })
            : undefined,
          booking: response.data.booking,
        }
      : undefined,
  };
}

/** GET /api/organizer/cancellations */
export async function listOrganizerCancellations(params?: {
  status?: CancellationStatus;
  tripId?: string;
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.tripId) query.set("tripId", params.tripId);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  const response = await apiRequest<{
    requests?: Record<string, unknown>[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>(`/api/organizer/cancellations${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: organizerHeaders(),
  });

  const raw = response.data?.requests ?? [];
  return {
    ...response,
    data: {
      requests: raw.map(mapCancellationFromApi),
      pagination: response.data?.pagination ?? {
        page: 1,
        limit: 50,
        total: raw.length,
        pages: 1,
      },
    },
  };
}

/** GET /api/organizer/trips/:tripId/cancellations */
export async function listTripCancellations(tripId: string) {
  const response = await apiRequest<{
    trip?: { id: string; title: string };
    requests?: Record<string, unknown>[];
  }>(`/api/organizer/trips/${tripId}/cancellations`, {
    method: "GET",
    headers: organizerHeaders(),
  });

  return {
    ...response,
    data: {
      trip: response.data?.trip,
      requests: (response.data?.requests ?? []).map(mapCancellationFromApi),
    },
  };
}

/**
 * PATCH /api/organizer/cancellations/:id
 * Approve with `refunded` — backend triggers Paystack refund (may return `processing`).
 * Deny with `denied` — no money moves. Never post `processing` from the client.
 */
export async function updateOrganizerCancellation(
  requestId: string,
  input: {
    status: "refunded" | "denied";
    organizerNote?: string;
  }
) {
  const response = await apiRequest<Record<string, unknown>>(
    `/api/organizer/cancellations/${requestId}`,
    {
      method: "PATCH",
      headers: organizerHeaders(),
      body: JSON.stringify({
        status: input.status,
        organizerNote: input.organizerNote?.trim() || undefined,
      }),
    }
  );

  return {
    ...response,
    data: response.data ? mapCancellationFromApi(response.data) : undefined,
  };
}

/** Count of pending + processing refunds for the organizer dashboard. */
export async function getPendingOrganizerRefundCount(): Promise<number> {
  try {
    const [pending, processing] = await Promise.all([
      listOrganizerCancellations({ status: "pending", limit: 1 }),
      listOrganizerCancellations({ status: "processing", limit: 1 }),
    ]);
    const pendingTotal = pending.data?.pagination?.total ?? 0;
    const processingTotal = processing.data?.pagination?.total ?? 0;
    return pendingTotal + processingTotal;
  } catch {
    return 0;
  }
}
