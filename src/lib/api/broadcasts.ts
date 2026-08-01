import { apiRequest } from "./client";
import { getOrganizerToken } from "./auth-token";

function bearerHeaders(extra?: HeadersInit): HeadersInit {
  const token = getOrganizerToken();
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

export type AudienceMode = "everyone" | "filter" | "specific";
export type PaymentFilter = "paid" | "unpaid";
export type BroadcastStatus = "sent" | "pending" | "failed";
export type BroadcastChannel = "sms";
export type SmsEncoding = "GSM-7" | "Unicode";
export type DeliveryStatus = "queued" | "sent" | "failed" | "skipped";

export type AudiencePayload =
  | { mode: "everyone" }
  | { mode: "filter"; filter: PaymentFilter }
  | { mode: "specific"; attendeeIds: string[] };

export type AudienceRecipient = {
  id: string;
  name: string;
  phone: string | null;
  paymentStatus: "paid" | "partial" | "pending" | string;
  hasValidPhone: boolean;
};

export type AudienceCounts = {
  total: number;
  paid: number;
  unpaid: number;
  withPhone: number;
  selected: number;
  sendable: number;
  skipped: number;
};

export type BroadcastAudience = {
  recipients: AudienceRecipient[];
  counts: AudienceCounts;
  audienceLabel: string;
};

export type BroadcastEstimate = {
  recipientCount: number;
  skippedCount: number;
  segments: number;
  encoding: SmsEncoding;
  costPerSegmentGhs: number;
  estimatedCostGhs: number;
  audienceLabel: string;
  counts: AudienceCounts;
};

export type DeliveryStats = {
  total: number;
  queued?: number;
  sent: number;
  failed: number;
  skipped: number;
};

export type BroadcastRecord = {
  id: string;
  date: string;
  tripId?: string;
  tripTitle: string;
  preview: string;
  snippet: string;
  messageBody: string;
  recipients: number;
  status: BroadcastStatus;
  audience: string;
  channel: BroadcastChannel;
  estimatedCostGhs: number;
  actualCostGhs?: number;
  audienceMode?: AudienceMode;
  audienceFilter?: PaymentFilter | null;
  encoding?: SmsEncoding;
  segmentsPerMessage?: number;
  deliveryStats?: DeliveryStats;
  sentAt?: string | null;
  completedAt?: string | null;
  errorMessage?: string | null;
};

export type BroadcastDelivery = {
  id: string;
  bookingId: string;
  recipientName: string;
  phone: string | null;
  status: DeliveryStatus;
  skipReason?: string | null;
  errorMessage?: string | null;
  sentAt?: string | null;
};

export type BroadcastListResult = {
  broadcasts: BroadcastRecord[];
  summary: {
    sentCount: number;
    tripAttendeeCount?: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type BroadcastDetailResult = {
  broadcast: BroadcastRecord;
  deliveries: BroadcastDelivery[];
};

export type CreateBroadcastResult = {
  broadcast: BroadcastRecord;
  reused: boolean;
};

function asNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return value == null ? fallback : String(value);
}

function mapCounts(raw: Record<string, unknown> | undefined): AudienceCounts {
  return {
    total: asNumber(raw?.total),
    paid: asNumber(raw?.paid),
    unpaid: asNumber(raw?.unpaid),
    withPhone: asNumber(raw?.withPhone),
    selected: asNumber(raw?.selected),
    sendable: asNumber(raw?.sendable),
    skipped: asNumber(raw?.skipped),
  };
}

function mapRecipient(raw: Record<string, unknown>): AudienceRecipient {
  const phoneRaw = raw.phone;
  const phone =
    phoneRaw == null || String(phoneRaw).trim() === ""
      ? null
      : String(phoneRaw).trim();
  return {
    id: asString(raw.id),
    name: asString(raw.name, "Traveler"),
    phone,
    paymentStatus: asString(raw.paymentStatus, "pending") as AudienceRecipient["paymentStatus"],
    hasValidPhone:
      typeof raw.hasValidPhone === "boolean"
        ? raw.hasValidPhone
        : Boolean(phone),
  };
}

function mapDeliveryStats(
  raw: Record<string, unknown> | undefined
): DeliveryStats | undefined {
  if (!raw) return undefined;
  return {
    total: asNumber(raw.total),
    queued: raw.queued != null ? asNumber(raw.queued) : undefined,
    sent: asNumber(raw.sent),
    failed: asNumber(raw.failed),
    skipped: asNumber(raw.skipped),
  };
}

function mapBroadcast(raw: Record<string, unknown>): BroadcastRecord {
  const statusRaw = asString(raw.status, "pending").toLowerCase();
  const status: BroadcastStatus =
    statusRaw === "sent" || statusRaw === "failed" ? statusRaw : "pending";

  return {
    id: asString(raw.id),
    date: asString(raw.date ?? raw.createdAt ?? raw.sentAt, new Date().toISOString()),
    tripId: raw.tripId != null ? asString(raw.tripId) : undefined,
    tripTitle: asString(raw.tripTitle, "Trip"),
    preview: asString(raw.preview, "SMS broadcast"),
    snippet: asString(raw.snippet),
    messageBody: asString(raw.messageBody ?? raw.message),
    recipients: asNumber(raw.recipients ?? raw.recipientCount),
    status,
    audience: asString(raw.audience ?? raw.audienceLabel, "All participants"),
    channel: "sms",
    estimatedCostGhs: asNumber(raw.estimatedCostGhs),
    actualCostGhs:
      raw.actualCostGhs != null ? asNumber(raw.actualCostGhs) : undefined,
    audienceMode: raw.audienceMode as AudienceMode | undefined,
    audienceFilter:
      raw.audienceFilter != null
        ? (asString(raw.audienceFilter) as PaymentFilter)
        : null,
    encoding: raw.encoding as SmsEncoding | undefined,
    segmentsPerMessage:
      raw.segmentsPerMessage != null
        ? asNumber(raw.segmentsPerMessage)
        : raw.segments != null
          ? asNumber(raw.segments)
          : undefined,
    deliveryStats: mapDeliveryStats(
      raw.deliveryStats as Record<string, unknown> | undefined
    ),
    sentAt: raw.sentAt != null ? asString(raw.sentAt) : null,
    completedAt: raw.completedAt != null ? asString(raw.completedAt) : null,
    errorMessage:
      raw.errorMessage != null ? asString(raw.errorMessage) : null,
  };
}

function mapDelivery(raw: Record<string, unknown>): BroadcastDelivery {
  const statusRaw = asString(raw.status, "queued").toLowerCase();
  const status: DeliveryStatus =
    statusRaw === "sent" ||
    statusRaw === "failed" ||
    statusRaw === "skipped" ||
    statusRaw === "queued"
      ? statusRaw
      : "queued";

  return {
    id: asString(raw.id),
    bookingId: asString(raw.bookingId),
    recipientName: asString(raw.recipientName, "Traveler"),
    phone:
      raw.phone == null || String(raw.phone).trim() === ""
        ? null
        : String(raw.phone).trim(),
    status,
    skipReason: raw.skipReason != null ? asString(raw.skipReason) : null,
    errorMessage: raw.errorMessage != null ? asString(raw.errorMessage) : null,
    sentAt: raw.sentAt != null ? asString(raw.sentAt) : null,
  };
}

/** GET /api/organizer/trips/:tripId/broadcast-audience */
export async function getBroadcastAudience(
  tripId: string,
  params: { mode: AudienceMode; filter?: PaymentFilter }
): Promise<BroadcastAudience> {
  const query = new URLSearchParams({ mode: params.mode });
  if (params.mode === "filter" && params.filter) {
    query.set("filter", params.filter);
  }

  const response = await apiRequest<Record<string, unknown>>(
    `/api/organizer/trips/${tripId}/broadcast-audience?${query}`,
    { method: "GET", headers: bearerHeaders() }
  );

  const data = (response.data ?? {}) as Record<string, unknown>;
  const recipientsRaw = Array.isArray(data.recipients) ? data.recipients : [];

  return {
    recipients: recipientsRaw.map((r) =>
      mapRecipient((r ?? {}) as Record<string, unknown>)
    ),
    counts: mapCounts(data.counts as Record<string, unknown> | undefined),
    audienceLabel: asString(data.audienceLabel),
  };
}

/** POST /api/organizer/broadcasts/estimate */
export async function estimateBroadcast(body: {
  tripId: string;
  message: string;
  audience: AudiencePayload;
}): Promise<BroadcastEstimate> {
  const response = await apiRequest<Record<string, unknown>>(
    "/api/organizer/broadcasts/estimate",
    {
      method: "POST",
      headers: bearerHeaders(),
      body: JSON.stringify(body),
    }
  );

  const data = (response.data ?? {}) as Record<string, unknown>;
  const encodingRaw = asString(data.encoding, "GSM-7");
  const encoding: SmsEncoding =
    encodingRaw === "Unicode" ? "Unicode" : "GSM-7";

  return {
    recipientCount: asNumber(data.recipientCount),
    skippedCount: asNumber(data.skippedCount),
    segments: Math.max(1, asNumber(data.segments, 1)),
    encoding,
    costPerSegmentGhs: asNumber(data.costPerSegmentGhs, 0.05),
    estimatedCostGhs: asNumber(data.estimatedCostGhs),
    audienceLabel: asString(data.audienceLabel),
    counts: mapCounts(data.counts as Record<string, unknown> | undefined),
  };
}

/** POST /api/organizer/broadcasts */
export async function createBroadcast(
  body: {
    tripId: string;
    channel?: BroadcastChannel;
    message: string;
    audience: AudiencePayload;
  },
  idempotencyKey: string
): Promise<CreateBroadcastResult> {
  const response = await apiRequest<Record<string, unknown>>(
    "/api/organizer/broadcasts",
    {
      method: "POST",
      headers: bearerHeaders({ "Idempotency-Key": idempotencyKey }),
      body: JSON.stringify({
        tripId: body.tripId,
        channel: body.channel ?? "sms",
        message: body.message,
        audience: body.audience,
      }),
    }
  );

  const data = (response.data ?? {}) as Record<string, unknown>;
  const broadcastRaw =
    (data.broadcast as Record<string, unknown> | undefined) ?? data;

  return {
    broadcast: mapBroadcast(broadcastRaw),
    reused: Boolean(data.reused),
  };
}

/** GET /api/organizer/broadcasts */
export async function listBroadcasts(params?: {
  status?: BroadcastStatus | "all";
  tripId?: string;
  page?: number;
  limit?: number;
}): Promise<BroadcastListResult> {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params?.tripId) query.set("tripId", params.tripId);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  const response = await apiRequest<Record<string, unknown>>(
    `/api/organizer/broadcasts${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: bearerHeaders() }
  );

  const data = (response.data ?? {}) as Record<string, unknown>;
  const broadcastsRaw = Array.isArray(data.broadcasts) ? data.broadcasts : [];
  const summary = (data.summary ?? {}) as Record<string, unknown>;
  const pagination = (data.pagination ?? {}) as Record<string, unknown>;

  return {
    broadcasts: broadcastsRaw.map((b) =>
      mapBroadcast((b ?? {}) as Record<string, unknown>)
    ),
    summary: {
      sentCount: asNumber(summary.sentCount),
      tripAttendeeCount:
        summary.tripAttendeeCount != null
          ? asNumber(summary.tripAttendeeCount)
          : undefined,
    },
    pagination: {
      page: asNumber(pagination.page, 1),
      limit: asNumber(pagination.limit, 20),
      total: asNumber(pagination.total),
      pages: asNumber(pagination.pages),
    },
  };
}

/** GET /api/organizer/broadcasts/:id */
export async function getBroadcast(
  id: string
): Promise<BroadcastDetailResult> {
  const response = await apiRequest<Record<string, unknown>>(
    `/api/organizer/broadcasts/${id}`,
    { method: "GET", headers: bearerHeaders() }
  );

  const data = (response.data ?? {}) as Record<string, unknown>;
  const broadcastRaw =
    (data.broadcast as Record<string, unknown> | undefined) ?? data;
  const deliveriesRaw = Array.isArray(data.deliveries) ? data.deliveries : [];

  return {
    broadcast: mapBroadcast(broadcastRaw),
    deliveries: deliveriesRaw.map((d) =>
      mapDelivery((d ?? {}) as Record<string, unknown>)
    ),
  };
}

/** Build audience payload from compose state. */
export function toAudiencePayload(input: {
  mode: AudienceMode;
  filter: PaymentFilter;
  attendeeIds: string[];
}): AudiencePayload {
  if (input.mode === "everyone") return { mode: "everyone" };
  if (input.mode === "filter") {
    return { mode: "filter", filter: input.filter };
  }
  return { mode: "specific", attendeeIds: input.attendeeIds };
}

/** GSM-7 basic + extension characters for client-side segment estimate. */
const GSM7_CHARS =
  "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?" +
  "¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";

const GSM7_SET = new Set([...GSM7_CHARS, "\f", "^", "{", "}", "\\", "[", "~", "]", "|", "€"]);

export function analyzeSms(text: string) {
  const isGsm7 = ![...text].some((ch) => !GSM7_SET.has(ch));
  const len = text.length;

  if (isGsm7) {
    const segments = len === 0 ? 1 : len <= 160 ? 1 : Math.ceil(len / 153);
    return {
      encoding: "GSM-7" as const,
      segments,
      charsPerSms: segments > 1 ? 153 : 160,
      length: len,
    };
  }

  const segments = len === 0 ? 1 : len <= 70 ? 1 : Math.ceil(len / 67);
  return {
    encoding: "Unicode" as const,
    segments,
    charsPerSms: segments > 1 ? 67 : 70,
    length: len,
  };
}
