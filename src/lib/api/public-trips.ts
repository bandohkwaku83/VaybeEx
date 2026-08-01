import { apiRequest } from "./client";
import { getTravelerToken } from "./auth-token";
import { resolveMediaUrl } from "./media";
import {
  mapOrganizerTripFromApi,
  type OrganizerTripApiData,
  type TripsListResult,
} from "./organizer-trips";
import type { Organizer, Trip, VerificationStatus } from "@/lib/types";
import { organizerBrandSlug, tripPathSlug } from "@/lib/tenant-host";

function resolveBrandSlug(opts: {
  brandSlug?: string | null;
  businessName?: string | null;
  organizerName?: string | null;
}): string {
  if (opts.brandSlug?.trim()) return tripPathSlug(opts.brandSlug);
  const name =
    opts.businessName?.trim() || opts.organizerName?.trim() || "organizer";
  return organizerBrandSlug(name);
}

/** Nested organizer on public trip browse/detail/favorites payloads. */
export type PublicTripOrganizerApi = {
  id?: string;
  fullName?: string;
  businessName?: string;
  displayName?: string;
  brandSlug?: string;
  brandLogo?: string | null;
  profilePhoto?: string | null;
  location?: string;
  aboutYou?: string;
  tripSpecialties?: string[];
  whatsapp?: string;
  isVerified?: boolean;
  status?: string;
  // Legacy aliases (kept for older payloads)
  name?: string;
  avatar?: string;
  bio?: string;
  verified?: boolean;
  rating?: number;
  reviewCount?: number;
  tripCount?: number;
  joinedAt?: string;
};

export type PublicTripApiData = OrganizerTripApiData & {
  isFavorited?: boolean;
  organizer?: PublicTripOrganizerApi;
  organizerName?: string;
  organizerAvatar?: string;
  organizerBrandSlug?: string;
};

export type TripEventName = "book_click" | "checkout_start";

export type ListPublicTripsParams = {
  category?: string;
  page?: number;
  limit?: number;
  search?: string;
  destination?: string;
  organizerId?: string;
  /** When true, include completed trips alongside live (featured / history surfaces). */
  includeCompleted?: boolean;
};

