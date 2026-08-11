import { apiRequest } from "./client";
import { getOrganizerToken } from "./auth-token";
import { FALLBACK_TRIP_IMAGE, resolveMediaUrl } from "./media";
import type {
  ItineraryDay,
  RefundPolicy,
  Trip,
  TripCategory,
  TripStatus,
} from "@/lib/types";
import type { TripForm } from "@/lib/trip-form-utils";
import { tripPathSlug } from "@/lib/tenant-host";

const PLACEHOLDER_IMAGE = FALLBACK_TRIP_IMAGE;

export type DepositDueOption =
  | "at_booking"
  | "7_days_before"
  | "14_days_before"
  | "30_days_before";

export type TripVisibility = "public" | "private";

export type TripFormOptions = {
  depositDueOptions: DepositDueOption[];
  refundPolicies: string[];
  refundPolicyUi: {
    value: RefundPolicy;
    label: string;
    mapsTo: string;
  }[];
  statuses: TripStatus[];
  visibilityOptions: TripVisibility[];
  pricingRates: string[];
  galleryLimit: number;
  maxImageBytes: number;
};

export type TripAnalyticsData = {
  tripId?: string;
  views: number;
  bookClicks: number;
  checkoutStarts: number;
  confirmedBookings: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  funnel: {
    step: string;
    label: string;
    value: number;
    pct: number;
  }[];
  insight: string | null;
  repeatBookers?: number;
};

export type TripBookingPayment = {
  reference: string;
  amount: number;
  paidAt?: string;
  channel?: string;
  paymentMethod?: string;
  status?: string;
};

export type TripBookingGuest = {
  fullName: string;
  email?: string;
  phone?: string;
  isLead?: boolean;
};

export type TripBookingRow = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  location?: string;
  bookingType?: string;
  partySize: number;
  guests: TripBookingGuest[];
  /** Booking lifecycle: confirmed, cancelled, etc. */
  bookingStatus: string;
  /** Payment state from API: paid, deposit_paid, pending, etc. */
  paymentStatus: string;
  /**
   * Normalized bucket for UI filters:
   * paid | partial | pending | cancelled | refunded
   */
  status: "paid" | "partial" | "pending" | "cancelled" | "refunded" | string;
  currency: string;
  totalAmount: number;
  amountPaid: number;
  remainingBalance: number;
  balanceDue?: number;
  balanceDueDate?: string;
  paymentNote?: string;
  paymentMethod?: string;
  paymentChannel?: string;
  paystackReference?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
  payments: TripBookingPayment[];
  /** @deprecated Prefer totalAmount */
  amount: number;
  /** @deprecated Prefer partySize */
  travelers?: number;
};

