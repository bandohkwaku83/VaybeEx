import { apiRequest } from "./client";
import { getAdminToken } from "./auth-token";
import { resolveMediaUrl } from "./media";

function bearerHeaders(): HeadersInit {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function asId(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  if (typeof value === "string" || typeof value === "number") {
    const id = String(value).trim();
    return id && id !== "null" && id !== "undefined" ? id : undefined;
  }
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    return asId(obj.id ?? obj._id);
  }
  return undefined;
}

export type AdminPagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type AdminOrganizerStatus = "pending" | "approved" | "rejected" | string;

export type AdminReviewStatus = "pending" | "approved" | "rejected" | null;

export type AdminOrganizerReview = {
  status: AdminReviewStatus;
  canApprove: boolean;
  canReject: boolean;
  isResubmission: boolean;
  rejectionReason: string | null;
  previousRejectionReason: string | null;
  resubmittedAt: string | null;
  resubmissionCount: number;
};

export type AdminReviewQueue =
  | "pending_approval"
  | "resubmitted"
  | "rejected";

export type AdminLoginDevice = {
  label?: string;
  type?: "mobile" | "tablet" | "desktop" | string;
  os?: string;
  browser?: string;
};

export type AdminUser = {
  id: string;
  fullName?: string;
  email: string;
  phone?: string;
  location?: string;
  whatsapp?: string;
  role: "traveler" | "organizer" | string;
  isVerified?: boolean;
  authProvider?: string;
  createdAt?: string;
  updatedAt?: string;
  /** Organizer fields */
  profilePhoto?: string | null;
  brandLogo?: string | null;
  businessName?: string;
  brandSlug?: string;
  aboutYou?: string;
  tripSpecialties?: string[];
  nationalIdPhoto?: string | null;
  onboardingCompleted?: boolean;
  status?: AdminOrganizerStatus;
  rejectionReason?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  review?: AdminOrganizerReview;
  stats?: {
    trips?: {
      draft: number;
      scheduled: number;
      live: number;
      completed: number;
      cancelled: number;
      total: number;
    };
    withdrawals?: {
      pending: number;
      processing: number;
      success: number;
      failed: number;
      totalAmount: number;
    };
    bookings?: {
      pending_payment: number;
      confirmed: number;
      cancelled: number;
      refunded: number;
      total: number;
    };
    refunds?: {
      pending: number;
      processing: number;
      refunded: number;
      denied: number;
      total: number;
      refundedAmount: number;
    };
  };
  lastLoginAt?: string;
  lastLoginIp?: string | null;
  lastLoginDevice?: AdminLoginDevice | null;
  recentActivity?: AdminActivityItem[];
};

export type AdminDashboard = {
  travelers: { total: number; verified: number };
  organizers: {
    total: number;
    pendingApproval: number;
    resubmitted: number;
    approved: number;
    rejected: number;
    incompleteSetup: number;
  };
  trips: {
    draft: number;
    scheduled: number;
    live: number;
    completed: number;
    cancelled: number;
  };
  bookings: {
    pending_payment: number;
    confirmed: number;
    cancelled: number;
    refunded: number;
  };
  withdrawals: {
    counts: {
      pending: number;
      processing: number;
      success: number;
      failed: number;
    };
    amounts: {
      pending: number;
      processing: number;
      success: number;
      failed: number;
    };
  };
  cancellations: {
    awaitingReview: number;
    counts: {
      pending: number;
      processing: number;
      refunded: number;
      denied: number;
    };
    amounts: {
      pending: number;
      processing: number;
      refunded: number;
      denied: number;
    };
  };
  messages: {
    campaigns: number;
    delivered: number;
    byChannel: {
      sms: { campaigns: number; delivered: number };
      email: { campaigns: number; delivered: number };
    };
  };
};

export type ListAdminUsersParams = {
  page?: number;
  limit?: number;
  role?: "traveler" | "organizer" | "";
  status?: string;
  q?: string;
  /** KYC queue — `pending` aliases to `pending_approval` */
  queue?: AdminReviewQueue | "pending" | string;
  isVerified?: boolean;
  onboardingCompleted?: boolean;
};

export type ListAdminUsersResult = {
  roleCounts: { traveler: number; organizer: number };
  organizerStatusCounts: {
    pending: number;
    approved: number;
    rejected: number;
    unset: number;
  };
  pendingApprovalCount: number;
  resubmittedCount: number;
  users: AdminUser[];
  pagination: AdminPagination;
};

export type AdminTripOrganizer = {
  id?: string;
  fullName?: string;
  email?: string;
  businessName?: string;
  brandSlug?: string;
  status?: string;
};

