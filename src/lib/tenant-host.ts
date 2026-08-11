/** Apex host including port for local (e.g. `localhost:3000`). */
export function getRootDomain(): string {
  return process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim() || "localhost:3000";
}

const RESERVED_BRANDS = new Set([
  "www",
  "api",
  "app",
  "admin",
  "admin-portal",
  "static",
  "cdn",
  "organizer",
  "organisers",
  "organizers",
  "tenant",
  "login",
  "dashboard",
  "auth",
  "support",
  "help",
  "mail",
  "status",
  "billing",
  "vaybeex",
  "trripx",
]);

export const BRAND_SLUG_MIN = 2;
export const BRAND_SLUG_MAX = 63;

/** Derive a URL-safe brand / trip segment from a display name (live, no stored slug). */
export function slugify(input: string): string {
  return (
    input
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
      .slice(0, 80) || "untitled"
  );
}

export function organizerBrandSlug(name: string): string {
  return slugify(name);
}

export function tripPathSlug(title: string): string {
  return slugify(title);
}

export function isReservedBrand(brand: string): boolean {
  return RESERVED_BRANDS.has(brand.toLowerCase());
}

/**
 * Apex-app routes that must never be treated as trip slugs on a tenant host.
 * e.g. brand.localhost/organizer → redirect to localhost/organizer
 */
const PLATFORM_PATH_PREFIXES = [
  "/organizer",
  "/admin-portal",
  "/admin",
  "/login",
  "/dashboard",
  "/wishlist",
  "/expeditions",
  "/trips",
  "/reviews",
  "/organizers",
  "/booking",
] as const;

export function isPlatformPath(pathname: string): boolean {
  return PLATFORM_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Absolute URL on the marketing / traveler apex host. */
export function getRootAbsoluteUrl(path = "/"): string {
  const root = getRootDomain();
  const normalized =
    path.startsWith("/") || path === "" ? path || "/" : `/${path}`;
  return `${protocolForRoot(root)}://${root}${normalized}`;
}

/** Soft-sanitize while typing (allows a trailing hyphen; caps length). */
export function sanitizeSlugInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+/, "")
    .slice(0, BRAND_SLUG_MAX);
}

/** Finalize a brand slug for submit (trim hyphens, enforce charset). */
export function normalizeBrandSlug(raw: string): string {
  return slugify(raw).slice(0, BRAND_SLUG_MAX);
}

export type BrandSlugValidation =
  | { ok: true; value: string }
  | { ok: false; error: string };

/**
 * Client-side brandSlug rules mirroring the API:
 * 2–63 chars, a-z / 0-9 / hyphens only, reserved names blocked.
 */
export function validateBrandSlug(raw: string): BrandSlugValidation {
  const value = normalizeBrandSlug(raw);
  if (value.length < BRAND_SLUG_MIN) {
    return {
      ok: false,
      error: `Use at least ${BRAND_SLUG_MIN} characters.`,
    };
  }
  if (value.length > BRAND_SLUG_MAX) {
    return {
      ok: false,
      error: `Keep it under ${BRAND_SLUG_MAX} characters.`,
    };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return {
      ok: false,
      error: "Use lowercase letters, numbers, and hyphens only.",
    };
  }
  if (isReservedBrand(value)) {
    return {
      ok: false,
      error: "That name is reserved. Pick a different brand link.",
    };
  }
  return { ok: true, value };
}

/**
 * Parse `{brand}.localhost:3000` or `{brand}.{root}`.
 * Returns null when the host is the apex (no tenant).
 */
export function getBrandFromHost(host: string): string | null {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return null;
  }

  if (hostname.endsWith(".localhost")) {
    const brand = hostname.slice(0, -".localhost".length);
    if (brand && !brand.includes(".") && !isReservedBrand(brand)) return brand;
    return null;
  }

  const rootHost = getRootDomain().split(":")[0]?.toLowerCase() ?? "localhost";
  if (rootHost !== "localhost" && hostname.endsWith(`.${rootHost}`)) {
    const brand = hostname.slice(0, -(rootHost.length + 1));
    if (brand && !brand.includes(".") && !isReservedBrand(brand)) return brand;
  }

  return null;
}

function protocolForRoot(root: string): string {
  return root.includes("localhost") || root.startsWith("127.") ? "http" : "https";
}

/** Absolute public trip URL: `http://{brand}.localhost:3000/{trip-slug}`. */
export function getTenantTripUrl(
  organizerName: string,
  tripTitleOrSlug: string,
  pathSuffix = ""
): string {
  const brand = organizerBrandSlug(organizerName);
  const tripSlug = tripPathSlug(tripTitleOrSlug);
  const root = getRootDomain();
  const suffix =
    pathSuffix.startsWith("/") || pathSuffix === "" ? pathSuffix : `/${pathSuffix}`;
  return `${protocolForRoot(root)}://${brand}.${root}/${tripSlug}${suffix}`;
}

export function getTenantBrandHomeUrl(organizerName: string): string {
  const brand = organizerBrandSlug(organizerName);
  const root = getRootDomain();
  return `${protocolForRoot(root)}://${brand}.${root}`;
}