export type TripBookingsResult = {
  trip: { id: string; title: string };
  bookings: TripBookingRow[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type TripsListResult = {
  trips: Trip[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export type CreateTripFiles = {
  coverImage?: File | null;
  gallery?: File[];
  flyer?: File | null;
};

export type CreateTripInput = {
  form: TripForm;
  addOns: { name: string; price: string; perPerson?: boolean }[];
  status: TripStatus;
  files?: CreateTripFiles;
  contact?: { phone?: string; email?: string };
  tags?: string[];
  depositDue?: DepositDueOption;
  visibility?: TripVisibility;
};

export type UpdateTripInput = {
  form: TripForm;
  addOns: { name: string; price: string; perPerson?: boolean }[];
  status?: TripStatus;
  files?: CreateTripFiles;
  contact?: { phone?: string; email?: string };
  tags?: string[];
  depositDue?: DepositDueOption;
  visibility?: TripVisibility;
  earlyBirdPrice?: number;
  earlyBirdDeadline?: string;
};

export type PublishTripInput = {
  /** Backend accepts `publish` or `live` for going public. Prefer `publish`. */
  action: "publish" | "live" | "schedule" | "draft";
  visibility?: TripVisibility;
  publishConfirmed?: boolean;
  scheduledPublishAt?: string;
};

/** Raw trip payload from the organizer trips API. */
export type OrganizerTripApiData = {
  id: string;
  organizerId?: string;
  title?: string;
  slug?: string;
  destination?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  tags?: string[];
  organizerContactPhone?: string;
  organizerContactEmail?: string;
  description?: string;
  highlights?: string[];
  included?: string[];
  excluded?: string[];
  difficulty?: Trip["difficulty"];
  minCapacity?: number | null;
  maxCapacity?: number | null;
  capacity?: number | null;
  isUnlimitedCapacity?: boolean;
  departurePoint?: string;
  meetingPointDetails?: string;
  meetingPoint?: string;
  departureTime?: string;
  expectedReturnTime?: string;
  returnTime?: string;
  pricePerPerson?: number;
  price?: number;
  couplePrice?: number | null;
  groupPrice?: number | null;
  groupSize?: number | null;
  offerCouplePrice?: boolean;
  offerGroupPrice?: boolean;
  depositAmount?: number;
  depositDue?: DepositDueOption;
  addOns?: {
    _id?: string;
    id?: string;
    name: string;
    price: number;
    perPerson?: boolean;
  }[];
  refundPolicy?: string;
  refundPercentage?: number | null;
  cancellationDeadlineDays?: number;
  refundDeadlineDays?: number;
  refundPolicySummary?: string;
  itinerary?: {
    _id?: string;
    day: number;
    title: string;
    activities: string[];
  }[];
  status?: TripStatus;
  /** Public payloads: false when status is not live. */
  isBookable?: boolean;
  visibility?: TripVisibility;
  publishConfirmed?: boolean;
  scheduledPublishAt?: string | null;
  durationDays?: number;
  coverImage?: string | null;
  gallery?: string[];
  images?: string[];
  flyer?: string | null;
  seatsBooked?: number;
  booked?: number;
  bookingsCount?: number;
  seatsAvailable?: number | null;
  viewsCount?: number;
  views?: number;
  conversions?: number;
  revenue?: number;
  potentialRevenue?: number;
  analytics?: TripAnalyticsData;
  bookings?: unknown[];
  bookingsSummary?: {
    total: number;
    confirmed: number;
    pendingPayment: number;
    cancelled: number;
    refunded: number;
    totalTravelers: number;
    totalPaid: number;
  };
  createdAt?: string;
  updatedAt?: string;
};

function bearerHeaders(): HeadersInit {
  const token = getOrganizerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function toDateInput(value?: string): string {
  if (!value) return "";
  return value.slice(0, 10);
}

function mapRefundPolicyToUi(value?: string): RefundPolicy {
  switch (value) {
    case "fully_refundable":
    case "full":
      return "full";
    case "non_refundable":
    case "none":
      return "none";
    case "partially_refundable":
    case "partial":
    default:
      return "partial";
  }
}

function parseLines(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formItineraryPayload(days: TripForm["itinerary"]) {
  return days
    .map((d, i) => ({
      day: d.day || i + 1,
      title: d.title.trim() || `Day ${i + 1}`,
      activities: parseLines(d.activities),
    }))
    .filter((d) => d.title || d.activities.length > 0);
}

function addOnsPayload(
  addOns: { name: string; price: string; perPerson?: boolean }[]
) {
  return addOns
    .filter((a) => a.name.trim())
    .map((a) => ({
      name: a.name.trim(),
      price: Number(a.price) || 0,
      perPerson: a.perPerson ?? true,
    }));
}

/** Map API trip → UI Trip model. */
export function mapOrganizerTripFromApi(data: OrganizerTripApiData): Trip {
  const galleryUrls = (data.gallery ?? [])
    .map((u) => resolveMediaUrl(u))
    .filter((u): u is string => Boolean(u));
  const imageUrls = (data.images ?? [])
    .map((u) => resolveMediaUrl(u))
    .filter((u): u is string => Boolean(u));
  const cover =
    resolveMediaUrl(data.coverImage) ??
    imageUrls[0] ??
    galleryUrls[0] ??
    PLACEHOLDER_IMAGE;

  const images =
    imageUrls.length > 0
      ? imageUrls
      : galleryUrls.length > 0
        ? [cover, ...galleryUrls.filter((u) => u !== cover)]
        : cover
          ? [cover]
          : [];

  const booked =
    data.seatsBooked ??
    data.booked ??
    data.bookingsCount ??
    data.bookingsSummary?.total ??
    0;
  const capacity =
    data.maxCapacity != null
      ? data.maxCapacity
      : data.capacity != null
        ? data.capacity
        : null;
  const isUnlimitedCapacity =
    data.isUnlimitedCapacity === true || capacity == null;
  const price = data.pricePerPerson ?? data.price ?? 0;

  return {
    id: String(data.id ?? ""),
    title: data.title ?? "",
    slug: data.slug,
    destination: data.destination ?? "",
    category: (data.category as TripCategory) || "adventure",
    image: cover,
    images,
    startDate: toDateInput(data.startDate),
    endDate: toDateInput(data.endDate),
    price,
    couplePrice: data.couplePrice ?? undefined,
    groupPrice: data.groupPrice ?? undefined,
    groupSize: data.groupSize ?? undefined,
    depositAmount: data.depositAmount ?? 0,
    capacity,
    isUnlimitedCapacity,
    booked,
    minCapacity: data.minCapacity ?? 1,
    organizerId: data.organizerId ?? "",
    description: data.description ?? "",
    highlights: data.highlights ?? [],
    included: data.included ?? [],
    excluded: data.excluded ?? [],
    itinerary: (data.itinerary ?? []).map(
      (d): ItineraryDay => ({
        day: d.day,
        title: d.title,
        activities: d.activities ?? [],
      })
    ),
    difficulty: data.difficulty,
    meetingPoint: data.meetingPointDetails ?? data.meetingPoint,
    departurePoint: data.departurePoint,
    departureTime: data.departureTime,
    returnTime: data.expectedReturnTime ?? data.returnTime,
    status: data.status ?? "draft",
    isBookable:
      typeof data.isBookable === "boolean"
        ? data.isBookable
        : (data.status ?? "draft") === "live",
    rating: 0,
    reviewCount: 0,
    reviews: [],
    addOns: (data.addOns ?? []).map((a, i) => ({
      id: a.id ?? a._id ?? `addon-${i}`,
      name: a.name,
      price: a.price,
      perPerson: a.perPerson,
    })),
    views: data.viewsCount ?? data.views ?? data.analytics?.views ?? 0,
    conversions:
      data.conversions ?? data.analytics?.conversions ?? data.analytics?.confirmedBookings ?? 0,
    refundPolicy: mapRefundPolicyToUi(data.refundPolicy),
    refundDeadlineDays:
      data.cancellationDeadlineDays ?? data.refundDeadlineDays ?? 14,
    refundPercentage: data.refundPercentage ?? undefined,
    refundPolicySummary: data.refundPolicySummary?.trim() || undefined,
    depositDue: data.depositDue,
    visibility: data.visibility,
    tags: data.tags,
    offerCouplePrice: data.offerCouplePrice,
    offerGroupPrice: data.offerGroupPrice,
    seatsAvailable:
      data.seatsAvailable === null
        ? null
        : typeof data.seatsAvailable === "number"
          ? data.seatsAvailable
          : undefined,
    durationDays:
      typeof data.durationDays === "number" && data.durationDays > 0
        ? data.durationDays
        : undefined,
    scheduledPublishAt: data.scheduledPublishAt
      ? String(data.scheduledPublishAt)
      : undefined,
    analytics: data.analytics,
    isFavorited: (data as { isFavorited?: boolean }).isFavorited,
  };
}

function appendTripFields(
  formData: FormData,
  input: {
    form: TripForm;
    addOns: { name: string; price: string; perPerson?: boolean }[];
    action?: string;
    contact?: { phone?: string; email?: string };
    tags?: string[];
    depositDue?: DepositDueOption;
    visibility?: TripVisibility;
  }
) {
  const { form, addOns, action, contact, tags, depositDue, visibility } = input;

  if (action) formData.append("action", action);

  formData.append("title", form.title.trim());
  formData.append("destination", form.destination.trim());
  if (form.category) formData.append("category", form.category);
  formData.append("startDate", form.startDate);
  formData.append("endDate", form.endDate);
  formData.append(
    "slug",
    tripPathSlug(form.slug.trim() || form.title.trim())
  );
  formData.append("description", form.description.trim());
  formData.append("highlights", form.highlights);
  formData.append("included", form.included);
  formData.append("excluded", form.excluded);
  formData.append("difficulty", form.difficulty);
  formData.append("minCapacity", form.minCapacity || "1");
  // Empty max travelers → unlimited (backend sets maxCapacity: null).
  formData.append("maxCapacity", form.maxCapacity.trim());
  formData.append("departurePoint", form.departurePoint.trim());
  formData.append("meetingPointDetails", form.meetingPoint.trim());
  formData.append("departureTime", form.departureTime);
  formData.append("expectedReturnTime", form.returnTime);
  formData.append("pricePerPerson", form.price || "0");
  formData.append("offerCouplePrice", String(form.offerCouplePrice));
  if (form.offerCouplePrice && form.couplePrice) {
    formData.append("couplePrice", form.couplePrice);
  }
  formData.append("offerGroupPrice", String(form.offerGroupPrice));
  if (form.offerGroupPrice && form.groupPrice) {
    formData.append("groupPrice", form.groupPrice);
  }
  if (form.offerGroupPrice && form.groupSize) {
    formData.append("groupSize", form.groupSize);
  }
  formData.append("depositAmount", form.depositAmount || "0");
  formData.append("depositDue", depositDue ?? "at_booking");
  formData.append("refundPolicy", form.refundPolicy);
  if (form.refundPolicy === "partial") {
    formData.append("refundPercentage", form.refundPercentage || "50");
  }
  formData.append(
    "cancellationDeadlineDays",
    form.refundDeadlineDays || "14"
  );
  formData.append(
    "visibility",
    visibility ??
      (action === "publish" || action === "live" ? "public" : "private")
  );
  formData.append("addOns", JSON.stringify(addOnsPayload(addOns)));
  formData.append("itinerary", JSON.stringify(formItineraryPayload(form.itinerary)));

  if (tags?.length) {
    formData.append("tags", tags.join(", "));
  }
  if (contact?.phone) {
    formData.append("organizerContactPhone", contact.phone);
  }
  if (contact?.email) {
    formData.append("organizerContactEmail", contact.email);
  }
}

function appendFiles(formData: FormData, files?: CreateTripFiles) {
  if (!files) return;
  if (files.coverImage) {
    formData.append("coverImage", files.coverImage, files.coverImage.name);
  }
  if (files.gallery?.length) {
    for (const file of files.gallery.slice(0, 6)) {
      formData.append("gallery", file, file.name);
    }
  }
  if (files.flyer) {
    formData.append("flyer", files.flyer, files.flyer.name);
  }
}

/** Create-trip API expects `publish` (not `live`) to push the trip public. */
function createActionForStatus(status: TripStatus): string {
  if (status === "live") return "publish";
  if (status === "scheduled") return "schedule";
  return "draft";
}

/** GET /api/organizer/trips/options */
export function getOrganizerTripOptions() {
  return apiRequest<TripFormOptions>("/api/organizer/trips/options", {
    method: "GET",
    headers: bearerHeaders(),
  });
}

/** GET /api/organizer/trips */
export async function listOrganizerTrips(params?: {
  status?: TripStatus | "all";
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  const response = await apiRequest<{
    trips: OrganizerTripApiData[];
    pagination: TripsListResult["pagination"];
  }>(`/api/organizer/trips${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: bearerHeaders(),
  });

  return {
    ...response,
    data: {
      trips: (response.data?.trips ?? []).map(mapOrganizerTripFromApi),
      pagination: response.data?.pagination ?? {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    } satisfies TripsListResult,
  };
}

/** GET /api/organizer/trips/:id */
export async function getOrganizerTrip(id: string) {
  const response = await apiRequest<OrganizerTripApiData>(
    `/api/organizer/trips/${id}`,
    {
      method: "GET",
      headers: bearerHeaders(),
    }
  );
  return {
    ...response,
    data: response.data ? mapOrganizerTripFromApi(response.data) : undefined,
    raw: response.data,
  };
}

/** GET /api/organizer/trips/:id/analytics */
export function getOrganizerTripAnalytics(id: string) {
  return apiRequest<TripAnalyticsData>(
    `/api/organizer/trips/${id}/analytics`,
    {
      method: "GET",
      headers: bearerHeaders(),
    }
  );
}

/** GET /api/organizer/trips/:id/bookings */
export async function getOrganizerTripBookings(
  id: string,
  params?: { status?: string; page?: number; limit?: number }
) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  const response = await apiRequest<{
    trip: { id: string; title: string };
    bookings: Record<string, unknown>[];
    pagination: TripBookingsResult["pagination"];
  }>(`/api/organizer/trips/${id}/bookings${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: bearerHeaders(),
  });

  const bookings = (response.data?.bookings ?? []).map(mapBookingRow);

  return {
    ...response,
    data: {
      trip: response.data?.trip ?? { id, title: "" },
      bookings,
      pagination: response.data?.pagination ?? {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    } satisfies TripBookingsResult,
  };
}

function mapBookingRow(raw: Record<string, unknown>): TripBookingRow {
  const travelerNested =
    (raw.traveler as Record<string, unknown> | undefined) ??
    (raw.user as Record<string, unknown> | undefined) ??
    {};
  const travelerIdRaw = raw.travelerId;
  const travelerFromId =
    travelerIdRaw && typeof travelerIdRaw === "object"
      ? (travelerIdRaw as Record<string, unknown>)
      : {};
  const traveler = { ...travelerFromId, ...travelerNested };

  const pricing =
    (raw.pricing as Record<string, unknown> | undefined) ?? {};

  const name =
    String(
      raw.name ??
        raw.travelerName ??
        traveler.fullName ??
        traveler.name ??
        "Traveler"
    ).trim() || "Traveler";

  const email = String(
    raw.email ?? raw.travelerEmail ?? traveler.email ?? ""
  ).trim();

  const phoneRaw =
    raw.phone ?? raw.travelerPhone ?? traveler.phone ?? undefined;
  const phone = phoneRaw != null ? String(phoneRaw).trim() || undefined : undefined;

  const whatsappRaw = raw.whatsapp ?? traveler.whatsapp ?? phone;
  const whatsapp =
    whatsappRaw != null ? String(whatsappRaw).trim() || undefined : undefined;

  const locationRaw = raw.location ?? traveler.location;
  const location =
    locationRaw != null ? String(locationRaw).trim() || undefined : undefined;

  const bookingStatus = String(raw.status ?? "").toLowerCase();
  const paymentStatusRaw = String(
    raw.paymentStatus ?? pricing.paymentStatus ?? ""
  ).toLowerCase();

  const totalAmount = Number(
    pricing.totalAmount ??
      raw.totalAmount ??
      raw.amount ??
      raw.price ??
      0
  );
  const amountPaid = Number(
    raw.amountPaid ?? pricing.amountPaid ?? raw.paidAmount ?? 0
  );
  const remainingBalance = Number(
    raw.remainingBalance ??
      pricing.remainingBalance ??
      pricing.balanceDue ??
      Math.max(0, totalAmount - amountPaid)
  );
  const balanceDue = Number(
    pricing.balanceDue ?? raw.balanceDue ?? remainingBalance
  );

  let status: TripBookingRow["status"] = "pending";
  if (
    bookingStatus === "cancelled" ||
    paymentStatusRaw === "cancelled"
  ) {
    status = "cancelled";
  } else if (
    bookingStatus === "refunded" ||
    paymentStatusRaw === "refunded"
  ) {
    status = "refunded";
  } else if (
    paymentStatusRaw === "paid" ||
    paymentStatusRaw === "fully_paid" ||
    (amountPaid > 0 && remainingBalance <= 0)
  ) {
    status = "paid";
  } else if (
    paymentStatusRaw === "deposit_paid" ||
    paymentStatusRaw === "partial" ||
    (amountPaid > 0 && remainingBalance > 0)
  ) {
    status = "partial";
  } else if (bookingStatus === "confirmed" && amountPaid <= 0) {
    status = "pending";
  }

  const guestsRaw = Array.isArray(raw.guests) ? raw.guests : [];
  const guests: TripBookingGuest[] = guestsRaw.map((g) => {
    const row = (g ?? {}) as Record<string, unknown>;
    return {
      fullName: String(row.fullName ?? row.name ?? "").trim(),
      email: row.email ? String(row.email) : undefined,
      phone: row.phone ? String(row.phone) : undefined,
      isLead: Boolean(row.isLead),
    };
  }).filter((g) => g.fullName);

  const paymentsRaw = Array.isArray(raw.payments) ? raw.payments : [];
  const payments: TripBookingPayment[] = paymentsRaw.map((p) => {
    const row = (p ?? {}) as Record<string, unknown>;
    return {
      reference: String(row.reference ?? ""),
      amount: Number(row.amount ?? 0),
      paidAt: row.paidAt ? String(row.paidAt) : undefined,
      channel: row.channel ? String(row.channel) : undefined,
      paymentMethod: row.paymentMethod
        ? String(row.paymentMethod)
        : undefined,
      status: row.status ? String(row.status) : undefined,
    };
  });

  const partySize = Number(
    raw.partySize ??
      pricing.partySize ??
      raw.travelers ??
      (guests.length > 0 ? guests.length : 1)
  );

  const currency = String(
    pricing.currency ?? raw.currency ?? "GHS"
  ).toUpperCase();

  return {
    id: String(raw.id ?? raw._id ?? `${email}-${name}`),
    name,
    email,
    phone,
    whatsapp,
    location,
    bookingType: raw.bookingType ? String(raw.bookingType) : undefined,
    partySize: Number.isFinite(partySize) && partySize > 0 ? partySize : 1,
    guests,
    bookingStatus: bookingStatus || "confirmed",
    paymentStatus: paymentStatusRaw || status,
    status,
    currency,
    totalAmount,
    amountPaid,
    remainingBalance,
    balanceDue: Number.isFinite(balanceDue) ? balanceDue : undefined,
    balanceDueDate: pricing.balanceDueDate
      ? String(pricing.balanceDueDate)
      : raw.balanceDueDate
        ? String(raw.balanceDueDate)
        : undefined,
    paymentNote: pricing.paymentNote
      ? String(pricing.paymentNote)
      : raw.paymentNote
        ? String(raw.paymentNote)
        : undefined,
    paymentMethod: raw.paymentMethod
      ? String(raw.paymentMethod)
      : payments[0]?.paymentMethod,
    paymentChannel: raw.paymentChannel
      ? String(raw.paymentChannel)
      : payments[0]?.channel,
    paystackReference: raw.paystackReference
      ? String(raw.paystackReference)
      : payments[0]?.reference || undefined,
    paidAt: raw.paidAt
      ? String(raw.paidAt)
      : payments.find((p) => p.paidAt)?.paidAt,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
    payments,
    amount: totalAmount,
    travelers: Number.isFinite(partySize) && partySize > 0 ? partySize : 1,
  };
}

/** POST /api/organizer/trips (multipart) */
export async function createOrganizerTrip(input: CreateTripInput) {
  const formData = new FormData();
  const action = createActionForStatus(input.status);
  appendTripFields(formData, {
    form: input.form,
    addOns: input.addOns,
    action,
    contact: input.contact,
    tags: input.tags,
    depositDue: input.depositDue,
    visibility:
      input.visibility ??
      (action === "publish" || action === "schedule" ? "public" : "private"),
  });
  appendFiles(formData, input.files);

  const response = await apiRequest<OrganizerTripApiData>(
    "/api/organizer/trips",
    {
      method: "POST",
      headers: bearerHeaders(),
      body: formData,
    }
  );

  let trip = response.data
    ? mapOrganizerTripFromApi(response.data)
    : undefined;

  // Ensure live/scheduled when create action was ignored or only partially applied.
  if (
    trip &&
    input.status === "live" &&
    trip.status !== "live"
  ) {
    const published = await publishOrganizerTrip(trip.id, {
      action: "publish",
      visibility: "public",
      publishConfirmed: true,
    });
    trip = published.data ?? { ...trip, status: "live", visibility: "public" };
  } else if (trip && input.status === "scheduled") {
    const published = await publishOrganizerTrip(trip.id, {
      action: "schedule",
      visibility: "public",
      publishConfirmed: true,
      scheduledPublishAt: new Date(input.form.startDate).toISOString(),
    });
    trip = published.data ?? trip;
  }

  return { ...response, data: trip };
}

/** PATCH /api/organizer/trips/:id — JSON field updates (and optional multipart files). */
export async function updateOrganizerTrip(id: string, input: UpdateTripInput) {
  const hasFiles =
    Boolean(input.files?.coverImage) ||
    Boolean(input.files?.gallery?.length) ||
    Boolean(input.files?.flyer);

  if (hasFiles) {
    const formData = new FormData();
    appendTripFields(formData, {
      form: input.form,
      addOns: input.addOns,
      contact: input.contact,
      tags: input.tags,
      depositDue: input.depositDue,
      visibility: input.visibility,
    });
    appendFiles(formData, input.files);

    const response = await apiRequest<OrganizerTripApiData>(
      `/api/organizer/trips/${id}`,
      {
        method: "PATCH",
        headers: bearerHeaders(),
        body: formData,
      }
    );

    let trip = response.data
      ? mapOrganizerTripFromApi(response.data)
      : undefined;

    if (
      trip &&
      input.status &&
      (input.status === "live" ||
        input.status === "draft" ||
        input.status === "scheduled") &&
      input.status !== trip.status
    ) {
      const published = await publishOrganizerTrip(id, {
        action:
          input.status === "live"
            ? "publish"
            : input.status === "scheduled"
              ? "schedule"
              : "draft",
        visibility: input.status === "draft" ? "private" : "public",
        publishConfirmed: input.status !== "draft",
        scheduledPublishAt:
          input.status === "scheduled"
            ? new Date(input.form.startDate).toISOString()
            : undefined,
      });
      trip = published.data ?? { ...trip, status: input.status };
    }

    return { ...response, data: trip };
  }

  const body: Record<string, unknown> = {
    title: input.form.title.trim(),
    destination: input.form.destination.trim(),
    category: input.form.category || undefined,
    startDate: input.form.startDate,
    endDate: input.form.endDate,
    slug: tripPathSlug(input.form.slug.trim() || input.form.title.trim()),
    description: input.form.description.trim(),
    highlights: parseLines(input.form.highlights),
    included: parseLines(input.form.included),
    excluded: parseLines(input.form.excluded),
    difficulty: input.form.difficulty,
    minCapacity: Number(input.form.minCapacity) || 1,
    maxCapacity: input.form.maxCapacity.trim()
      ? Number(input.form.maxCapacity)
      : null,
    departurePoint: input.form.departurePoint.trim(),
    meetingPointDetails: input.form.meetingPoint.trim(),
    departureTime: input.form.departureTime,
    expectedReturnTime: input.form.returnTime,
    pricePerPerson: Number(input.form.price) || 0,
    offerCouplePrice: input.form.offerCouplePrice,
    couplePrice:
      input.form.offerCouplePrice && input.form.couplePrice
        ? Number(input.form.couplePrice)
        : null,
    offerGroupPrice: input.form.offerGroupPrice,
    groupPrice:
      input.form.offerGroupPrice && input.form.groupPrice
        ? Number(input.form.groupPrice)
        : null,
    groupSize:
      input.form.offerGroupPrice && input.form.groupSize
        ? Number(input.form.groupSize)
        : null,
    depositAmount: Number(input.form.depositAmount) || 0,
    depositDue: input.depositDue ?? "at_booking",
    refundPolicy: input.form.refundPolicy,
    refundPercentage:
      input.form.refundPolicy === "partial"
        ? Number(input.form.refundPercentage) || 50
        : null,
    cancellationDeadlineDays: Number(input.form.refundDeadlineDays) || 14,
    visibility: input.visibility,
    addOns: addOnsPayload(input.addOns),
    itinerary: formItineraryPayload(input.form.itinerary),
  };

  if (input.contact?.phone) {
    body.organizerContactPhone = input.contact.phone;
  }
  if (input.contact?.email) {
    body.organizerContactEmail = input.contact.email;
  }
  if (input.tags) body.tags = input.tags;
  if (input.earlyBirdPrice != null) body.earlyBirdPrice = input.earlyBirdPrice;
  if (input.earlyBirdDeadline) {
    body.earlyBirdDeadline = input.earlyBirdDeadline;
  }
  if (
    input.status === "completed" ||
    input.status === "cancelled"
  ) {
    body.status = input.status;
  }

  const response = await apiRequest<OrganizerTripApiData>(
    `/api/organizer/trips/${id}`,
    {
      method: "PATCH",
      headers: bearerHeaders(),
      body: JSON.stringify(body),
    }
  );

  let trip = response.data
    ? mapOrganizerTripFromApi(response.data)
    : undefined;

  if (
    trip &&
    input.status &&
    (input.status === "live" ||
      input.status === "draft" ||
      input.status === "scheduled") &&
    input.status !== trip.status
  ) {
    const published = await publishOrganizerTrip(id, {
      action:
        input.status === "live"
          ? "publish"
          : input.status === "scheduled"
            ? "schedule"
            : "draft",
      visibility: input.status === "draft" ? "private" : "public",
      publishConfirmed: input.status !== "draft",
      scheduledPublishAt:
        input.status === "scheduled"
          ? new Date(input.form.startDate).toISOString()
          : undefined,
    });
    trip = published.data ?? { ...trip, status: input.status };
  }

  return { ...response, data: trip };
}

/** PATCH /api/organizer/trips/:id/publish */
export async function publishOrganizerTrip(id: string, input: PublishTripInput) {
  const response = await apiRequest<OrganizerTripApiData>(
    `/api/organizer/trips/${id}/publish`,
    {
      method: "PATCH",
      headers: bearerHeaders(),
      body: JSON.stringify(input),
    }
  );
  return {
    ...response,
    data: response.data ? mapOrganizerTripFromApi(response.data) : undefined,
  };
}

/** PATCH /api/organizer/trips/:id — arbitrary JSON fields. */
export async function patchOrganizerTripFields(
  id: string,
  fields: Record<string, unknown>
) {
  const response = await apiRequest<OrganizerTripApiData>(
    `/api/organizer/trips/${id}`,
    {
      method: "PATCH",
      headers: bearerHeaders(),
      body: JSON.stringify(fields),
    }
  );
  return {
    ...response,
    data: response.data ? mapOrganizerTripFromApi(response.data) : undefined,
  };
}

/** DELETE /api/organizer/trips/:id */
export function deleteOrganizerTrip(id: string) {
  return apiRequest<{ id?: string }>(`/api/organizer/trips/${id}`, {
    method: "DELETE",
    headers: bearerHeaders(),
  });
}
