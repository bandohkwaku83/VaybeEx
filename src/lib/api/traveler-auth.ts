import { apiRequest } from "./client";
import { getTravelerToken } from "./auth-token";

export type TravelerRegisterInput = {
  fullName: string;
  email: string;
  phone: string;
};

export type TravelerLoginInput =
  | { email: string; phone?: never }
  | { phone: string; email?: never };

export type TravelerPublicUser = {
  id: string;
  fullName?: string;
  email: string;
  phone?: string;
  role?: string;
  isVerified?: boolean;
};

export type TravelerAuthData = {
  user: TravelerPublicUser;
  token: string;
};

export type TravelerOtpMeta = {
  email?: string;
  phone?: string;
  expiresInMinutes?: number;
};

export type TravelerVerifyOtpInput = {
  code: string;
  email?: string;
  phone?: string;
};

export type TravelerResendOtpInput = {
  email?: string;
  phone?: string;
};

export function registerTraveler(input: TravelerRegisterInput) {
  return apiRequest<TravelerOtpMeta>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function loginTraveler(input: TravelerLoginInput) {
  return apiRequest<TravelerOtpMeta>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function verifyTravelerOtp(input: TravelerVerifyOtpInput) {
  return apiRequest<TravelerAuthData>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function resendTravelerOtp(input: TravelerResendOtpInput) {
  return apiRequest<TravelerOtpMeta>("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getTravelerMe() {
  const token = getTravelerToken();
  return apiRequest<TravelerPublicUser>("/api/auth/me", {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

/** Map backend traveler user → local auth session fields. */
export function mapTravelerSession(user: TravelerPublicUser) {
  return {
    name: user.fullName ?? "",
    email: user.email,
    phone: user.phone,
    role: "traveler" as const,
  };
}

/** Detect whether a value looks like an email vs phone for login. */
export function isEmailIdentifier(value: string): boolean {
  return value.includes("@");
}

/** Normalize phone for login (API examples omit spaces). */
export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, "");
}
