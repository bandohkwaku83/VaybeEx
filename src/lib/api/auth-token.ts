const LEGACY_TOKEN_KEY = "vaybeex-auth-token";
const TRAVELER_TOKEN_KEY = "vaybeex-traveler-token";
const ORGANIZER_TOKEN_KEY = "vaybeex-organizer-token";
const ADMIN_TOKEN_KEY = "vaybeex-admin-token";
const USER_KEY = "vaybeex-auth-user";
const LEGACY_USER_KEY = "trripx-user";

const TOKEN_MAX_AGE = 60 * 60 * 24 * 7;

/** Cookie domain so apex + *.localhost (or *.root) can share the session. */
function authCookieDomain(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const hostname = window.location.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    return ".localhost";
  }
  if (hostname === "127.0.0.1") return undefined;
  const parts = hostname.split(".");
  if (parts.length >= 2) {
    return `.${parts.slice(-2).join(".")}`;
  }
  return undefined;
}

/** Return every cookie value for `name` (host-only + Domain cookies can both exist). */
function readAllCookies(name: string): string[] {
  if (typeof document === "undefined") return [];
  const prefix = `${name}=`;
  const values: string[] = [];
  for (const row of document.cookie.split("; ")) {
    if (!row.startsWith(prefix)) continue;
    try {
      const value = decodeURIComponent(row.slice(prefix.length) || "");
      if (value) values.push(value);
    } catch {
      /* ignore malformed */
    }
  }
  return values;
}

