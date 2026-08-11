import { apiRequest } from "./client";
import { getTravelerToken } from "./auth-token";
import { FALLBACK_TRIP_IMAGE, resolveMediaUrl } from "./media";
import type { Booking, PaymentMethod } from "@/lib/types";

export type BookingStatusFilter =
  | "pending"
  | "past"
  | "cancelled"
  | "upcoming"
  | "all";

export type BookingType = "solo" | "couple" | "group";

export type BookingGuestInput = {
  fullName?: string;
  email?: string;
  age?: number;
};

export type SelectedAddOnInput = {
  addOnId: string;
  selected: boolean;
  quantity?: number;
};

export type BookingPreviewInput = {
  bookingType: BookingType;
  partySize?: number;
  guests?: BookingGuestInput[];
  selectedAddOns?: SelectedAddOnInput[];
  /** Amount the traveler intends to pay now (GHS). */
  paymentAmount?: number;
};

export type PaymentInputBounds = {
  min: number;
  max: number;
  suggested: number;
};

export type BookingPricing = {
  currency: string;
  pricePerPerson: number;
  rateType?: string;
  couplePrice?: number | null;
  groupPrice?: number | null;
  groupSize?: number | null;
  isEarlyBird?: boolean;
  partySize: number;
  tripSubtotal: number;
  addOnsTotal: number;
  totalAmount: number;
  depositPerPerson: number;
  depositTotal: number;
  amountDueNow: number;
  balanceDue: number;
  balanceDueDate?: string;
  depositDuePolicy?: string;
  paymentNote?: string;
  minPayment?: number;
  maxPayment?: number;
  suggestedPayment?: number;
};

export type BookingPreviewAddOn = {
  addOnId: string;
  name: string;
  unitPrice: number;
  perPerson?: boolean;
  quantity: number;
  lineTotal: number;
};

export type BookingTravelerDefaults = {
  fullName?: string;
  email?: string;
  phone?: string;
  location?: string;
  whatsapp?: string;
};

export type BookingPreview = {
  trip: {
    id: string;
    title: string;
    destination: string;
    startDate: string;
    endDate: string;
    seatsAvailable?: number | null;
    pricePerPerson: number;
    couplePrice?: number | null;
    groupPrice?: number | null;
    groupSize?: number | null;
    addOns: {
      name: string;
      price: number;
      perPerson?: boolean;
      _id?: string;
      id?: string;
    }[];
  };
  travelerDefaults?: BookingTravelerDefaults;
  bookingType: BookingType;
  partySize: number;
  guests: Array<BookingGuestInput & { isLead?: boolean; phone?: string }>;
  location?: string;
  whatsapp?: string;
  selectedAddOns: BookingPreviewAddOn[];
  pricing: BookingPricing;
  paymentInput?: PaymentInputBounds;
};

export type CreateBookingInput = {
  tripId: string;
  bookingType: BookingType;
  partySize?: number;
  location?: string;
  whatsapp?: string;
  guests?: BookingGuestInput[];
  selectedAddOns?: SelectedAddOnInput[];
  /** Amount to charge now via Paystack (GHS). */
  paymentAmount: number;
  callbackUrl: string;
};

export type ApiBooking = {
  id: string;
  tripId?: string | Record<string, unknown>;
  travelerId?: string;
  bookingType: BookingType;
  partySize: number;
  guests: Array<BookingGuestInput & { isLead?: boolean; phone?: string }>;
  location?: string;
  whatsapp?: string;
  selectedAddOns?: BookingPreviewAddOn[] | SelectedAddOnInput[];
  pricing: BookingPricing;
  status: string;
  paymentStatus: string;
  paystackReference?: string;
  paystackAuthorizationUrl?: string;
  paystackPublicKey?: string;
  amountPaid?: number;
  remainingBalance?: number;
  payments?: BookingPaymentRecord[];
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
  travelerDefaults?: BookingTravelerDefaults;
  trip?: {
    id?: string;
    _id?: string;
    title?: string;
    destination?: string;
    startDate?: string;
    endDate?: string;
    coverImage?: string;
    slug?: string;
  };
};

export type BookingPaymentRecord = {
  amount: number;
  reference?: string;
  channel?: string;
  method?: string;
  paidAt?: string;
  status?: string;
};

export type PaystackConfig = {
  publicKey: string;
  currency: string;
};

