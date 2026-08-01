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
  };
};

export type AdminDashboard = {
  travelers: { total: number; verified: number };
  organizers: {
    total: number;
    pendingApproval: number;
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
  cancellations: { awaitingReview: number };
};

export type ListAdminUsersParams = {
  page?: number;
  limit?: number;
  role?: "traveler" | "organizer" | "";
  status?: string;
  q?: string;
  /** KYC queue — maps to API `pending_approval` */
  queue?: "pending_approval" | "pending" | string;
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

export type AdminWithdrawal = {
  id: string;
  tripId?: string;
  organizerId?: string;
  amount: number;
  currency?: string;
  status: string;
  label?: string;
  processedAt?: string;
  note?: string;
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

export type ListAdminWithdrawalsParams = {
  page?: number;
  limit?: number;
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

/** Normalize photo fields to same-origin /uploads paths. */
export function mapAdminUser(user: AdminUser): AdminUser {
  return {
    ...user,
    id: asId(user.id) ?? String(user.id),
    profilePhoto: resolveMediaUrl(user.profilePhoto) ?? null,
    brandLogo: resolveMediaUrl(user.brandLogo) ?? null,
    nationalIdPhoto: resolveMediaUrl(user.nationalIdPhoto) ?? null,
  };
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
  };
}

export function getAdminDashboard() {
  return apiRequest<AdminDashboard>("/api/admin/dashboard", {
    method: "GET",
    headers: bearerHeaders(),
  });
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

  if (response.data?.users) {
    response.data.users = response.data.users.map(mapAdminUser);
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

export async function approveOrganizer(id: string) {
  const response = await apiRequest<{ user: AdminUser }>(
    `/api/admin/organizers/${encodeURIComponent(id)}/approve`,
    { method: "POST", headers: bearerHeaders() }
  );
  if (response.data?.user) {
    response.data.user = mapAdminUser(response.data.user);
  }
  return response;
}

export async function rejectOrganizer(
  id: string,
  input: { reason?: string } = {}
) {
  const response = await apiRequest<{ user: AdminUser }>(
    `/api/admin/organizers/${encodeURIComponent(id)}/reject`,
    {
      method: "POST",
      headers: bearerHeaders(),
      body: JSON.stringify({
        reason: input.reason?.trim() || undefined,
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

export async function retryAdminWithdrawal(id: string) {
  const response = await apiRequest<{ withdrawal: AdminWithdrawal }>(
    `/api/admin/withdrawals/${encodeURIComponent(id)}/retry`,
    { method: "POST", headers: bearerHeaders() }
  );
  if (response.data?.withdrawal) {
    response.data.withdrawal = mapAdminWithdrawal(response.data.withdrawal);
  }
  return response;
}

export async function syncAdminWithdrawal(id: string) {
  const response = await apiRequest<{ withdrawal: AdminWithdrawal }>(
    `/api/admin/withdrawals/${encodeURIComponent(id)}/sync`,
    { method: "POST", headers: bearerHeaders() }
  );
  if (response.data?.withdrawal) {
    response.data.withdrawal = mapAdminWithdrawal(response.data.withdrawal);
  }
  return response;
}
