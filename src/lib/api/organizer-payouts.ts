import { apiRequest } from "./client";
import { getOrganizerToken } from "./auth-token";
import type { PaymentMethod, TripAttendee } from "@/lib/types";

function bearerHeaders(): HeadersInit {
  const token = getOrganizerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type PayoutTripStatus = "live" | "completed" | "draft" | "cancelled" | "scheduled" | string;

export type PayoutTripListItem = {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  pricePerPerson: number;
  price: number;
  booked: number;
  capacity: number | null;
  status: PayoutTripStatus;
  currency: string;
};

export type PayoutSummary = {
  collected: number;
  outstanding: number;
  potential: number;
  collectionPercent: number;
  paidMembers: number;
  partialMembers: number;
  pendingMembers: number;
  totalMembers: number;
  awaitingPayment: number;
  currency: string;
  reservedForRefunds: number;
  collectionProgress: {
    collected: number;
    potential: number;
    percent: number;
  };
};

export type PayoutPaymentMethodRow = {
  method?: string | null;
  label?: string;
  collected?: number;
  amount?: number;
  percentOfCollected?: number;
  paidCount?: number;
  partialCount?: number;
  countLabel?: string;
  count?: number;
  paid?: number;
  partial?: number;
  pending?: number;
};

export type PayoutPaymentMethods = {
  methodsUsed: number;
  avgPerPaidMember: number;
  methods: PayoutPaymentMethodRow[];
};

export type MomoProvider = "mtn" | "vodafone" | "airteltigo";

/** Lifecycle: pending → processing → success | failed (Paystack MoMo transfer). */
export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed"
  | "completed"
  | string;

export type PayoutWithdrawal = {
  id: string;
  tripId?: string;
  organizerId?: string;
  amount: number;
  currency?: string;
  status: WithdrawalStatus;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
  processedAt?: string;
  note?: string;
  payoutMethod?: string;
  momoProvider?: MomoProvider | string;
  momoNumber?: string;
  accountName?: string;
  destinationLabel?: string;
  label?: string;
  failureReason?: string;
};

export type PayoutMemberPayment = {
  id: string;
  attendee: {
    fullName?: string;
    email?: string;
  };
  contact?: string | null;
  method?: string | null;
  paidOn?: string | null;
  status: "paid" | "partial" | "pending" | string;
  paymentStatus?: string;
  bookingStatus?: string;
  amountPaid: number;
  refundedAmount?: number;
  retainedAmount?: number;
  totalDue: number;
  outstanding?: number;
  currency?: string;
  partySize?: number;
  createdAt?: string;
};

export type PayoutMemberStatusCounts = {
  all: number;
  paid: number;
  partial: number;
  pending: number;
};

export type TripPayoutDetail = {
  trip: PayoutTripListItem;
  summary: PayoutSummary;
  paymentMethods: PayoutPaymentMethods;
  withdrawal: PayoutWithdrawal | null;
  withdrawals: PayoutWithdrawal[];
  withdrawnTotal: number;
  reservedForRefunds: number;
  availableToWithdraw: number;
  memberPayments: {
    statusCounts: PayoutMemberStatusCounts;
    items: PayoutMemberPayment[];
  };
};

export type PayoutMembersResult = {
  trip: { id: string; title: string };
  statusCounts: PayoutMemberStatusCounts;
  members: PayoutMemberPayment[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type CreateTripWithdrawalResult = {
  withdrawal: PayoutWithdrawal;
  availableToWithdraw: number;
  collected: number;
  reservedForRefunds: number;
};

export type PayoutPaymentFilter = "all" | "paid" | "partial" | "pending";
export type PayoutPeriodFilter = "all" | "7d" | "30d" | "90d";
export type PayoutMemberSort =
  | "paidOn"
  | "amountPaid"
  | "attendee"
  | "status"
  | "createdAt";

export type ListPayoutTripsParams = {
  page?: number;
  limit?: number;
};

export type ListPayoutMembersParams = {
  paymentStatus?: PayoutPaymentFilter;
  period?: PayoutPeriodFilter;
  sortBy?: PayoutMemberSort;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
};

export type CreateTripWithdrawalInput = {
  amount: number;
  momoProvider: MomoProvider;
  momoNumber: string;
  accountName?: string;
  note?: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function mapPaymentMethod(value: unknown): PaymentMethod | undefined {
  const raw = asString(value).toLowerCase().replace(/[\s_-]+/g, "");
  switch (raw) {
    case "card":
    case "paystack":
      return "card";
    case "mtn":
    case "mtnmomo":
    case "momo":
      return "mtn";
    case "vodafone":
    case "vodafonecash":
      return "vodafone";
    case "airteltigo":
    case "airteltigomoney":
      return "airteltigo";
    case "bank":
    case "banktransfer":
      return "bank";
    case "installment":
      return "installment";
    default:
      return undefined;
  }
}

function mapMemberStatus(
  status: unknown,
  paymentStatus?: unknown
): TripAttendee["paymentStatus"] {
  const primary = asString(status).toLowerCase();
  const secondary = asString(paymentStatus).toLowerCase();
  const combined = `${primary} ${secondary}`;

  if (
    combined.includes("partial") ||
    secondary === "partially_paid" ||
    secondary === "deposit_paid" ||
    secondary === "partial"
  ) {
    return "partial";
  }
  if (
    primary === "paid" ||
    secondary === "fully_paid" ||
    secondary === "paid"
  ) {
    return "paid";
  }
  return "pending";
}

export function mapPayoutMemberToAttendee(
  member: PayoutMemberPayment,
  tripId: string
): TripAttendee {
  const name =
    member.attendee?.fullName?.trim() ||
    member.attendee?.email?.trim() ||
    "Traveler";
  return {
    id: member.id,
    tripId,
    name,
    email: member.attendee?.email ?? "",
    phone: member.contact ?? "",
    avatar: "",
    paymentStatus: mapMemberStatus(member.status, member.paymentStatus),
    amountPaid: asNumber(member.amountPaid),
    amountDue: asNumber(member.totalDue),
    paymentMethod: mapPaymentMethod(member.method),
    paidAt: member.paidOn ?? undefined,
    travelers: Math.max(1, asNumber(member.partySize, 1)),
  };
}

export type NormalizedWithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

/** Normalize API withdrawal status for UI filters / badges. */
export function normalizeWithdrawalStatus(
  status: string
): NormalizedWithdrawalStatus {
  const s = status.toLowerCase();
  if (s === "completed" || s === "success") return "completed";
  if (s === "failed" || s === "failure" || s === "error") return "failed";
  if (s === "processing") return "processing";
  return "pending";
}

/** Funds locked while Paystack transfer is outstanding. */
export function isWithdrawalInFlight(status: string): boolean {
  const normalized = normalizeWithdrawalStatus(status);
  return normalized === "pending" || normalized === "processing";
}

export function withdrawalStatusCopy(status: string): {
  label: string;
  description: string;
} {
  switch (normalizeWithdrawalStatus(status)) {
    case "pending":
      return {
        label: "Pending",
        description: "Withdrawal created — funds locked while we set up MoMo.",
      };
    case "processing":
      return {
        label: "Processing",
        description: "Paystack transfer started — waiting for MoMo confirmation.",
      };
    case "completed":
      return {
        label: "Success",
        description: "Transfer succeeded — funds should be on your MoMo.",
      };
    case "failed":
      return {
        label: "Failed",
        description:
          "Transfer failed. Try again, or contact support if this keeps happening.",
      };
  }
}

function mapTripListItem(raw: unknown): PayoutTripListItem {
  const r = asRecord(raw);
  return {
    id: asString(r.id),
    title: asString(r.title, "Untitled trip"),
    destination: asString(r.destination),
    startDate: asString(r.startDate),
    endDate: asString(r.endDate),
    pricePerPerson: asNumber(r.pricePerPerson ?? r.price),
    price: asNumber(r.price ?? r.pricePerPerson),
    booked: asNumber(r.booked),
    capacity:
      r.capacity == null || r.capacity === ""
        ? null
        : asNumber(r.capacity, 0),
    status: asString(r.status, "live"),
    currency: asString(r.currency, "GHS"),
  };
}

function mapMember(raw: unknown): PayoutMemberPayment {
  const r = asRecord(raw);
  const attendee = asRecord(r.attendee);
  return {
    id: asString(r.id),
    attendee: {
      fullName: asString(attendee.fullName || attendee.name) || undefined,
      email: asString(attendee.email) || undefined,
    },
    contact: asString(r.contact) || null,
    method: (r.method as string | null) ?? null,
    paidOn: asString(r.paidOn) || null,
    status: asString(r.status, "pending"),
    paymentStatus: asString(r.paymentStatus) || undefined,
    bookingStatus: asString(r.bookingStatus) || undefined,
    amountPaid: asNumber(r.amountPaid),
    refundedAmount: asNumber(r.refundedAmount),
    retainedAmount: asNumber(r.retainedAmount),
    totalDue: asNumber(r.totalDue),
    outstanding: asNumber(r.outstanding),
    currency: asString(r.currency, "GHS"),
    partySize: asNumber(r.partySize, 1),
    createdAt: asString(r.createdAt) || undefined,
  };
}

function mapStatusCounts(raw: unknown): PayoutMemberStatusCounts {
  const r = asRecord(raw);
  return {
    all: asNumber(r.all),
    paid: asNumber(r.paid),
    partial: asNumber(r.partial),
    pending: asNumber(r.pending),
  };
}

function mapWithdrawal(raw: unknown): PayoutWithdrawal | null {
  if (!raw || typeof raw !== "object") return null;
  const r = asRecord(raw);
  const id = asString(r.id);
  if (!id) return null;
  const createdAt = asString(r.createdAt) || undefined;
  const processedAt = asString(r.processedAt) || undefined;
  return {
    id,
    tripId: asString(r.tripId) || undefined,
    organizerId: asString(r.organizerId) || undefined,
    amount: asNumber(r.amount),
    currency: asString(r.currency, "GHS") || undefined,
    status: asString(r.status, "pending"),
    date: asString(r.date || r.processedAt || r.createdAt) || undefined,
    createdAt,
    updatedAt: asString(r.updatedAt) || undefined,
    processedAt,
    note: asString(r.note) || undefined,
    payoutMethod: asString(r.payoutMethod) || undefined,
    momoProvider: asString(r.momoProvider) || undefined,
    momoNumber: asString(r.momoNumber) || undefined,
    accountName: asString(r.accountName) || undefined,
    destinationLabel: asString(r.destinationLabel) || undefined,
    label: asString(r.label) || undefined,
    failureReason:
      asString(
        r.failureReason || r.failReason || r.failureMessage || r.errorMessage
      ) || undefined,
  };
}

function mapSummary(raw: unknown): PayoutSummary {
  const r = asRecord(raw);
  const progress = asRecord(r.collectionProgress);
  const collected = asNumber(r.collected);
  const potential = asNumber(r.potential);
  const percent = asNumber(
    r.collectionPercent ?? progress.percent,
    potential > 0 ? Math.round((collected / potential) * 1000) / 10 : 0
  );
  return {
    collected,
    outstanding: asNumber(r.outstanding),
    potential,
    collectionPercent: percent,
    paidMembers: asNumber(r.paidMembers),
    partialMembers: asNumber(r.partialMembers),
    pendingMembers: asNumber(r.pendingMembers),
    totalMembers: asNumber(r.totalMembers),
    awaitingPayment: asNumber(r.awaitingPayment),
    currency: asString(r.currency, "GHS"),
    reservedForRefunds: asNumber(r.reservedForRefunds),
    collectionProgress: {
      collected: asNumber(progress.collected, collected),
      potential: asNumber(progress.potential, potential),
      percent: asNumber(progress.percent, percent),
    },
  };
}

function mapPaymentMethods(raw: unknown): PayoutPaymentMethods {
  const r = asRecord(raw);
  const methodsRaw = Array.isArray(r.methods) ? r.methods : [];
  return {
    methodsUsed: asNumber(r.methodsUsed),
    avgPerPaidMember: asNumber(r.avgPerPaidMember),
    methods: methodsRaw.map((item) => {
      const m = asRecord(item);
      const paidCount = asNumber(m.paidCount ?? m.paid);
      const partialCount = asNumber(m.partialCount ?? m.partial);
      const methodLabel = asString(m.method || m.label);
      return {
        method: (m.method as string | null) ?? null,
        label: asString(m.label) || methodLabel || undefined,
        collected: asNumber(m.collected ?? m.amount),
        amount: asNumber(m.amount ?? m.collected),
        percentOfCollected: asNumber(m.percentOfCollected),
        paidCount,
        partialCount,
        countLabel:
          asString(m.countLabel) ||
          (paidCount || partialCount
            ? `${paidCount} paid · ${partialCount} partial`
            : undefined),
        count: asNumber(m.count),
        paid: paidCount,
        partial: partialCount,
        pending: asNumber(m.pending),
      };
    }),
  };
}

function mapTripDetail(raw: unknown): TripPayoutDetail {
  const r = asRecord(raw);
  const memberPayments = asRecord(r.memberPayments);
  const withdrawalsRaw = Array.isArray(r.withdrawals) ? r.withdrawals : [];
  const summary = mapSummary(r.summary);
  const reservedForRefunds = asNumber(
    r.reservedForRefunds ?? summary.reservedForRefunds
  );
  return {
    trip: mapTripListItem(r.trip),
    summary: { ...summary, reservedForRefunds },
    paymentMethods: mapPaymentMethods(r.paymentMethods),
    withdrawal: mapWithdrawal(r.withdrawal),
    withdrawals: withdrawalsRaw
      .map(mapWithdrawal)
      .filter((w): w is PayoutWithdrawal => Boolean(w)),
    withdrawnTotal: asNumber(r.withdrawnTotal),
    reservedForRefunds,
    availableToWithdraw: asNumber(r.availableToWithdraw),
    memberPayments: {
      statusCounts: mapStatusCounts(memberPayments.statusCounts),
      items: (Array.isArray(memberPayments.items) ? memberPayments.items : []).map(
        mapMember
      ),
    },
  };
}

export async function listPayoutTrips(params: ListPayoutTripsParams = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const query = qs.toString();

  const res = await apiRequest<{
    trips: unknown[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }>(`/api/organizer/payouts/trips${query ? `?${query}` : ""}`, {
    method: "GET",
    headers: bearerHeaders(),
  });

  const trips = (res.data?.trips ?? []).map(mapTripListItem).filter((t) => t.id);
  return {
    ...res,
    data: {
      trips,
      pagination: res.data?.pagination ?? {
        page: 1,
        limit: params.limit ?? 50,
        total: trips.length,
        pages: 1,
      },
    },
  };
}

export async function getTripPayoutDetail(tripId: string) {
  const res = await apiRequest<unknown>(
    `/api/organizer/payouts/trips/${encodeURIComponent(tripId)}`,
    {
      method: "GET",
      headers: bearerHeaders(),
    }
  );

  return {
    ...res,
    data: res.data ? mapTripDetail(res.data) : undefined,
  };
}

export async function listTripPayoutMembers(
  tripId: string,
  params: ListPayoutMembersParams = {}
) {
  const qs = new URLSearchParams();
  qs.set("paymentStatus", params.paymentStatus ?? "all");
  qs.set("period", params.period ?? "all");
  qs.set("sortBy", params.sortBy ?? "paidOn");
  qs.set("sortOrder", params.sortOrder ?? "desc");
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 20));

  const res = await apiRequest<unknown>(
    `/api/organizer/payouts/trips/${encodeURIComponent(tripId)}/members?${qs}`,
    {
      method: "GET",
      headers: bearerHeaders(),
    }
  );

  const raw = asRecord(res.data);
  const trip = asRecord(raw.trip);
  const members = (Array.isArray(raw.members) ? raw.members : []).map(mapMember);
  const pagination = asRecord(raw.pagination);

  const data: PayoutMembersResult = {
    trip: {
      id: asString(trip.id, tripId),
      title: asString(trip.title),
    },
    statusCounts: mapStatusCounts(raw.statusCounts),
    members,
    pagination: {
      page: asNumber(pagination.page, 1),
      limit: asNumber(pagination.limit, params.limit ?? 20),
      total: asNumber(pagination.total, members.length),
      pages: asNumber(pagination.pages, 1),
    },
  };

  return { ...res, data };
}

export async function exportTripPayoutMembers(
  tripId: string,
  params: {
    paymentStatus?: PayoutPaymentFilter;
    period?: PayoutPeriodFilter;
  } = {}
): Promise<Blob> {
  const qs = new URLSearchParams();
  qs.set("paymentStatus", params.paymentStatus ?? "all");
  qs.set("period", params.period ?? "all");

  const token = getOrganizerToken();
  const headers: HeadersInit = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  // Same-origin `/api/*` → Next rewrite to the backend (see api/client.ts).
  const path = `/api/organizer/payouts/trips/${encodeURIComponent(tripId)}/members/export?${qs}`;
  const response = await fetch(path, { method: "GET", headers });

  if (!response.ok) {
    let message = "Could not export member payments.";
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message || body.error || message;
    } catch {
      /* non-JSON */
    }
    const { ApiError } = await import("./client");
    throw new ApiError(message, response.status);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = (await response.json()) as {
      data?: string | { csv?: string };
      message?: string;
    };
    const csv =
      typeof body.data === "string"
        ? body.data
        : typeof body.data?.csv === "string"
          ? body.data.csv
          : "";
    return new Blob([csv], { type: "text/csv;charset=utf-8" });
  }

  return response.blob();
}

export async function createTripWithdrawal(
  tripId: string,
  input: CreateTripWithdrawalInput
) {
  const res = await apiRequest<unknown>(
    `/api/organizer/payouts/trips/${encodeURIComponent(tripId)}/withdrawals`,
    {
      method: "POST",
      headers: bearerHeaders(),
      body: JSON.stringify({
        amount: input.amount,
        momoProvider: input.momoProvider,
        momoNumber: input.momoNumber,
        ...(input.accountName?.trim()
          ? { accountName: input.accountName.trim() }
          : {}),
        ...(input.note?.trim() ? { note: input.note.trim() } : {}),
      }),
    }
  );

  const raw = asRecord(res.data);
  const withdrawal =
    mapWithdrawal(raw.withdrawal) ??
    mapWithdrawal(res.data);

  if (!withdrawal) {
    const { ApiError } = await import("./client");
    throw new ApiError(
      res.message || "Withdrawal recorded but response was incomplete.",
      200
    );
  }

  const data: CreateTripWithdrawalResult = {
    withdrawal,
    availableToWithdraw: asNumber(raw.availableToWithdraw),
    collected: asNumber(raw.collected),
    reservedForRefunds: asNumber(raw.reservedForRefunds),
  };

  return { ...res, data };
}

/** Aggregate withdrawals across payout trips (no global list endpoint). */
export async function listAllTripWithdrawals(params: ListPayoutTripsParams = {}) {
  const tripsRes = await listPayoutTrips({ limit: params.limit ?? 50, page: params.page });
  const trips = tripsRes.data?.trips ?? [];

  const details = await Promise.all(
    trips.map(async (trip) => {
      try {
        const res = await getTripPayoutDetail(trip.id);
        return { trip, detail: res.data ?? null };
      } catch {
        return { trip, detail: null };
      }
    })
  );

  const withdrawals = details.flatMap(({ trip, detail }) => {
    if (!detail) return [];
    const rows =
      detail.withdrawals.length > 0
        ? detail.withdrawals
        : detail.withdrawal
          ? [detail.withdrawal]
          : [];
    return rows.map((w) => ({
      ...w,
      tripId: w.tripId || trip.id,
      tripTitle: trip.title,
      currency: w.currency || trip.currency || "GHS",
    }));
  });

  withdrawals.sort((a, b) => {
    const at = new Date(a.processedAt || a.date || a.createdAt || 0).getTime();
    const bt = new Date(b.processedAt || b.date || b.createdAt || 0).getTime();
    return bt - at;
  });

  const availableByTrip = details
    .filter((d) => d.detail && (d.detail.availableToWithdraw ?? 0) > 0)
    .map(({ trip, detail }) => ({
      tripId: trip.id,
      title: trip.title,
      availableToWithdraw: detail!.availableToWithdraw,
      reservedForRefunds: detail!.reservedForRefunds,
      currency: trip.currency || "GHS",
    }));

  return {
    withdrawals,
    availableByTrip,
    trips,
  };
}
