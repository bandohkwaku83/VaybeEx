import { API_BASE_URL, normalizeApiOrigin } from "./config";

/** Fallback when a profile photo is required but not uploaded yet. */
export const DEFAULT_PROFILE_IMAGE = "/images/profile.png";

/** Fallback cover when a trip/gallery image is missing or fails to load. */
export const FALLBACK_TRIP_IMAGE = "/images/cta-image.jpg";

/** Remote hosts Next can safely optimize (must match next.config remotePatterns). */
const OPTIMIZABLE_REMOTE_HOSTS = new Set(["images.unsplash.com"]);

/** Origin used when resolving non-upload media that must be absolute. */
const DEFAULT_API_ORIGIN = "http://localhost:8000";

function mediaOrigin(): string {
  const fromEnv = normalizeApiOrigin(
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || ""
  );
  if (fromEnv) return fromEnv;
  if (API_BASE_URL) return API_BASE_URL;
  return DEFAULT_API_ORIGIN;
}

/**
 * Prefer same-origin `/uploads/...` so the Next rewrite serves files in the browser.
 * Do not send these through next/image optimization — localhost/private IPs 400.
 */
function toSameOriginUploadPath(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("/uploads/") || trimmed === "/uploads") {
    return trimmed;
  }

  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`;
  }

  try {
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith("/uploads/") || parsed.pathname === "/uploads") {
        return `${parsed.pathname}${parsed.search}`;
      }
    }
  } catch {
    /* ignore invalid URLs */
  }

  return null;
}

/**
 * Resolve API media paths to browser-usable URLs.
 * Upload files stay same-origin (`/uploads/...` → Next rewrite).
 * Other relative API paths are prefixed with the API origin.
 */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  if (
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  const uploadPath = toSameOriginUploadPath(trimmed);
  if (uploadPath) return uploadPath;

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://")
  ) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  const base = mediaOrigin();
  return `${base}/${trimmed.replace(/^\//, "")}`;
}

/** True when next/image optimization would 400 or skip the rewrite. */
export function shouldUnoptimizeMedia(src?: string | null): boolean {
  if (!src) return true;
  if (src.startsWith("blob:") || src.startsWith("data:")) return true;
  if (src.startsWith("/uploads/") || src === "/uploads") return true;

  if (src.startsWith("http://") || src.startsWith("https://")) {
    try {
      const { hostname, pathname } = new URL(src);
      if (pathname.startsWith("/uploads/") || pathname === "/uploads") return true;
      return !OPTIMIZABLE_REMOTE_HOSTS.has(hostname);
    } catch {
      return true;
    }
  }

  return false;
}

export function mediaSrc(
  url?: string | null,
  fallback: string = FALLBACK_TRIP_IMAGE,
): string {
  return resolveMediaUrl(url) ?? fallback;
}