export type AdminTrip = {
  id: string;
  title: string;
  destination: string;
  status: string;
  visibility?: string;
  startDate?: string;
  endDate?: string;
  pricePerPerson?: number;
  bookingsCount?: number;
  revenue?: number;
  coverImage?: string | null;
  createdAt?: string;
  organizer?: AdminTripOrganizer | null;
};

export type ListAdminTripsParams = {
  page?: number;
  limit?: number;
  status?: string;
  visibility?: string;
  organizerId?: string;
  q?: string;
};

export type ListAdminTripsResult = {
  trips: AdminTrip[];
  pagination: AdminPagination;
};

export type AdminWithdrawalParty = {
  id?: string;
  fullName?: string;
  email?: string;
  businessName?: string;
  phone?: string;
};

export type AdminWithdrawalTrip = {
  id?: string;
  title?: string;
  destination?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
};

export type AdminWithdrawalProcessedBy = {
  id?: string;
  fullName?: string;
  email?: string;
};

export type AdminWithdrawal = {
  id: string;
  tripId?: string;
  organizerId?: string;
  amount: number;
  currency?: string;
  status: string;
  label?: string;
  processedAt?: string;
  processedBy?: AdminWithdrawalProcessedBy | null;
  note?: string;
  adminNote?: string;
  failureReason?: string;
  payoutMethod?: string;
  momoProvider?: string;
  momoNumber?: string;
  accountName?: string;
  destinationLabel?: string;
  createdAt?: string;
  updatedAt?: string;
  trip?: AdminWithdrawalTrip | null;
  organizer?: AdminWithdrawalParty | null;
};

export type AdminWithdrawalQueue = "awaiting" | "paid" | "rejected";

export type ListAdminWithdrawalsParams = {
  page?: number;
  limit?: number;
  queue?: AdminWithdrawalQueue | string;
  status?: string;
  tripId?: string;
  organizerId?: string;
  momoProvider?: string;
};

export type ListAdminWithdrawalsResult = {
  statusCounts: {
    pending: number;
    processing: number;
    success: number;
    failed: number;
  };
  statusAmounts: {
    pending: number;
    processing: number;
    success: number;
    failed: number;
  };
  withdrawals: AdminWithdrawal[];
  pagination: AdminPagination;
};

function asReviewStatus(value: unknown): AdminReviewStatus {
  const raw = String(value ?? "").toLowerCase().trim();
  if (raw === "pending" || raw === "approved" || raw === "rejected") return raw;
  return null;
}

function asOptionalString(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text || null;
}

export function parseAdminReviewQueue(
  raw: string | null | undefined
): AdminReviewQueue | null {
  if (raw === "pending" || raw === "pending_approval") return "pending_approval";
  if (raw === "resubmitted") return "resubmitted";
  if (raw === "rejected") return "rejected";
  return null;
}

/** Prefer API `review`; fall back to flat status so older payloads still work. */
export function getAdminUserReview(user: AdminUser): AdminOrganizerReview {
  const review = user.review;
  if (review && typeof review === "object") {
    return {
      status: asReviewStatus(review.status ?? user.status),
      canApprove: Boolean(review.canApprove),
      canReject: Boolean(review.canReject),
      isResubmission: Boolean(review.isResubmission),
      rejectionReason:
        asOptionalString(review.rejectionReason) ??
        asOptionalString(user.rejectionReason),
      previousRejectionReason: asOptionalString(review.previousRejectionReason),
      resubmittedAt: asOptionalString(review.resubmittedAt),
      resubmissionCount: Number(review.resubmissionCount) || 0,
    };
  }

  const status = asReviewStatus(user.status);
  const onboarded = Boolean(user.onboardingCompleted);
  const canDecide =
    user.role === "organizer" && onboarded && (status === "pending" || status === "rejected");

  return {
    status,
    canApprove: canDecide,
    canReject: canDecide,
    isResubmission: false,
    rejectionReason: asOptionalString(user.rejectionReason),
    previousRejectionReason: null,
    resubmittedAt: null,
    resubmissionCount: 0,
  };
}

/** Normalize photo fields to same-origin /uploads paths. */
export function mapAdminUser(user: AdminUser): AdminUser {
  const mapped: AdminUser = {
    ...user,
    id: asId(user.id) ?? String(user.id),
    profilePhoto: resolveMediaUrl(user.profilePhoto) ?? null,
    brandLogo: resolveMediaUrl(user.brandLogo) ?? null,
    nationalIdPhoto: resolveMediaUrl(user.nationalIdPhoto) ?? null,
  };
  mapped.review = getAdminUserReview(mapped);
  if (Array.isArray(mapped.recentActivity)) {
    mapped.recentActivity = mapped.recentActivity.map(mapAdminActivityItem);
  }
  return mapped;
}

