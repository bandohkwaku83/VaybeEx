import { apiRequest } from "./client";
import { getOrganizerToken } from "./auth-token";

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
  /** KYC: `pending` | `approved` | `rejected` (null before profile setup). */
  status?: string | null;
  rejectionReason?: string;
  onboardingCompleted?: boolean;
  brandSlug?: string;
  businessName?: string;
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

/**
 * KYC gate mirrors backend middleware: full access only when status === "approved".
 * `isVerified` is email verification — not KYC approval.
 * `status` null/empty before setup → undefined (send to onboarding).
 */
function mapOrganizerKycStatus(
  user: OrganizerPublicUser
): "pending" | "verified" | "rejected" | undefined {
  if (!user.onboardingCompleted) return undefined;

  const raw = String(user.status ?? "").toLowerCase().trim();
  if (raw === "rejected") return "rejected";
  if (raw === "approved") return "verified";
  // pending, pending_approval, or any other onboarded-but-not-approved value
  return "pending";
}

/** Map backend organizer user → local auth session fields. */
export function mapOrganizerSession(user: OrganizerPublicUser) {
  const organizerStatus = mapOrganizerKycStatus(user);
  return {
    name: user.fullName ?? "",
    email: user.email,
    phone: user.phone,
    role: "organizer" as const,
    organizerStatus,
    rejectionReason:
      organizerStatus === "rejected"
        ? String(user.rejectionReason ?? "").trim() || undefined
        : undefined,
  };
}

/** Where to send a signed-in organizer based on onboarding/approval state. */
export function resolveOrganizerHome(
  user: OrganizerPublicUser,
  preferredRedirect?: string | null
) {
  if (!user.onboardingCompleted) return "/organizer/onboarding";

  const kyc = mapOrganizerKycStatus(user);
  if (kyc === "pending" || kyc === "rejected") return "/organizer/pending";

  if (preferredRedirect?.startsWith("/organizer")) return preferredRedirect;
  return "/organizer/dashboard";
}
