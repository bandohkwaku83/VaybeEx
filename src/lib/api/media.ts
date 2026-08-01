import { API_BASE_URL } from "./config";

/** Fallback when a profile photo is required but not uploaded yet. */
export const DEFAULT_PROFILE_IMAGE = "/images/profile.png";

/** Origin used when resolving non-upload media that must be absolute. */
const DEFAULT_API_ORIGIN = "http://localhost:8000";

function mediaOrigin(): string {
  const fromEnv = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.API_BASE_URL ||
    ""
  ).replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (API_BASE_URL) return API_BASE_URL.replace(/\/$/, "");
  return DEFAULT_API_ORIGIN;
}

/**
 * Prefer same-origin `/uploads/...` so Next's rewrite + image optimizer work.
 * Absolute `http://localhost:8000/uploads/...` fails next/image optimization (400).
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