export function mapAdminTrip(raw: AdminTrip): AdminTrip {
  const organizerRaw = raw.organizer;
  const organizerId = asId(organizerRaw?.id);
  const organizer: AdminTripOrganizer | null =
    organizerRaw && (organizerId || organizerRaw.fullName || organizerRaw.businessName || organizerRaw.email)
      ? {
          ...organizerRaw,
          id: organizerId,
        }
      : null;

  return {
    ...raw,
    id: asId(raw.id) ?? String(raw.id),
    coverImage: resolveMediaUrl(raw.coverImage) ?? null,
    organizer,
  };
}

type NestedRef = {
  _id?: string;
  id?: string;
  title?: string;
  destination?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  fullName?: string;
  email?: string;
  businessName?: string;
  phone?: string;
  organizerId?: string;
};

/**
 * API may return tripId/organizerId as populated objects with `_id`,
 * plus flattened `trip` / `organizer` mirrors.
 */
export function mapAdminWithdrawal(raw: AdminWithdrawal): AdminWithdrawal {
  const tripNested = raw.tripId as unknown as NestedRef | string | undefined;
  const orgNested = raw.organizerId as unknown as NestedRef | string | undefined;

  const tripFromNested =
    tripNested && typeof tripNested === "object"
      ? {
          id: asId(tripNested),
          title: tripNested.title,
          destination: tripNested.destination,
          status: tripNested.status,
          startDate: tripNested.startDate,
          endDate: tripNested.endDate,
        }
      : null;

  const orgFromNested =
    orgNested && typeof orgNested === "object"
      ? {
          id: asId(orgNested),
          fullName: orgNested.fullName,
          email: orgNested.email,
          businessName: orgNested.businessName,
          phone: orgNested.phone,
        }
      : null;

  const trip: AdminWithdrawalTrip | null = raw.trip
    ? {
        ...raw.trip,
        id: asId(raw.trip.id) ?? tripFromNested?.id,
      }
    : tripFromNested;

  const organizer: AdminWithdrawalParty | null = raw.organizer
    ? {
        ...raw.organizer,
        id: asId(raw.organizer.id) ?? orgFromNested?.id,
      }
    : orgFromNested;

  const processedByRaw = raw.processedBy as NestedRef | string | undefined;
  const processedBy =
    processedByRaw && typeof processedByRaw === "object"
      ? {
          id: asId(processedByRaw),
          fullName: processedByRaw.fullName,
          email: processedByRaw.email,
        }
      : raw.processedBy ?? null;

  return {
    ...raw,
    id: asId(raw.id) ?? String(raw.id),
    tripId:
      asId(typeof tripNested === "string" || typeof tripNested === "number" ? tripNested : undefined) ??
      trip?.id,
    organizerId:
      asId(typeof orgNested === "string" || typeof orgNested === "number" ? orgNested : undefined) ??
      organizer?.id,
    trip,
    organizer,
    processedBy,
  };
}

export async function getAdminDashboard() {
  const response = await apiRequest<AdminDashboard>("/api/admin/dashboard", {
    method: "GET",
    headers: bearerHeaders(),
  });
  if (response.data?.organizers) {
    response.data.organizers = {
      ...response.data.organizers,
      resubmitted: Number(response.data.organizers.resubmitted) || 0,
    };
  }
  if (response.data) {
    const c = response.data.cancellations;
    response.data.cancellations = {
      awaitingReview: Number(c?.awaitingReview) || 0,
      counts: {
        pending: Number(c?.counts?.pending) || 0,
        processing: Number(c?.counts?.processing) || 0,
        refunded: Number(c?.counts?.refunded) || 0,
        denied: Number(c?.counts?.denied) || 0,
      },
      amounts: {
        pending: Number(c?.amounts?.pending) || 0,
        processing: Number(c?.amounts?.processing) || 0,
        refunded: Number(c?.amounts?.refunded) || 0,
        denied: Number(c?.amounts?.denied) || 0,
      },
    };
    const m = response.data.messages;
    response.data.messages = {
      campaigns: Number(m?.campaigns) || 0,
      delivered: Number(m?.delivered) || 0,
      byChannel: {
        sms: {
          campaigns: Number(m?.byChannel?.sms?.campaigns) || 0,
          delivered: Number(m?.byChannel?.sms?.delivered) || 0,
        },
        email: {
          campaigns: Number(m?.byChannel?.email?.campaigns) || 0,
          delivered: Number(m?.byChannel?.email?.delivered) || 0,
        },
      },
    };
  }
  return response;
}