function readCookie(name: string): string | null {
  const all = readAllCookies(name);
  // Last write wins when host-only + Domain copies both exist.
  return all.length ? all[all.length - 1]! : null;
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return;
  const hostname = window.location.hostname.toLowerCase();
  const domain = authCookieDomain();

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  if (domain) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Domain=${domain}`;
  }
  if (hostname === "localhost" || hostname.endsWith(".localhost")) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Domain=localhost`;
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Domain=.localhost`;
  }
}

/**
 * Write host-only first (always works), then also try a shared Domain cookie.
 * Never clear before writing — browsers often reject Domain=.localhost, and
 * clearing first would leave the user with no cookie at all.
 */
function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);

  // Host-only — reliable on the current origin
  document.cookie = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;

  // Shared across apex ↔ tenant when the browser accepts it
  const domain = authCookieDomain();
  if (domain) {
    document.cookie = `${name}=${encoded}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax; Domain=${domain}`;
  }
}

function peekJwtRole(
  token: string
): "traveler" | "organizer" | "admin" | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const json = atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as { role?: string };
    const role = payload.role?.toLowerCase();
    if (role === "admin") return "admin";
    if (role === "organizer") return "organizer";
    if (role === "traveler" || role === "user") return "traveler";
    return null;
  } catch {
    return null;
  }
}

function readToken(key: string): string | null {
  if (typeof window === "undefined") return null;
  const fromCookie = readCookie(key);
  const fromStorage = localStorage.getItem(key);

  if (fromCookie) {
    if (fromStorage !== fromCookie) {
      localStorage.setItem(key, fromCookie);
    }
    return fromCookie;
  }

  if (fromStorage) {
    // Re-publish to cookies so tenant hosts can pick it up when possible
    writeCookie(key, fromStorage, TOKEN_MAX_AGE);
    return fromStorage;
  }

  return null;
}

function writeToken(key: string, token: string) {
  localStorage.setItem(key, token);
  writeCookie(key, token, TOKEN_MAX_AGE);
}

function removeToken(key: string) {
  localStorage.removeItem(key);
  clearCookie(key);
}

/** One-time move of legacy shared token into traveler/organizer slots. */
function migrateLegacyToken() {
  if (typeof window === "undefined") return;

  const legacy =
    readCookie(LEGACY_TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY);
  if (!legacy) return;

  const role = peekJwtRole(legacy);
  if (role === "organizer") {
    if (!readToken(ORGANIZER_TOKEN_KEY)) writeToken(ORGANIZER_TOKEN_KEY, legacy);
  } else {
    // Default unknown/legacy tokens into the traveler slot (booking identity).
    if (!readToken(TRAVELER_TOKEN_KEY)) writeToken(TRAVELER_TOKEN_KEY, legacy);
  }

  removeToken(LEGACY_TOKEN_KEY);
}

export function getTravelerToken(): string | null {
  migrateLegacyToken();
  return readToken(TRAVELER_TOKEN_KEY);
}

export function getOrganizerToken(): string | null {
  migrateLegacyToken();
  return readToken(ORGANIZER_TOKEN_KEY);
}

export function getAdminToken(): string | null {
  return readToken(ADMIN_TOKEN_KEY);
}

/**
 * Context-aware token.
 * Public/booking surfaces prefer the traveler token so an organizer session
 * on the same browser cannot hijack checkout.
 */
export function getAuthToken(
  preferred?: "traveler" | "organizer" | "admin"
): string | null {
  migrateLegacyToken();

  if (preferred === "traveler") return getTravelerToken();
  if (preferred === "organizer") return getOrganizerToken();
  if (preferred === "admin") return getAdminToken();

  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/admin-portal") || path.startsWith("/admin")) {
      return getAdminToken();
    }
    if (path.startsWith("/organizer")) {
      return getOrganizerToken() ?? getTravelerToken();
    }
  }

  return getTravelerToken() ?? getOrganizerToken();
}

/** Store a token in the slot matching its JWT role. */
export function setAuthToken(token: string): void {
  const role = peekJwtRole(token);
  if (role === "admin") {
    writeToken(ADMIN_TOKEN_KEY, token);
    removeToken(LEGACY_TOKEN_KEY);
    return;
  }
  if (role === "organizer") {
    writeToken(ORGANIZER_TOKEN_KEY, token);
    removeToken(LEGACY_TOKEN_KEY);
    return;
  }

  writeToken(TRAVELER_TOKEN_KEY, token);
  removeToken(LEGACY_TOKEN_KEY);
}

export function setTravelerToken(token: string): void {
  writeToken(TRAVELER_TOKEN_KEY, token);
  removeToken(LEGACY_TOKEN_KEY);
}

export function setOrganizerToken(token: string): void {
  writeToken(ORGANIZER_TOKEN_KEY, token);
  removeToken(LEGACY_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  writeToken(ADMIN_TOKEN_KEY, token);
  removeToken(LEGACY_TOKEN_KEY);
}

export function clearTravelerToken(): void {
  removeToken(TRAVELER_TOKEN_KEY);
  removeToken(LEGACY_TOKEN_KEY);
}

export function clearOrganizerToken(): void {
  removeToken(ORGANIZER_TOKEN_KEY);
  removeToken(LEGACY_TOKEN_KEY);
}

export function clearAdminToken(): void {
  removeToken(ADMIN_TOKEN_KEY);
}

/** Clears traveler + organizer roles (full public sign-out). */
export function clearAuthToken(): void {
  removeToken(TRAVELER_TOKEN_KEY);
  removeToken(ORGANIZER_TOKEN_KEY);
  removeToken(LEGACY_TOKEN_KEY);
}

export type StoredOrganizerKyc = {
  status: "pending" | "approved" | "rejected" | null;
  onboardingCompleted: boolean;
  canPublish: boolean;
  canResubmit: boolean;
  rejectionReason: string | null;
  reviewedAt: string | null;
  resubmittedAt: string | null;
  resubmissionCount: number;
};

export type StoredAuthUser = {
  name: string;
  email: string;
  phone?: string;
  role?: "traveler" | "organizer";
  /** Live KYC from /me, login, Google, and dashboard — not from the JWT. */
  kyc?: StoredOrganizerKyc;
  /** @deprecated Prefer `kyc.status`. `verified` means approved. */
  organizerStatus?: "pending" | "verified" | "rejected";
  rejectionReason?: string;
};

export function getStoredAuthUser(): StoredAuthUser | null {
  if (typeof window === "undefined") return null;

  const fromCookie = readCookie(USER_KEY);
  if (fromCookie) {
    try {
      const parsed = JSON.parse(fromCookie) as StoredAuthUser;
      localStorage.setItem(USER_KEY, fromCookie);
      localStorage.setItem(LEGACY_USER_KEY, fromCookie);
      return parsed;
    } catch {
      /* ignore */
    }
  }

  for (const key of [USER_KEY, LEGACY_USER_KEY]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw) as StoredAuthUser;
      writeCookie(USER_KEY, raw, TOKEN_MAX_AGE);
      localStorage.setItem(USER_KEY, raw);
      localStorage.setItem(LEGACY_USER_KEY, raw);
      return parsed;
    } catch {
      /* ignore */
    }
  }

  return null;
}

export function setStoredAuthUser(user: StoredAuthUser): void {
  const raw = JSON.stringify(user);
  localStorage.setItem(USER_KEY, raw);
  localStorage.setItem(LEGACY_USER_KEY, raw);
  writeCookie(USER_KEY, raw, TOKEN_MAX_AGE);
}

export function clearStoredAuthUser(): void {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  clearCookie(USER_KEY);
}

/** Decode JWT payload without verifying signature (client routing only). */
export function peekTokenClaims(
  token?: string | null
): { role?: string; email?: string; userId?: string } | null {
  const value = token ?? getAuthToken();
  if (!value) return null;
  try {
    const parts = value.split(".");
    if (parts.length < 2) return null;
    const json = atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/"));
    const payload = JSON.parse(json) as {
      role?: string;
      email?: string;
      userId?: string;
    };
    return {
      role: typeof payload.role === "string" ? payload.role : undefined,
      email: typeof payload.email === "string" ? payload.email : undefined,
      userId: typeof payload.userId === "string" ? payload.userId : undefined,
    };
  } catch {
    return null;
  }
}
