import { apiRequest } from "./client";
import { getOrganizerToken } from "./auth-token";

function bearerHeaders(): HeadersInit {
  const token = getOrganizerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const ORGANIZER_NOTIFICATION_TYPES = [
  "booking_created",
  "payment_received",
  "refund_requested",
  "refund_completed",
  "refund_failed",
  "withdrawal_requested",
  "withdrawal_processing",
  "withdrawal_paid",
  "withdrawal_rejected",
  "kyc_approved",
  "kyc_rejected",
  "admin_announcement",
] as const;

export type OrganizerNotificationType =
  (typeof ORGANIZER_NOTIFICATION_TYPES)[number];

export type OrganizerNotificationData = {
  ctaUrl?: string;
  ctaLabel?: string;
  tripId?: string;
  bookingId?: string;
  cancellationId?: string;
  withdrawalId?: string;
  reference?: string;
  [key: string]: unknown;
};

export type OrganizerNotification = {
  id: string;
  type: OrganizerNotificationType | string;
  title: string;
  body: string;
  data?: OrganizerNotificationData;
  read: boolean;
  readAt?: string | null;
  createdAt: string;
};

export type ListOrganizerNotificationsParams = {
  unread?: boolean;
  type?: OrganizerNotificationType | string;
  page?: number;
  limit?: number;
};

export type ListOrganizerNotificationsResult = {
  notifications: OrganizerNotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function mapNotification(raw: unknown): OrganizerNotification | null {
  const r = asRecord(raw);
  const id = asString(r.id);
  if (!id) return null;
  const dataRaw = asRecord(r.data);
  const data: OrganizerNotificationData | undefined = Object.keys(dataRaw)
    .length
    ? {
        ctaUrl: asString(dataRaw.ctaUrl) || undefined,
        ctaLabel: asString(dataRaw.ctaLabel) || undefined,
        tripId: asString(dataRaw.tripId) || undefined,
        bookingId: asString(dataRaw.bookingId) || undefined,
        cancellationId: asString(dataRaw.cancellationId) || undefined,
        withdrawalId: asString(dataRaw.withdrawalId) || undefined,
        reference: asString(dataRaw.reference) || undefined,
        ...dataRaw,
      }
    : undefined;

  return {
    id,
    type: asString(r.type, "admin_announcement"),
    title: asString(r.title, "Notification"),
    body: asString(r.body),
    data,
    read: Boolean(r.read ?? r.readAt),
    readAt: r.readAt ? asString(r.readAt) : null,
    createdAt: asString(r.createdAt, new Date().toISOString()),
  };
}

/** Only in-app organizer paths — ignore absolute / protocol-relative URLs. */
export function organizerNotificationHref(
  notification: Pick<OrganizerNotification, "type" | "data">
): string {
  const raw = notification.data?.ctaUrl?.trim() ?? "";
  if (raw.startsWith("/organizer") && !raw.startsWith("//")) {
    if (raw === "/organizer" || raw === "/organizer/") {
      const tripId = notification.data?.tripId;
      return tripId
        ? `/organizer/trips/${encodeURIComponent(tripId)}`
        : "/organizer/dashboard";
    }
    return raw;
  }

  switch (notification.type) {
    case "refund_requested":
    case "refund_completed":
    case "refund_failed":
      return "/organizer/refunds";
    case "withdrawal_requested":
    case "withdrawal_processing":
    case "withdrawal_paid":
    case "withdrawal_rejected":
      return "/organizer/payouts";
    case "kyc_rejected":
      return "/organizer/profile/setup";
    case "booking_created":
    case "payment_received": {
      const tripId = notification.data?.tripId;
      return tripId
        ? `/organizer/trips/${encodeURIComponent(tripId)}`
        : "/organizer/dashboard";
    }
    default:
      return "/organizer/dashboard";
  }
}

export async function listOrganizerNotifications(
  params: ListOrganizerNotificationsParams = {}
) {
  const search = new URLSearchParams();
  if (params.unread) search.set("unread", "true");
  if (params.type) search.set("type", params.type);
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  const qs = search.toString();

  const res = await apiRequest<Record<string, unknown>>(
    `/api/organizer/notifications${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: bearerHeaders() }
  );

  const raw = asRecord(res.data);
  const items = Array.isArray(raw.notifications) ? raw.notifications : [];
  const pagination = asRecord(raw.pagination);

  const data: ListOrganizerNotificationsResult = {
    notifications: items
      .map(mapNotification)
      .filter((row): row is OrganizerNotification => Boolean(row)),
    unreadCount: asNumber(raw.unreadCount),
    pagination: {
      page: asNumber(pagination.page, 1),
      limit: asNumber(pagination.limit, 20),
      total: asNumber(pagination.total),
      pages: asNumber(pagination.pages, 1),
    },
  };

  return { ...res, data };
}

export async function getOrganizerUnreadCount() {
  const res = await apiRequest<{ unreadCount?: number }>(
    "/api/organizer/notifications/unread-count",
    { method: "GET", headers: bearerHeaders() }
  );
  return asNumber(res.data?.unreadCount);
}

export async function getOrganizerNotification(id: string) {
  const res = await apiRequest<Record<string, unknown>>(
    `/api/organizer/notifications/${encodeURIComponent(id)}`,
    { method: "GET", headers: bearerHeaders() }
  );
  const notification = mapNotification(asRecord(res.data).notification);
  return { ...res, data: { notification } };
}

export async function markOrganizerNotificationRead(id: string) {
  const res = await apiRequest<Record<string, unknown>>(
    `/api/organizer/notifications/${encodeURIComponent(id)}/read`,
    { method: "PATCH", headers: bearerHeaders() }
  );
  const notification = mapNotification(asRecord(res.data).notification);
  return { ...res, data: { notification } };
}

export async function markAllOrganizerNotificationsRead() {
  const res = await apiRequest<{ updated?: number; unreadCount?: number }>(
    "/api/organizer/notifications/read-all",
    { method: "POST", headers: bearerHeaders() }
  );
  return {
    ...res,
    data: {
      updated: asNumber(res.data?.updated),
      unreadCount: asNumber(res.data?.unreadCount),
    },
  };
}
