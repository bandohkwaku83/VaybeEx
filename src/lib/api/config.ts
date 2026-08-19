/**
 * API host origin. Env may be `https://host` or `https://host/api`;
 * request paths already start with `/api/...`.
 */
export function normalizeApiOrigin(raw: string): string {
  return raw.trim().replace(/\/+$/, "").replace(/\/api$/i, "");
}

export const API_BASE_URL = normalizeApiOrigin(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
);
