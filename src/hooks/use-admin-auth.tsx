"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  clearAdminToken,
  getAdminToken,
  setAdminToken,
} from "@/lib/api/auth-token";
import { ApiError } from "@/lib/api/client";
import {
  getAdminMe,
  loginAdmin,
  mapAdminSession,
  type AdminLoginInput,
} from "@/lib/api/admin-auth";

export type AdminSessionUser = {
  id: string;
  name: string;
  email: string;
  role: "admin";
};

interface AdminAuthContextValue {
  user: AdminSessionUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: AdminLoginInput) => Promise<AdminSessionUser>;
  logout: () => void;
  refresh: () => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

const ADMIN_USER_KEY = "vaybeex-admin-user";

function readStoredAdminUser(): AdminSessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AdminSessionUser;
    if (parsed?.email && parsed?.role === "admin") return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function writeStoredAdminUser(user: AdminSessionUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    localStorage.removeItem(ADMIN_USER_KEY);
    return;
  }
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getAdminToken();
    if (!token) {
      setUser(null);
      writeStoredAdminUser(null);
      return false;
    }

    try {
      const response = await getAdminMe();
      const me = response.data?.user;
      if (!me || me.role !== "admin") {
        clearAdminToken();
        setUser(null);
        writeStoredAdminUser(null);
        return false;
      }
      const next = mapAdminSession(me);
      setUser(next);
      writeStoredAdminUser(next);
      return true;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        clearAdminToken();
        setUser(null);
        writeStoredAdminUser(null);
        return false;
      }
      // Soft failure: keep cached user only if a token is still present
      const cached = readStoredAdminUser();
      if (cached && getAdminToken()) {
        setUser(cached);
        return true;
      }
      setUser(null);
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const token = getAdminToken();
      if (!token) {
        writeStoredAdminUser(null);
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        await refresh();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [refresh]);

  const login = useCallback(async (input: AdminLoginInput) => {
    const response = await loginAdmin(input);
    const { user: raw, token } = response.data ?? {};
    if (!raw || !token || raw.role !== "admin") {
      throw new ApiError(
        response.message || "Unable to sign in as admin.",
        401,
        response
      );
    }
    setAdminToken(token);
    const next = mapAdminSession(raw);
    setUser(next);
    writeStoredAdminUser(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    clearAdminToken();
    writeStoredAdminUser(null);
    setUser(null);
  }, []);

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth must be used within AdminAuthProvider");
  }
  return ctx;
}