export async function listAdminUsers(params: ListAdminUsersParams = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.role) search.set("role", params.role);
  if (params.status) search.set("status", params.status);
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.isVerified === true) search.set("isVerified", "true");
  if (params.isVerified === false) search.set("isVerified", "false");
  if (params.onboardingCompleted === true) {
    search.set("onboardingCompleted", "true");
  }
  if (params.onboardingCompleted === false) {
    search.set("onboardingCompleted", "false");
  }

  const queue = params.queue?.trim();
  if (queue === "pending" || queue === "pending_approval") {
    search.set("queue", "pending_approval");
  } else if (queue) {
    search.set("queue", queue);
  }

  const qs = search.toString();
  const response = await apiRequest<ListAdminUsersResult>(
    `/api/admin/users${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: bearerHeaders() }
  );

  if (response.data) {
    if (response.data.users) {
      response.data.users = response.data.users.map(mapAdminUser);
    }
    response.data.resubmittedCount = Number(response.data.resubmittedCount) || 0;
    response.data.pendingApprovalCount =
      Number(response.data.pendingApprovalCount) || 0;
  }
  return response;
}

export async function getAdminUser(id: string) {
  const response = await apiRequest<{ user: AdminUser }>(
    `/api/admin/users/${encodeURIComponent(id)}`,
    { method: "GET", headers: bearerHeaders() }
  );
  if (response.data?.user) {
    response.data.user = mapAdminUser(response.data.user);
  }
  return response;
}

export type ApproveOrganizerData = {
  user: AdminUser;
  previouslyRejected?: boolean;
};

export async function approveOrganizer(id: string) {
  const response = await apiRequest<ApproveOrganizerData>(
    `/api/admin/organizers/${encodeURIComponent(id)}/approve`,
    { method: "POST", headers: bearerHeaders() }
  );
  if (response.data?.user) {
    response.data.user = mapAdminUser(response.data.user);
  }
  return response;
}

export async function rejectOrganizer(id: string, input: { reason: string }) {
  const response = await apiRequest<{ user: AdminUser }>(
    `/api/admin/organizers/${encodeURIComponent(id)}/reject`,
    {
      method: "POST",
      headers: bearerHeaders(),
      body: JSON.stringify({
        reason: input.reason.trim(),
      }),
    }
  );
  if (response.data?.user) {
    response.data.user = mapAdminUser(response.data.user);
  }
  return response;
}

export async function listAdminTrips(params: ListAdminTripsParams = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.visibility) search.set("visibility", params.visibility);
  if (params.organizerId) search.set("organizerId", params.organizerId);
  if (params.q?.trim()) search.set("q", params.q.trim());

  const qs = search.toString();
  const response = await apiRequest<ListAdminTripsResult>(
    `/api/admin/trips${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: bearerHeaders() }
  );

  if (response.data?.trips) {
    response.data.trips = response.data.trips.map(mapAdminTrip);
  }
  return response;
}

export async function listAdminWithdrawals(
  params: ListAdminWithdrawalsParams = {}
) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.queue) search.set("queue", params.queue);
  if (params.status) search.set("status", params.status);
  if (params.tripId) search.set("tripId", params.tripId);
  if (params.organizerId) search.set("organizerId", params.organizerId);
  if (params.momoProvider) search.set("momoProvider", params.momoProvider);

  const qs = search.toString();
  const response = await apiRequest<ListAdminWithdrawalsResult>(
    `/api/admin/withdrawals${qs ? `?${qs}` : ""}`,
    { method: "GET", headers: bearerHeaders() }
  );

  if (response.data?.withdrawals) {
    response.data.withdrawals = response.data.withdrawals.map(mapAdminWithdrawal);
  }
  return response;
}

export async function getAdminWithdrawal(id: string) {
  const response = await apiRequest<{ withdrawal: AdminWithdrawal }>(
    `/api/admin/withdrawals/${encodeURIComponent(id)}`,
    { method: "GET", headers: bearerHeaders() }
  );
  if (response.data?.withdrawal) {
    response.data.withdrawal = mapAdminWithdrawal(response.data.withdrawal);
  }
  return response;
}

export function canProcessAdminWithdrawal(status: string) {
  return status === "pending";
}

export function canConfirmAdminWithdrawal(status: string) {
  return status === "pending" || status === "processing";
}

export function canRejectAdminWithdrawal(status: string) {
  return status === "pending" || status === "processing";
}

