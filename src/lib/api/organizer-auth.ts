import { apiRequest } from "./client";
import { getOrganizerToken } from "./auth-token";
import {
  extractOrganizerKyc,
  kycToLegacyOrganizerStatus,
  nextOrganizerRoute,
  normalizeOrganizerKyc,
  type OrganizerKyc,
} from "@/lib/organizer-kyc";

export type OrganizerRegisterInput = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type OrganizerRegisterData = {
  email: string;
  expiresInMinutes?: number;
};

/**
 * GET /api/organizer/auth/me — live organizer session + public profile.
 * Media paths use API names (`profilePhoto`, `brandLogo`, `nationalIdPhoto`).
 * `*Url` aliases are accepted for older payloads.
 */
export type OrganizerPublicUser = {
  id: string;
  fullName?: string;
  email: string;
  phone?: string;
  whatsapp?: string | null;
  location?: string;
  aboutYou?: string;
  tripSpecialties?: string[];
  profilePhoto?: string | null;
  brandLogo?: string | null;
  nationalIdPhoto?: string | null;
  /** @deprecated Prefer `profilePhoto` */
  profilePhotoUrl?: string | null;
  /** @deprecated Prefer `brandLogo` */
  brandLogoUrl?: string | null;
  /** @deprecated Prefer `nationalIdPhoto` */
  nationalIdPhotoUrl?: string | null;
  role: string;
  isVerified: boolean;
  authProvider?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewedAt?: string;
  resubmittedAt?: string;
  resubmissionCount?: number;
  /** KYC: `pending` | `approved` | `rejected` (null before profile setup). */
  status?: string | null;
  rejectionReason?: string;
  onboardingCompleted?: boolean;
  canPublish?: boolean;
  canResubmit?: boolean;
  kyc?: OrganizerKyc | null;
  brandSlug?: string;
  businessName?: string;
  unreadNotifications?: number;
};

export type OrganizerAuthData = {
  user: OrganizerPublicUser;
  token: string;
};

export type OrganizerOtpMeta = {
  email: string;
  expiresInMinutes?: number;
};

export type OrganizerLoginInput = {
  email: string;
  password: string;
};

export function registerOrganizer(input: OrganizerRegisterInput) {
  return apiRequest<OrganizerRegisterData>("/api/organizer/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginOrganizer(input: OrganizerLoginInput) {
  return apiRequest<OrganizerAuthData>("/api/organizer/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** POST /api/organizer/auth/google — exchange Google ID token for an organizer session. */
export function loginOrganizerWithGoogle(input: { idToken: string }) {
  return apiRequest<OrganizerAuthData>("/api/organizer/auth/google", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function logoutOrganizer() {
  const token = getOrganizerToken();
  return apiRequest("/api/organizer/auth/logout", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export function verifyOrganizerOtp(input: { email: string; code: string }) {
  return apiRequest<OrganizerAuthData>("/api/organizer/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resendOrganizerOtp(input: { email: string }) {
  return apiRequest<OrganizerOtpMeta>("/api/organizer/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** GET /api/organizer/auth/me — session + public profile. */
export function getOrganizerMe() {
  const token = getOrganizerToken();
  return apiRequest<OrganizerPublicUser>("/api/organizer/auth/me", {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

export type UpdateOrganizerPasswordInput = {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
};

/** PATCH /api/organizer/auth/password — keep session; token stays valid. */
export function updateOrganizerPassword(input: UpdateOrganizerPasswordInput) {
  const token = getOrganizerToken();
  return apiRequest("/api/organizer/auth/password", {
    method: "PATCH",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: JSON.stringify(input),
  });
}

export function organizerKycFromUser(user: OrganizerPublicUser): OrganizerKyc {
  return normalizeOrganizerKyc(user);
}

/** Map backend organizer user → local auth session fields. KYC is never read from the JWT. */
export function mapOrganizerSession(user: OrganizerPublicUser) {
  const kyc = organizerKycFromUser(user);
  return {
    name: user.fullName ?? "",
    email: user.email,
    phone: user.phone,
    role: "organizer" as const,
    kyc,
    organizerStatus: kycToLegacyOrganizerStatus(kyc),
    rejectionReason: kyc.rejectionReason ?? undefined,
  };
}

/** Where to send a signed-in organizer based on onboarding/approval state. */
export function resolveOrganizerHome(
  user: OrganizerPublicUser,
  preferredRedirect?: string | null
) {
  const kyc = organizerKycFromUser(user);
  if (
    kyc.status === "approved" &&
    preferredRedirect?.startsWith("/organizer") &&
    !preferredRedirect.startsWith("/organizer/login")
  ) {
    return preferredRedirect;
  }
  return nextOrganizerRoute(kyc);
}

export { extractOrganizerKyc, nextOrganizerRoute, normalizeOrganizerKyc };
export type { OrganizerKyc };
