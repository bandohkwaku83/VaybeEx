"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";

export interface User {
  name: string;
  email: string;
  phone?: string;
  organizerStatus?: "pending" | "verified";
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  requireAuth: (action: () => void, redirectPath?: string) => void;
}

const STORAGE_KEY = "trripx-user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((next: User) => {
    setUser(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const requireAuth = useCallback(
    (action: () => void, redirectPath?: string) => {
      if (user) {
        action();
        return;
      }
      const redirect = redirectPath ?? window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    },
    [user, router]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