export async function processAdminWithdrawal(
  id: string,
  input?: { adminNote?: string }
) {
  const response = await apiRequest<{ withdrawal: AdminWithdrawal }>(
    `/api/admin/withdrawals/${encodeURIComponent(id)}/process`,
    {
      method: "POST",
      headers: bearerHeaders(),
      body: JSON.stringify({
        ...(input?.adminNote?.trim()
          ? { adminNote: input.adminNote.trim() }
          : {}),
      }),
    }
  );
  if (response.data?.withdrawal) {
    response.data.withdrawal = mapAdminWithdrawal(response.data.withdrawal);
  }
  return response;
}

export async function confirmAdminWithdrawal(
  id: string,
  input?: { adminNote?: string }
) {
  const response = await apiRequest<{ withdrawal: AdminWithdrawal }>(
    `/api/admin/withdrawals/${encodeURIComponent(id)}/confirm`,
    {
      method: "POST",
      headers: bearerHeaders(),
      body: JSON.stringify({
        ...(input?.adminNote?.trim()
          ? { adminNote: input.adminNote.trim() }
          : {}),
      }),
    }
  );
  if (response.data?.withdrawal) {
    response.data.withdrawal = mapAdminWithdrawal(response.data.withdrawal);
  }
  return response;
}

export async function rejectAdminWithdrawal(
  id: string,
  input: { reason: string; adminNote?: string }
) {
  const response = await apiRequest<{ withdrawal: AdminWithdrawal }>(
    `/api/admin/withdrawals/${encodeURIComponent(id)}/reject`,
    {
      method: "POST",
      headers: bearerHeaders(),
      body: JSON.stringify({
        reason: input.reason.trim(),
        ...(input.adminNote?.trim()
          ? { adminNote: input.adminNote.trim() }
          : {}),
      }),
    }
  );
  if (response.data?.withdrawal) {
    response.data.withdrawal = mapAdminWithdrawal(response.data.withdrawal);
  }
  return response;
}

function adminSearch(
  params?: Record<string, string | number | boolean | undefined>
) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function adminGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
) {
  return apiRequest<T>(`/api/admin${path}${adminSearch(params)}`, {
    method: "GET",
    headers: bearerHeaders(),
  });
}

async function adminPost<T>(
  path: string,
  body?: unknown,
  extraHeaders?: HeadersInit
) {
  return apiRequest<T>(`/api/admin${path}`, {
    method: "POST",
    headers: { ...bearerHeaders(), ...extraHeaders },
    body: body != null ? JSON.stringify(body) : undefined,
  });
}

export const ACTIVITY_LABELS: Record<string, string> = {
  registered: "Signed up",
  logged_in: "Signed in",
  logged_out: "Signed out",
  password_changed: "Changed password",
  profile_updated: "Updated profile",
  profile_completed: "Completed profile",
  kyc_submitted: "Submitted KYC",
  kyc_resubmitted: "Resubmitted KYC",
  kyc_approved: "KYC approved",
  kyc_rejected: "KYC rejected",
  trip_created: "Created trip",
  trip_updated: "Updated trip",
  trip_published: "Published trip",
  trip_scheduled: "Scheduled trip",
  trip_unpublished: "Unpublished trip",
  trip_cancelled: "Cancelled trip",
  trip_completed: "Completed trip",
  trip_deleted: "Deleted trip",
  booking_created: "Started booking",
  booking_paid: "Paid for booking",
  booking_cancelled: "Cancelled booking",
  refund_requested: "Requested refund",
  refund_approved: "Approved refund",
  refund_denied: "Denied refund",
  refund_processed: "Refund sent",
  refund_failed: "Refund failed",
  payout_requested: "Requested withdrawal",
  payout_succeeded: "Withdrawal paid",
  payout_failed: "Withdrawal failed",
  message_sent: "Sent a message",
};

export const REFUND_LABELS: Record<string, string> = {
  pending: "Awaiting review",
  processing: "Sending via Paystack",
  refunded: "Refunded",
  denied: "Denied",
};

export type AdminActivityActor = {
  id?: string;
  role?: string;
  fullName?: string;
  email?: string;
  businessName?: string;
};

export type AdminActivityTrip = {
  id?: string;
  title?: string;
  destination?: string;
  status?: string;
};

export type AdminActivityItem = {
  id: string;
  action: string;
  category: string;
  summary: string;
  createdAt: string;
  loginAt?: string;
  ip?: string | null;
  userAgent?: string | null;
  device?: AdminLoginDevice | null;
  actor?: AdminActivityActor | null;
  relatedUser?: AdminActivityActor | null;
  trip?: AdminActivityTrip | null;
  bookingId?: string;
  cancellationId?: string;
  withdrawalId?: string;
};

