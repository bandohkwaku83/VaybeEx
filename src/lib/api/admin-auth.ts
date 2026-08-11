import { apiRequest } from "./client";
import { getAdminToken } from "./auth-token";

export type AdminPublicUser = {
  id: string;
  email: string;
  fullName?: string;
  location?: string;
  whatsapp?: string;
  role: "admin" | string;
  isVerified?: boolean;
  authProvider?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminAuthData = {
  user: AdminPublicUser;
  token: string;
};

export type AdminLoginInput = {
  email: string;
  password: string;
};

function bearerHeaders(): HeadersInit {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function loginAdmin(input: AdminLoginInput) {
  return apiRequest<AdminAuthData>("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

/** GET /api/admin/auth/me — session check. */
export function getAdminMe() {
  return apiRequest<{ user: AdminPublicUser }>("/api/admin/auth/me", {
    method: "GET",
    headers: bearerHeaders(),
  });
}

export function mapAdminSession(user: AdminPublicUser) {
  return {
    id: user.id,
    name: user.fullName?.trim() || user.email.split("@")[0] || "Admin",
    email: user.email,
    role: "admin" as const,
  };
}