function bearerHeaders(): HeadersInit {
  const token = getTravelerToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function organizerDisplayName(org?: PublicTripOrganizerApi | null): string | undefined {
  if (!org) return undefined;
  return (
    org.displayName?.trim() ||
    org.businessName?.trim() ||
    org.fullName?.trim() ||
    org.name?.trim() ||
    undefined
  );
}

function organizerAvatarUrl(org?: PublicTripOrganizerApi | null): string | undefined {
  if (!org) return undefined;
  return (
    resolveMediaUrl(org.brandLogo) ??
    resolveMediaUrl(org.profilePhoto) ??
    resolveMediaUrl(org.avatar) ??
    undefined
  );
}

function mapVerificationStatus(
  org?: PublicTripOrganizerApi | null
): { verified: boolean; verificationStatus: VerificationStatus } {
  const status = String(org?.status ?? "").toLowerCase();
  const verified =
    org?.isVerified === true ||
    org?.verified === true ||
    status === "verified";

  if (verified) return { verified: true, verificationStatus: "verified" };
  if (status === "in_review" || status === "pending" || status === "rejected") {
    return { verified: false, verificationStatus: status as VerificationStatus };
  }
  return { verified: false, verificationStatus: "pending" };
}

function extractOrganizerFields(data: PublicTripApiData): Pick<
  Trip,
  | "isFavorited"
  | "organizerName"
  | "organizerAvatar"
  | "organizerBrandSlug"
  | "organizerVerified"
> {
  const org = data.organizer;
  const name = data.organizerName ?? organizerDisplayName(org);
  const brandSlug =
    data.organizerBrandSlug ??
    (org?.brandSlug?.trim()
      ? tripPathSlug(org.brandSlug)
      : name
        ? resolveBrandSlug({
            brandSlug: org?.brandSlug,
            businessName: org?.businessName,
            organizerName: org?.fullName ?? org?.name ?? name,
          })
        : undefined);
  const { verified } = mapVerificationStatus(org);

  return {
    isFavorited: data.isFavorited ?? false,
    organizerName: name,
    organizerAvatar:
      data.organizerAvatar ?? organizerAvatarUrl(org) ?? undefined,
    organizerBrandSlug: brandSlug,
    organizerVerified: verified,
  };
}

/** Map public API trip → UI Trip model. */
export function mapPublicTripFromApi(data: PublicTripApiData): Trip {
  const base = mapOrganizerTripFromApi(data);
  const organizerFields = extractOrganizerFields(data);
  return {
    ...base,
    ...organizerFields,
    // Prefer nested organizer id when present
    organizerId: data.organizer?.id ?? base.organizerId,
  };
}

/** Build a display Organizer from public trip payload (+ brand fallback). */
export function organizerFromPublicTrip(
  trip: Trip,
  data?: PublicTripApiData,
  brandFallback?: string
): Organizer {
  const org = data?.organizer;
  const name =
    trip.organizerName ??
    organizerDisplayName(org) ??
    (brandFallback
      ? brandFallback
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : "Organizer");

  const brandSlug =
    trip.organizerBrandSlug ??
    resolveBrandSlug({
      brandSlug: org?.brandSlug ?? brandFallback,
      businessName: org?.businessName,
      organizerName: org?.fullName ?? org?.name ?? name,
    });

  const { verified, verificationStatus } = mapVerificationStatus(org);

  return {
    id: org?.id ?? trip.organizerId,
    name,
    brandSlug,
    avatar:
      trip.organizerAvatar ??
      organizerAvatarUrl(org) ??
      "/images/cta-image.jpg",
    bio: org?.aboutYou ?? org?.bio ?? "",
    verified: trip.organizerVerified ?? verified,
    verificationStatus,
    rating: org?.rating ?? 0,
    reviewCount: org?.reviewCount ?? 0,
    tripCount: org?.tripCount ?? 0,
    joinedAt: org?.joinedAt ?? "",
    location: org?.location ?? "",
    whatsapp: org?.whatsapp,
    tripSpecialties: org?.tripSpecialties,
  };
}

/** GET /api/trips */
export async function listPublicTrips(params?: ListPublicTripsParams) {
  const query = new URLSearchParams();
  if (params?.category && params.category !== "all") {
    query.set("category", params.category);
  }
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search) query.set("search", params.search);
  if (params?.destination) query.set("destination", params.destination);
  if (params?.organizerId) query.set("organizerId", params.organizerId);
  if (params?.includeCompleted) query.set("includeCompleted", "true");
  const qs = query.toString();

  const response = await apiRequest<{
    trips: PublicTripApiData[];
    pagination: TripsListResult["pagination"];
  }>(`/api/trips${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: bearerHeaders(),
  });

  return {
    ...response,
    data: {
      trips: (response.data?.trips ?? []).map(mapPublicTripFromApi),
      pagination: response.data?.pagination ?? {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
    } satisfies TripsListResult,
  };
}

/** GET /api/trips/:id */
export async function getPublicTrip(id: string) {
  const response = await apiRequest<PublicTripApiData>(`/api/trips/${id}`, {
    method: "GET",
    headers: bearerHeaders(),
  });
  return {
    ...response,
    data: response.data ? mapPublicTripFromApi(response.data) : undefined,
    raw: response.data,
  };
}

/**
 * GET /api/trips/brand/:brand/:tripSlug
 * Resolves a tenant-hosted trip by brand subdomain + trip slug.
 */
export async function getPublicTripByBrand(brand: string, tripSlug: string) {
  const response = await apiRequest<PublicTripApiData>(
    `/api/trips/brand/${encodeURIComponent(brand)}/${encodeURIComponent(tripSlug)}`,
    {
      method: "GET",
      headers: bearerHeaders(),
    }
  );
  const trip = response.data ? mapPublicTripFromApi(response.data) : undefined;
  return {
    ...response,
    data: trip
      ? {
          trip,
          organizer: organizerFromPublicTrip(trip, response.data, brand),
        }
      : undefined,
    raw: response.data,
  };
}

/**
 * List public trips for a brand/organizer profile (live + completed).
 * Uses public trip list + nested organizer.brandSlug (and optional organizerId).
 */
export async function listPublicTripsByBrand(
  brand: string,
  opts?: { organizerId?: string }
) {
  const normalized = brand.toLowerCase();
  const query = new URLSearchParams({ limit: "50" });
  if (opts?.organizerId) query.set("organizerId", opts.organizerId);
  query.set("brandSlug", brand);

  try {
    const response = await apiRequest<{
      trips: PublicTripApiData[];
      pagination: TripsListResult["pagination"];
    }>(`/api/trips?${query.toString()}`, {
      method: "GET",
      headers: bearerHeaders(),
    });

    const rawTrips = response.data?.trips ?? [];
    const matched = opts?.organizerId
      ? rawTrips
      : rawTrips.filter(
          (t) =>
            tripPathSlug(t.organizer?.brandSlug ?? "") === normalized
        );

    const trips = matched.map(mapPublicTripFromApi);
    const organizer = matched[0]
      ? organizerFromPublicTrip(trips[0], matched[0], brand)
      : null;

    return {
      ...response,
      data: {
        trips,
        organizer,
        pagination: response.data?.pagination ?? {
          page: 1,
          limit: 50,
          total: trips.length,
          pages: 1,
        },
      },
    };
  } catch {
    return {
      success: false as const,
      message: "Unable to load brand trips.",
      data: {
        trips: [] as Trip[],
        organizer: null as Organizer | null,
        pagination: { page: 1, limit: 20, total: 0, pages: 0 },
      },
    };
  }
}

/** POST /api/trips/:id/events */
export function trackTripEvent(id: string, event: TripEventName) {
  return apiRequest<{ id?: string }>(`/api/trips/${id}/events`, {
    method: "POST",
    body: JSON.stringify({ event }),
  });
}

/** POST /api/trips/:id/favorite — traveler only */
export type FavoriteMutationResult = {
  id?: string;
  tripId?: string;
  favoritedAt?: string;
  isFavorited?: boolean;
};

export function addTripFavorite(id: string) {
  return apiRequest<FavoriteMutationResult>(`/api/trips/${id}/favorite`, {
    method: "POST",
    headers: bearerHeaders(),
  });
}

/** DELETE /api/trips/:id/favorite — traveler only */
export function removeTripFavorite(id: string) {
  return apiRequest<FavoriteMutationResult>(`/api/trips/${id}/favorite`, {
    method: "DELETE",
    headers: bearerHeaders(),
  });
}

type FavoriteListItemApi = {
  favoritedAt?: string;
  trip?: PublicTripApiData;
} & Partial<PublicTripApiData>;

function unwrapFavoriteListItem(
  item: FavoriteListItemApi
): PublicTripApiData | null {
  const nested = item.trip;
  if (nested && typeof nested === "object") {
    return { ...nested, isFavorited: true };
  }
  // Legacy flat trip shape
  if (item.id || (item as { _id?: string })._id) {
    const { favoritedAt: _favoritedAt, trip: _trip, ...rest } = item;
    return { ...(rest as PublicTripApiData), isFavorited: true };
  }
  return null;
}

/** GET /api/trips/favorites — traveler only */
export async function listFavoriteTrips(params?: {
  page?: number;
  limit?: number;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  const qs = query.toString();

  const response = await apiRequest<{
    trips?: FavoriteListItemApi[] | PublicTripApiData[];
    favorites?: FavoriteListItemApi[];
    pagination?: TripsListResult["pagination"];
  }>(`/api/trips/favorites${qs ? `?${qs}` : ""}`, {
    method: "GET",
    headers: bearerHeaders(),
  });

  const raw = response.data?.favorites ?? response.data?.trips ?? [];
  const trips = raw
    .map((item) => unwrapFavoriteListItem(item as FavoriteListItemApi))
    .filter((t): t is PublicTripApiData => Boolean(t))
    .map((t) => mapPublicTripFromApi(t));

  return {
    ...response,
    data: {
      trips,
      pagination: response.data?.pagination ?? {
        page: 1,
        limit: 20,
        total: trips.length,
        pages: 1,
      },
    } satisfies TripsListResult,
  };
}