export type ListAdminActivityParams = {
  page?: number;
  limit?: number;
  role?: "organizer" | "traveler" | string;
  category?: string;
  action?: string;
  userId?: string;
  tripId?: string;
  from?: string;
  to?: string;
  q?: string;
};

export type ListAdminActivityResult = {
  filters: { actions: string[]; categories: string[] };
  categoryCounts: Record<string, number>;
  activity: AdminActivityItem[];
  pagination: AdminPagination;
};

export type AdminRefundParty = {
  id?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  businessName?: string;
};

export type AdminRefundTrip = {
  id?: string;
  title?: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  coverImage?: string | null;
  refundPolicy?: string;
};

export type AdminPaystackRefund = {
  transactionReference?: string;
  refundId?: string;
  amount?: number;
  currency?: string;
  status?: string;
};

export type AdminRefundPayment = {
  reference?: string;
  amount?: number;
  paidAt?: string;
  channel?: string;
  paymentMethod?: string;
  status?: string;
};

export type AdminRefundBooking = {
  id?: string;
  status?: string;
  paymentStatus?: string;
  bookingType?: string;
  partySize?: number;
  amountPaid?: number;
  refundedAmount?: number;
  paymentMethod?: string;
  payments?: AdminRefundPayment[];
  paidAt?: string;
  createdAt?: string;
};

export type AdminRefund = {
  id: string;
  status: string;
  refundEligible?: boolean;
  amountPaid?: number;
  refundAmount?: number;
  reason?: string;
  requestedAt?: string;
  processedAt?: string;
  paymentMethod?: string;
  refundDestination?: string;
  organizerNote?: string;
  refundFailureReason?: string;
  paystackRefunds?: AdminPaystackRefund[];
  trip?: AdminRefundTrip | null;
  traveler?: AdminRefundParty | null;
  organizer?: AdminRefundParty | null;
  booking?: AdminRefundBooking | null;
};

export type ListAdminRefundsParams = {
  page?: number;
  limit?: number;
  queue?: "awaiting" | string;
  status?: string;
  travelerId?: string;
  organizerId?: string;
  tripId?: string;
  refundEligible?: boolean | string;
  q?: string;
};

export type ListAdminRefundsResult = {
  statusCounts: {
    pending: number;
    processing: number;
    refunded: number;
    denied: number;
  };
  statusAmounts: {
    pending: number;
    processing: number;
    refunded: number;
    denied: number;
  };
  refunds: AdminRefund[];
  pagination: AdminPagination;
};

export function activityLabel(action?: string | null) {
  if (!action) return "Activity";
  return ACTIVITY_LABELS[action] ?? action.replace(/_/g, " ");
}

export function refundLabel(status?: string | null) {
  if (!status) return "Unknown";
  return REFUND_LABELS[status] ?? status.replace(/_/g, " ");
}

export function mapAdminActivityItem(raw: AdminActivityItem): AdminActivityItem {
  return {
    ...raw,
    id: asId(raw.id) ?? String(raw.id),
    actor: raw.actor
      ? { ...raw.actor, id: asId(raw.actor.id) ?? raw.actor.id }
      : raw.actor,
    relatedUser: raw.relatedUser
      ? { ...raw.relatedUser, id: asId(raw.relatedUser.id) ?? raw.relatedUser.id }
      : raw.relatedUser,
    trip: raw.trip
      ? { ...raw.trip, id: asId(raw.trip.id) ?? raw.trip.id }
      : raw.trip,
    bookingId: asId(raw.bookingId) ?? raw.bookingId,
    cancellationId: asId(raw.cancellationId) ?? raw.cancellationId,
    withdrawalId: asId(raw.withdrawalId) ?? raw.withdrawalId,
  };
}

export function mapAdminRefund(raw: AdminRefund): AdminRefund {
  return {
    ...raw,
    id: asId(raw.id) ?? String(raw.id),
    trip: raw.trip
      ? {
          ...raw.trip,
          id: asId(raw.trip.id) ?? raw.trip.id,
          coverImage: resolveMediaUrl(raw.trip.coverImage) ?? null,
        }
      : raw.trip,
    traveler: raw.traveler
      ? { ...raw.traveler, id: asId(raw.traveler.id) ?? raw.traveler.id }
      : raw.traveler,
    organizer: raw.organizer
      ? { ...raw.organizer, id: asId(raw.organizer.id) ?? raw.organizer.id }
      : raw.organizer,
    booking: raw.booking
      ? { ...raw.booking, id: asId(raw.booking.id) ?? raw.booking.id }
      : raw.booking,
  };
}