export type BookingsListResult = {
  bookings: Booking[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

function bearerHeaders(): HeadersInit {
  const token = getTravelerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toDateInput(value?: unknown): string {
  if (typeof value !== "string" || !value) return "";
  return value.slice(0, 10);
}

function mapBookingStatus(raw: Record<string, unknown>): Booking["status"] {
  const status = String(raw.status ?? "").toLowerCase();
  if (
    status === "confirmed" ||
    status === "paid" ||
    status === "approved" ||
    status === "completed"
  ) {
    return "confirmed";
  }
  if (status === "cancelled" || status === "canceled" || status === "refunded") {
    return "cancelled";
  }
  if (status === "waitlisted" || status === "waitlist") {
    return "waitlisted";
  }
  // pending_payment, pending, unpaid, etc.
  return "pending";
}

function mapPaymentStatus(
  raw: Record<string, unknown>
): Booking["paymentStatus"] {
  const status = String(
    raw.paymentStatus ?? raw.payment_status ?? raw.status ?? ""
  ).toLowerCase();
  if (
    status === "paid" ||
    status === "fully_paid" ||
    status === "confirmed" ||
    status === "success"
  ) {
    return "paid";
  }
  if (
    status === "partial" ||
    status === "partially_paid" ||
    status === "deposit_paid"
  ) {
    return "partial";
  }
  return "pending";
}

function mapPaymentMethod(value: unknown): PaymentMethod | undefined {
  const method = String(value ?? "").toLowerCase().replace(/[\s_-]+/g, "");
  if (!method) return undefined;
  if (method === "card" || method.includes("card")) return "card";
  if (method === "mtn" || method.includes("mtn")) return "mtn";
  if (method === "vodafone" || method.includes("vodafone")) return "vodafone";
  if (
    method === "airteltigo" ||
    method.includes("airteltigo") ||
    method.includes("airtel")
  ) {
    return "airteltigo";
  }
  if (method === "bank" || method.includes("bank")) return "bank";
  if (method === "installment" || method.includes("installment")) {
    return "installment";
  }
  if (method === "paystack") return "card";
  if (method.includes("mobilemoney") || method === "momo") return "mtn";
  return undefined;
}

function nestedTrip(raw: Record<string, unknown>): Record<string, unknown> {
  if (raw.trip && typeof raw.trip === "object") {
    return raw.trip as Record<string, unknown>;
  }
  if (raw.tripId && typeof raw.tripId === "object") {
    return raw.tripId as Record<string, unknown>;
  }
  if (raw.tripDetails && typeof raw.tripDetails === "object") {
    return raw.tripDetails as Record<string, unknown>;
  }
  return {};
}

function tripIdFromRaw(raw: Record<string, unknown>): string {
  const trip = nestedTrip(raw);
  if (typeof raw.tripId === "string") return raw.tripId;
  if (typeof raw.trip_id === "string") return raw.trip_id;
  return String(trip.id ?? trip._id ?? "");
}

/** Map a booking row from GET /api/bookings/me or GET /api/bookings/:id. */
export function mapBookingFromApi(raw: Record<string, unknown>): Booking {
  const trip = nestedTrip(raw);
  const pricing =
    (raw.pricing as Record<string, unknown> | undefined) ?? undefined;

  const tripId = tripIdFromRaw(raw);
  const tripTitle = String(
    raw.tripTitle ?? raw.trip_title ?? trip.title ?? "Trip"
  );
  const destination = String(raw.destination ?? trip.destination ?? "");
  const image =
    resolveMediaUrl(
      String(
        raw.image ??
          raw.coverImage ??
          trip.image ??
          trip.coverImage ??
          ""
      ) || null
    ) ?? FALLBACK_TRIP_IMAGE;

  const amount = Number(
    pricing?.totalAmount ??
      raw.amount ??
      raw.totalAmount ??
      raw.price ??
      0
  );
  const amountPaid = Number(
    raw.amountPaid ?? raw.paidAmount ?? raw.amount_paid ?? 0
  );
  const remainingBalance = Number(
    raw.remainingBalance ??
      raw.remaining_balance ??
      pricing?.balanceDue ??
      Math.max(0, amount - amountPaid)
  );

  const guests = raw.guests;
  const travelersFromGuests = Array.isArray(guests) ? guests.length : 0;

  return {
    id: String(raw.id ?? raw._id ?? `${tripId}-${tripTitle}`),
    tripId,
    tripTitle,
    destination,
    image,
    startDate: toDateInput(raw.startDate ?? raw.start_date ?? trip.startDate),
    endDate: toDateInput(raw.endDate ?? raw.end_date ?? trip.endDate),
    status: mapBookingStatus(raw),
    amount,
    amountPaid,
    remainingBalance: remainingBalance > 0 ? remainingBalance : 0,
    paymentStatus: mapPaymentStatus(raw),
    paymentMethod: mapPaymentMethod(
      raw.paymentMethod ?? raw.payment_method ?? raw.paymentChannel
    ),
    travelers:
      Number(
        raw.travelers ?? raw.partySize ?? pricing?.partySize ?? travelersFromGuests
      ) || 1,
  };
}

export type BookingReceiptDetails = {
  bookingType?: BookingType;
  partySize?: number;
  guests: Array<{
    fullName: string;
    email?: string;
    phone?: string;
    isLead?: boolean;
  }>;
  addOns: Array<{
    name: string;
    quantity?: number;
    unitPrice?: number;
    perPerson?: boolean;
    lineTotal?: number;
  }>;
  whatsapp?: string;
  location?: string;
  currency?: string;
  tripSubtotal?: number;
  addOnsTotal?: number;
  totalAmount?: number;
  depositTotal?: number;
  amountPaid?: number;
  balanceDue?: number;
  remainingBalance?: number;
  balanceDueDate?: string;
  paymentNote?: string;
  paymentStatus?: "paid" | "partial" | "pending";
  paymentStatusRaw?: string;
  paymentStatusLabel?: string;
  paymentMethod?: PaymentMethod;
  paymentMethodLabel?: string;
  paidAt?: string;
  reference?: string;
  payments?: BookingPaymentRecord[];
};

function paymentStatusLabelFromRaw(status: string): string | undefined {
  const s = status.toLowerCase();
  if (s === "deposit_paid") return "Deposit paid";
  if (s === "fully_paid" || s === "paid") return "Paid in full";
  if (s === "partial" || s === "partially_paid") return "Partially paid";
  if (s === "pending" || s === "pending_payment") return "Payment pending";
  return undefined;
}

function mapPayments(raw: unknown): BookingPaymentRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: BookingPaymentRecord[] = [];
  for (const row of raw) {
    if (!row || typeof row !== "object") continue;
    const p = row as Record<string, unknown>;
    const amount = Number(p.amount ?? p.amountPaid ?? 0);
    if (!Number.isFinite(amount) || amount <= 0) continue;
    out.push({
      amount,
      reference:
        String(p.reference ?? p.paystackReference ?? "").trim() || undefined,
      channel:
        String(p.channel ?? p.paymentChannel ?? "").trim() || undefined,
      method: String(p.method ?? p.paymentMethod ?? "").trim() || undefined,
      paidAt: String(p.paidAt ?? p.paid_at ?? "").trim() || undefined,
      status: String(p.status ?? "").trim() || undefined,
    });
  }
  return out;
}

/** Normalize payment amount bounds from preview / pay payloads. */
export function getPaymentInputBounds(
  previewOrPricing:
    | {
        paymentInput?: PaymentInputBounds | Record<string, unknown>;
        pricing?: BookingPricing | Record<string, unknown>;
      }
    | null
    | undefined,
  fallback?: { deposit?: number; total?: number }
): PaymentInputBounds | null {
  const fallbackDeposit = Number(fallback?.deposit ?? 0);
  const fallbackTotal = Number(fallback?.total ?? 0);

  if (!previewOrPricing) {
    if (fallbackTotal <= 0) return null;
    const min =
      fallbackDeposit > 0 && fallbackDeposit < fallbackTotal
        ? fallbackDeposit
        : fallbackTotal;
    return { min, max: fallbackTotal, suggested: min };
  }

  const input = previewOrPricing.paymentInput as
    | Record<string, unknown>
    | undefined;
  const pricing = previewOrPricing.pricing as
    | Record<string, unknown>
    | undefined;

  const total = Number(
    input?.max ??
      pricing?.maxPayment ??
      pricing?.totalAmount ??
      fallbackTotal ??
      0
  );
  if (!(total > 0)) return null;

  const depositCandidate = Number(
    input?.min ??
      pricing?.minPayment ??
      pricing?.depositTotal ??
      fallbackDeposit ??
      0
  );

  // If API omits deposit on a follow-up preview, keep a real floor from fallback
  // instead of collapsing min → total (which locks the field to full amount).
  const min =
    depositCandidate > 0 && depositCandidate < total
      ? depositCandidate
      : fallbackDeposit > 0 && fallbackDeposit < total
        ? fallbackDeposit
        : total;

  const suggestedRaw = Number(
    input?.suggested ??
      pricing?.suggestedPayment ??
      (min < total ? min : total)
  );
  const suggested = Math.min(Math.max(suggestedRaw || min, min), total);

  return { min, max: total, suggested };
}

/** Pull display fields for the post-payment receipt from a raw booking payload. */
export function extractBookingReceiptDetails(
  raw: Record<string, unknown>
): BookingReceiptDetails {
  const bookingTypeRaw = String(raw.bookingType ?? raw.booking_type ?? "");
  const bookingType =
    bookingTypeRaw === "solo" ||
    bookingTypeRaw === "couple" ||
    bookingTypeRaw === "group"
      ? bookingTypeRaw
      : undefined;

  const guestsRaw = Array.isArray(raw.guests) ? raw.guests : [];
  const guests = guestsRaw
    .map((g) => {
      if (!g || typeof g !== "object") return null;
      const row = g as Record<string, unknown>;
      const fullName = String(row.fullName ?? row.full_name ?? "").trim();
      if (!fullName) return null;
      const email = String(row.email ?? "").trim();
      const phone = String(row.phone ?? "").trim();
      return {
        fullName,
        email: email || undefined,
        phone: phone || undefined,
        isLead: Boolean(row.isLead ?? row.is_lead),
      };
    })
    .filter((g): g is NonNullable<typeof g> => g != null);

  const addOnsRaw = Array.isArray(raw.selectedAddOns)
    ? raw.selectedAddOns
    : Array.isArray(raw.selected_add_ons)
      ? raw.selected_add_ons
      : [];
  const addOns = addOnsRaw
    .map((a) => {
      if (!a || typeof a !== "object") return null;
      const row = a as Record<string, unknown>;
      if (row.selected === false) return null;
      const name = String(row.name ?? "").trim();
      if (!name) return null;
      const quantity = Number(row.quantity ?? 1) || 1;
      const unitPrice = Number(row.unitPrice ?? row.unit_price);
      const lineTotal = Number(row.lineTotal ?? row.line_total);
      return {
        name,
        quantity,
        unitPrice: Number.isFinite(unitPrice) ? unitPrice : undefined,
        perPerson: Boolean(row.perPerson ?? row.per_person),
        lineTotal: Number.isFinite(lineTotal)
          ? lineTotal
          : Number.isFinite(unitPrice)
            ? unitPrice * quantity
            : undefined,
      };
    })
    .filter((a): a is NonNullable<typeof a> => a != null);

  const pricing =
    (raw.pricing as Record<string, unknown> | undefined) ?? undefined;
  const currency = String(pricing?.currency ?? raw.currency ?? "GHS");
  const tripSubtotal = Number(pricing?.tripSubtotal ?? 0);
  const addOnsTotal = Number(pricing?.addOnsTotal ?? 0);
  const totalAmount = Number(
    pricing?.totalAmount ?? raw.totalAmount ?? raw.amount ?? 0
  );
  const depositTotal = Number(pricing?.depositTotal ?? 0);
  const amountPaid = Number(raw.amountPaid ?? raw.paidAmount ?? 0);
  const balanceDue = Number(
    raw.remainingBalance ??
      pricing?.balanceDue ??
      raw.balanceDue ??
      0
  );
  const balanceDueDate = String(
    pricing?.balanceDueDate ?? raw.balanceDueDate ?? ""
  ).trim();
  const paymentNote = String(
    pricing?.paymentNote ?? raw.paymentNote ?? ""
  ).trim();

  const paymentStatusRaw = String(
    raw.paymentStatus ?? raw.payment_status ?? ""
  );
  const paymentMethodRaw = String(
    raw.paymentMethod ?? raw.payment_method ?? ""
  ).trim();
  const paymentMethod =
    mapPaymentMethod(paymentMethodRaw) ??
    mapPaymentMethod(raw.paymentChannel);

  const whatsapp = String(raw.whatsapp ?? "").trim();
  const location = String(raw.location ?? "").trim();
  const paidAt = String(raw.paidAt ?? raw.paid_at ?? "").trim();
  const reference = String(
    raw.paystackReference ?? raw.reference ?? raw.id ?? raw._id ?? ""
  ).trim();
  const partySize = Number(
    raw.partySize ?? pricing?.partySize ?? guests.length ?? 0
  );

  return {
    bookingType,
    partySize: partySize > 0 ? partySize : undefined,
    guests,
    addOns,
    whatsapp: whatsapp || undefined,
    location: location || undefined,
    currency,
    tripSubtotal: tripSubtotal > 0 ? tripSubtotal : undefined,
    addOnsTotal: addOnsTotal > 0 ? addOnsTotal : undefined,
    totalAmount: totalAmount > 0 ? totalAmount : undefined,
    depositTotal: depositTotal > 0 ? depositTotal : undefined,
    amountPaid: amountPaid > 0 ? amountPaid : undefined,
    balanceDue: balanceDue > 0 ? balanceDue : undefined,
    remainingBalance: balanceDue > 0 ? balanceDue : undefined,
    balanceDueDate: balanceDueDate || undefined,
    paymentNote: paymentNote || undefined,
    paymentStatus: mapPaymentStatus(raw),
    paymentStatusRaw: paymentStatusRaw || undefined,
    paymentStatusLabel: paymentStatusLabelFromRaw(paymentStatusRaw),
    paymentMethod,
    paymentMethodLabel: paymentMethodRaw || undefined,
    paidAt: paidAt || undefined,
    reference: reference || undefined,
    payments: mapPayments(raw.payments),
  };
}

/** POST /api/bookings/preview/:tripId */
export async function previewBooking(
  tripId: string,
  input: BookingPreviewInput
) {
  return apiRequest<BookingPreview>(`/api/bookings/preview/${tripId}`, {
    method: "POST",
    headers: bearerHeaders(),
    body: JSON.stringify(input),
  });
}

/** GET /api/bookings/paystack/config */
export async function getPaystackConfig() {
  return apiRequest<PaystackConfig>("/api/bookings/paystack/config", {
    method: "GET",
  });
}

/** POST /api/bookings */
export async function createBooking(input: CreateBookingInput) {
  return apiRequest<ApiBooking>("/api/bookings", {
    method: "POST",
    headers: bearerHeaders(),
    body: JSON.stringify(input),
  });
}

/** POST /api/bookings/:id/pay */
export async function payBooking(
  bookingId: string,
  input: { callbackUrl: string; paymentAmount: number }
) {
  return apiRequest<ApiBooking>(`/api/bookings/${bookingId}/pay`, {
    method: "POST",
    headers: bearerHeaders(),
    body: JSON.stringify(input),
  });
}

/** POST /api/bookings/verify-payment */
export async function verifyBookingPayment(input: { reference: string }) {
  return apiRequest<ApiBooking>("/api/bookings/verify-payment", {
    method: "POST",
    headers: bearerHeaders(),
    body: JSON.stringify(input),
  });
}

/** GET /api/bookings/:id */
export async function getBooking(bookingId: string) {
  const response = await apiRequest<Record<string, unknown>>(
    `/api/bookings/${bookingId}`,
    {
      method: "GET",
      headers: bearerHeaders(),
    }
  );
  return {
    ...response,
    data: response.data ? mapBookingFromApi(response.data) : undefined,
    raw: response.data,
  };
}

/** Confirmed or unpaid-in-progress — not cancelled / waitlisted. */
export function isActiveTripBooking(booking: Booking): boolean {
  return booking.status === "confirmed" || booking.status === "pending";
}

/** Prefer a paid seat, then a deposit, then an unpaid checkout. */
export function pickActiveBookingForTrip(
  bookings: Booking[],
  tripId: string
): Booking | null {
  const matches = bookings.filter(
    (booking) => booking.tripId === tripId && isActiveTripBooking(booking)
  );
  if (!matches.length) return null;
  const rank = (booking: Booking) =>
    booking.paymentStatus === "paid"
      ? 0
      : booking.paymentStatus === "partial"
        ? 1
        : 2;
  return [...matches].sort((a, b) => rank(a) - rank(b))[0];
}

export async function findActiveBookingForTrip(
  tripId: string
): Promise<Booking | null> {
  const response = await listMyBookings({ tripId, limit: 50 });
  return pickActiveBookingForTrip(response.data.bookings, tripId);
}

/** GET /api/bookings/me */
export async function listMyBookings(params?: {
  status?: BookingStatusFilter;
  page?: number;
  limit?: number;
  tripId?: string;
}) {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params?.tripId) query.set("tripId", params.tripId);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  const response = await apiRequest<{
    bookings?: Record<string, unknown>[];
    pagination?: BookingsListResult["pagination"];
  }>(`/api/bookings/me${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: bearerHeaders(),
  });

  const raw = response.data?.bookings ?? [];
  return {
    ...response,
    data: {
      bookings: raw.map(mapBookingFromApi),
      pagination: response.data?.pagination ?? {
        page: 1,
        limit: 20,
        total: raw.length,
        pages: 1,
      },
    } satisfies BookingsListResult,
  };
}

/** Build selectedAddOns payload from checked addon ids. */
export function buildSelectedAddOns(
  tripAddOnIds: string[],
  selectedIds: string[]
): SelectedAddOnInput[] {
  return tripAddOnIds.map((addOnId) => ({
    addOnId,
    selected: selectedIds.includes(addOnId),
    quantity: 1,
  }));
}
