import { organizers, trips } from "@/lib/mock-data";
import {
  getBrandFromHost,
  getTenantTripUrl as buildTenantTripUrl,
  organizerBrandSlug,
  tripPathSlug,
} from "@/lib/tenant-host";
import type { Organizer, Trip } from "@/lib/types";

export {
  BRAND_SLUG_MAX,
  BRAND_SLUG_MIN,
  getBrandFromHost,
  getRootAbsoluteUrl,
  getRootDomain,
  getTenantBrandHomeUrl,
  getTenantTripUrl,
  isPlatformPath,
  isReservedBrand,
  normalizeBrandSlug,
  organizerBrandSlug,
  sanitizeSlugInput,
  slugify,
  tripPathSlug,
  validateBrandSlug,
} from "@/lib/tenant-host";
export type { BrandSlugValidation } from "@/lib/tenant-host";

/** Resolved public path segment for a trip. */
export function getTripPublicSlug(trip: Pick<Trip, "title" | "slug">): string {
  return trip.slug?.trim() ? tripPathSlug(trip.slug) : tripPathSlug(trip.title);
}

/**
 * Same-origin trip detail href for in-app navigation.
 * Staying on the current host preserves the auth session (localStorage is
 * per-origin; cross-subdomain jumps were signing travelers out).
 */
export function getTripDetailHref(
  trip: Pick<Trip, "id" | "title" | "slug" | "organizerBrandSlug">
): string {
  if (typeof window !== "undefined") {
    const brand = getBrandFromHost(window.location.host);
    if (brand) return `/${getTripPublicSlug(trip)}`;
  }
  return `/trips/${trip.id}`;
}

export function getTenantTripUrlForTrip(trip: Trip, pathSuffix = ""): string | null {
  const organizer = organizers.find((o) => o.id === trip.organizerId);
  if (!organizer) return null;
  const brand = getOrganizerBrandSlug({
    brandSlug: organizer.brandSlug,
    organizerName: organizer.name,
  });
  return buildTenantTripUrl(brand, getTripPublicSlug(trip), pathSuffix);
}

/** Prefer business / brand display name when building a public URL. */
export function getPublicBrandName(opts: {
  businessName?: string | null;
  organizerName?: string | null;
}): string {
  const business = opts.businessName?.trim();
  if (business) return business;
  return opts.organizerName?.trim() || "organizer";
}

/** Resolved tenant subdomain for an organizer (editable brandSlug wins). */
export function getOrganizerBrandSlug(opts: {
  brandSlug?: string | null;
  businessName?: string | null;
  organizerName?: string | null;
}): string {
  if (opts.brandSlug?.trim()) return tripPathSlug(opts.brandSlug);
  return organizerBrandSlug(getPublicBrandName(opts));
}

export function getOrganizerByBrand(brand: string): Organizer | undefined {
  const normalized = brand.toLowerCase();
  return organizers.find((o) => {
    if (o.brandSlug && tripPathSlug(o.brandSlug) === normalized) return true;
    return organizerBrandSlug(o.name) === normalized;
  });
}

function tripMatchesSlug(trip: Trip, slug: string): boolean {
  return getTripPublicSlug(trip) === slug.toLowerCase();
}

export function resolveTenantTrip(
  brand: string,
  tripSlug: string
): { trip: Trip; organizer: Organizer } | null {
  const organizer = getOrganizerByBrand(brand);
  if (!organizer) return null;

  const slug = tripSlug.toLowerCase();
  const trip = trips.find(
    (t) => t.organizerId === organizer.id && tripMatchesSlug(t, slug)
  );
  if (!trip) return null;

  return { trip, organizer };
}

export function getTripsForBrand(brand: string): Trip[] {
  const organizer = getOrganizerByBrand(brand);
  if (!organizer) return [];
  // Public profile: live + completed (hide draft/cancelled)
  return trips.filter(
    (t) =>
      t.organizerId === organizer.id &&
      (t.status === "live" ||
        t.status === "scheduled" ||
        t.status === "completed")
  );
}

const ORGANIZER_TRIPS_KEY = "trripx-organizer-trips";
const ORGANIZER_PROFILE_KEY = "trripx-organizer-profile";
const PORTAL_ORGANIZER_ID = "org-1";

/** Client-only: resolve brand + trip against portal localStorage trips. */
export function resolveTenantTripClient(
  brand: string,
  tripSlug: string
): { trip: Trip; organizer: Organizer } | null {
  const fromMock = resolveTenantTrip(brand, tripSlug);
  if (fromMock) return fromMock;

  if (typeof window === "undefined") return null;

  try {
    const profileRaw = localStorage.getItem(ORGANIZER_PROFILE_KEY);
    const profile = profileRaw
      ? (JSON.parse(profileRaw) as { businessName?: string; brandSlug?: string })
      : null;
    const base = organizers.find((o) => o.id === PORTAL_ORGANIZER_ID);
    if (!base) return null;

    const brandKey = getOrganizerBrandSlug({
      brandSlug: profile?.brandSlug,
      businessName: profile?.businessName,
      organizerName: base.name,
    });
    if (brandKey !== brand.toLowerCase()) {
      // Also accept the mock org name so seeded URLs keep working after rename
      if (organizerBrandSlug(base.name) !== brand.toLowerCase()) return null;
    }

    const stored = localStorage.getItem(ORGANIZER_TRIPS_KEY);
    if (!stored) return null;
    const list = JSON.parse(stored) as Trip[];
    const trip = list.find(
      (t) =>
        tripMatchesSlug(t, tripSlug) &&
        t.status !== "draft" &&
        t.status !== "cancelled"
    );
    if (!trip) return null;

    const displayName = getPublicBrandName({
      businessName: profile?.businessName,
      organizerName: base.name,
    });
    const organizer: Organizer = {
      ...base,
      name: displayName,
      brandSlug: brandKey,
      bio: base.bio,
    };
    return { trip, organizer };
  } catch {
    return null;
  }
}