export async function getAdminActivity(params: ListAdminActivityParams = {}) {
  const response = await adminGet<ListAdminActivityResult>("/activity", params);
  if (response.data) {
    response.data.activity = (response.data.activity ?? []).map(mapAdminActivityItem);
    response.data.filters = {
      actions: response.data.filters?.actions ?? [],
      categories: response.data.filters?.categories ?? [],
    };
    response.data.categoryCounts = response.data.categoryCounts ?? {};
  }
  return response;
}

export async function getAdminActivityById(id: string) {
  const response = await adminGet<{ activity: AdminActivityItem }>(
    `/activity/${encodeURIComponent(id)}`
  );
  if (response.data?.activity) {
    response.data.activity = mapAdminActivityItem(response.data.activity);
  }
  return response;
}

export async function getAdminUserActivity(
  userId: string,
  params: Omit<ListAdminActivityParams, "userId"> = {}
) {
  const response = await adminGet<ListAdminActivityResult>(
    `/users/${encodeURIComponent(userId)}/activity`,
    params
  );
  if (response.data?.activity) {
    response.data.activity = response.data.activity.map(mapAdminActivityItem);
  }
  return response;
}

export async function getAdminRefunds(params: ListAdminRefundsParams = {}) {
  const response = await adminGet<ListAdminRefundsResult>("/refunds", {
    ...params,
    refundEligible:
      params.refundEligible === true
        ? "true"
        : params.refundEligible === false
          ? "false"
          : params.refundEligible,
  });
  if (response.data) {
    response.data.refunds = (response.data.refunds ?? []).map(mapAdminRefund);
    response.data.statusCounts = {
      pending: Number(response.data.statusCounts?.pending) || 0,
      processing: Number(response.data.statusCounts?.processing) || 0,
      refunded: Number(response.data.statusCounts?.refunded) || 0,
      denied: Number(response.data.statusCounts?.denied) || 0,
    };
    response.data.statusAmounts = {
      pending: Number(response.data.statusAmounts?.pending) || 0,
      processing: Number(response.data.statusAmounts?.processing) || 0,
      refunded: Number(response.data.statusAmounts?.refunded) || 0,
      denied: Number(response.data.statusAmounts?.denied) || 0,
    };
  }
  return response;
}

export async function getAdminRefund(id: string) {
  const response = await adminGet<{ refund: AdminRefund }>(
    `/refunds/${encodeURIComponent(id)}`
  );
  if (response.data?.refund) {
    response.data.refund = mapAdminRefund(response.data.refund);
  }
  return response;
}

export const MESSAGE_STATUS_LABELS: Record<string, string> = {
  pending: "Sending",
  sent: "Sent",
  failed: "Failed",
};

export const DELIVERY_STATUS_LABELS: Record<string, string> = {
  queued: "Sending",
  sent: "Got it",
  failed: "Didn’t send",
  skipped: "Left out",
};

export function messageStatusLabel(status?: string | null) {
  if (!status) return "Unknown";
  return MESSAGE_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export function deliveryStatusLabel(status?: string | null) {
  if (!status) return "Unknown";
  return DELIVERY_STATUS_LABELS[status] ?? status.replace(/_/g, " ");
}

export type AdminMessageRole = "traveler" | "organizer";
export type AdminMessageChannel = "sms" | "email";
export type AdminMessageAudienceMode = "everyone" | "filter" | "specific";

export type AdminMessageAudience = {
  mode: AdminMessageAudienceMode;
  status?: "pending" | "approved" | "rejected" | string;
  isVerified?: boolean;
  onboardingCompleted?: boolean;
  userIds?: string[];
};

export type AdminMessagePayload = {
  role: AdminMessageRole;
  channel: AdminMessageChannel;
  message: string;
  subject?: string;
  audience: AdminMessageAudience;
  q?: string;
};

export type AdminAudienceRecipient = {
  id: string;
  fullName?: string;
  role?: string;
  email?: string;
  phone?: string;
  sendable: boolean;
  skipReason?: string;
};

export type AdminAudiencePreview = {
  channel: AdminMessageChannel;
  audienceLabel: string;
  counts: { total: number; sendable: number; skipped: number };
  truncated?: boolean;
  maxRecipients?: number;
  recipients: AdminAudienceRecipient[];
  pagination: AdminPagination;
};

export type AdminMessageEstimate = {
  channel: AdminMessageChannel;
  audienceLabel: string;
  recipientCount: number;
  skippedCount: number;
  totalSelected: number;
  encoding?: string;
  segments?: number;
  messageLength?: number;
  charsPerSms?: number;
  costPerSegmentGhs?: number;
  estimatedCostGhs?: number;
  subject?: string;
  truncated?: boolean;
};

export type AdminMessageDeliveryStats = {
  total: number;
  queued: number;
  sent: number;
  failed: number;
  skipped: number;
};

export type AdminMessageCampaign = {
  id: string;
  channel: AdminMessageChannel | string;
  subject?: string;
  preview?: string;
  snippet?: string;
  audience?: string;
  audienceRole?: string;
  audienceMode?: string;
  audienceFilter?: {
    status?: string;
    isVerified?: boolean;
    onboardingCompleted?: boolean;
  };
  messageBody?: string;
  recipients: number;
  status: string;
  encoding?: string;
  segmentsPerMessage?: number;
  estimatedCostGhs?: number;
  actualCostGhs?: number;
  deliveryStats?: AdminMessageDeliveryStats;
  sentAt?: string | null;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  errorMessage?: string;
};

export type AdminMessageDelivery = {
  id: string;
  userId?: string;
  role?: string;
  recipientName?: string;
  email?: string;
  phone?: string;
  channel?: string;
  status: string;
  segments?: number;
  costGhs?: number;
  skipReason?: string;
  errorMessage?: string;
  sentAt?: string | null;
};

export type ListAdminMessagesParams = {
  page?: number;
  limit?: number;
  channel?: AdminMessageChannel | string;
  role?: AdminMessageRole | string;
  status?: string;
};

export type ListAdminMessagesResult = {
  messages: AdminMessageCampaign[];
  pagination: AdminPagination;
};

export type AdminAudiencePreviewParams = {
  role: AdminMessageRole;
  channel: AdminMessageChannel;
  mode?: AdminMessageAudienceMode;
  status?: string;
  isVerified?: boolean | string;
  onboardingCompleted?: boolean | string;
  userIds?: string | string[];
  q?: string;
  page?: number;
  limit?: number;
};

function mapAdminCampaign(raw: AdminMessageCampaign): AdminMessageCampaign {
  return {
    ...raw,
    id: asId(raw.id) ?? String(raw.id),
  };
}

function mapAdminDelivery(raw: AdminMessageDelivery): AdminMessageDelivery {
  return {
    ...raw,
    id: asId(raw.id) ?? String(raw.id),
    userId: asId(raw.userId) ?? raw.userId,
  };
}

export async function previewAdminMessageAudience(
  params: AdminAudiencePreviewParams
) {
  const userIds = Array.isArray(params.userIds)
    ? params.userIds.join(",")
    : params.userIds;
  const response = await adminGet<AdminAudiencePreview>("/messages/audience", {
    role: params.role,
    channel: params.channel,
    mode: params.mode,
    status: params.status,
    isVerified:
      params.isVerified === true
        ? "true"
        : params.isVerified === false
          ? "false"
          : params.isVerified,
    onboardingCompleted:
      params.onboardingCompleted === true
        ? "true"
        : params.onboardingCompleted === false
          ? "false"
          : params.onboardingCompleted,
    userIds,
    q: params.q,
    page: params.page,
    limit: params.limit,
  });
  if (response.data?.recipients) {
    response.data.recipients = response.data.recipients.map((row) => ({
      ...row,
      id: asId(row.id) ?? String(row.id),
    }));
  }
  return response;
}

export async function estimateAdminMessage(payload: AdminMessagePayload) {
  return adminPost<AdminMessageEstimate>("/messages/estimate", payload);
}

export async function createAdminMessage(
  payload: AdminMessagePayload,
  idempotencyKey?: string
) {
  const response = await adminPost<{
    message: AdminMessageCampaign;
    reused?: boolean;
  }>(
    "/messages",
    payload,
    idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined
  );
  if (response.data?.message) {
    response.data.message = mapAdminCampaign(response.data.message);
  }
  return response;
}

export async function listAdminMessages(params: ListAdminMessagesParams = {}) {
  const response = await adminGet<ListAdminMessagesResult>("/messages", params);
  if (response.data?.messages) {
    response.data.messages = response.data.messages.map(mapAdminCampaign);
  }
  return response;
}

export async function getAdminMessage(id: string) {
  const response = await adminGet<{
    message: AdminMessageCampaign;
    deliveries: AdminMessageDelivery[];
  }>(`/messages/${encodeURIComponent(id)}`);
  if (response.data?.message) {
    response.data.message = mapAdminCampaign(response.data.message);
  }
  if (response.data?.deliveries) {
    response.data.deliveries = response.data.deliveries.map(mapAdminDelivery);
  }
  return response;
}
