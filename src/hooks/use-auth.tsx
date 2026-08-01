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
import { toast } from "sonner";
import {
  clearAuthToken,
  clearOrganizerToken,
  clearStoredAuthUser,
  clearTravelerToken,
  getOrganizerToken,
  getStoredAuthUser,
  getTravelerToken,
  peekTokenClaims,
  setStoredAuthUser,
  type StoredAuthUser,
} from "@/lib/api/auth-token";
import { ApiError } from "@/lib/api/client";
import {
  getOrganizerMe,
  logoutOrganizer,
  mapOrganizerSession,
} from "@/lib/api/organizer-auth";
import { syncOrganizerProfileCache } from "@/lib/api/organizer-profile";
import { getTravelerMe, mapTravelerSession } from "@/lib/api/traveler-auth";

export type User = StoredAuthUser;

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  requireAuth: (action: () => void, redirectPath?: string) => void;
  /** Favorites / traveler-only actions. Organizers are sent to traveler login. */
  requireTravelerAuth: (action: () => void, redirectPath?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function clearLocalSession(setUser: (user: User | null) => void) {
  setUser(null);
  clearStoredAuthUser();
  clearAuthToken();
}

function isOrganizerSession(user: User | null) {
  return (
    user?.role === "organizer" ||
    user?.organizerStatus === "pending" ||
    user?.organizerStatus === "verified" ||
    user?.organizerStatus === "rejected"
  );
}

function isTravelerSession(user: User | null) {
  return user?.role === "traveler";
}

function onOrganizerRoute() {
  return (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/organizer")
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const travelerToken = getTravelerToken();
      const organizerToken = getOrganizerToken();
      const stored = getStoredAuthUser();

      // Show last-known user immediately so tenant navigations don't flash
      // a signed-out navbar while /me refreshes.
      if (stored && !cancelled) {
        setUser(stored);
      }

      try {
        // Public pages prefer traveler session for booking identity.
        if (!onOrganizerRoute() && travelerToken) {
          try {
            const response = await getTravelerMe();
            const me = response.data;
            if (!cancelled && me) {
              const next = mapTravelerSession(me);
              setUser(next);
              setStoredAuthUser(next);
              return;
            }
          } catch (error) {
            // Only drop the token on hard auth failures. Network blips must
            // not sign the user out when opening a trip page.
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
              clearTravelerToken();
            } else if (stored && isTravelerSession(stored) && !cancelled) {
              setUser(stored);
              return;
            }
          }
        }

        if (onOrganizerRoute() && organizerToken) {
          const claims = peekTokenClaims(organizerToken);
          const seed =
            stored &&
            (isOrganizerSession(stored) ||
              !stored.role ||
              (claims?.email &&
                stored.email &&
                stored.email === claims.email))
              ? {
                  ...stored,
                  role: "organizer" as const,
                  email: claims?.email || stored.email,
                }
              : claims?.email
                ? {
                    name: stored?.name || "",
                    email: claims.email,
                    role: "organizer" as const,
                    organizerStatus: stored?.organizerStatus,
                  }
                : stored && isOrganizerSession(stored)
                  ? { ...stored, role: "organizer" as const }
                  : null;

          // Paint last-known session immediately, then refresh from /me.
          if (!cancelled && seed) {
            setUser(seed);
            setStoredAuthUser(seed);
          }

          try {
            const response = await getOrganizerMe();
            const me = response.data;
            if (!cancelled && me) {
              const next = mapOrganizerSession(me);
              setUser(next);
              setStoredAuthUser(next);
              syncOrganizerProfileCache(me);
            }
          } catch (error) {
            if (
              error instanceof ApiError &&
              (error.status === 401 || error.status === 403)
            ) {
              clearOrganizerToken();
              if (!travelerToken) {
                clearStoredAuthUser();
                if (!cancelled) setUser(null);
              }
            }
            // Network blips keep the seeded session.
          }
          return;
        }

        // Organizer browsing the public site (no traveler token)
        if (organizerToken && !travelerToken) {
          try {
            const response = await getOrganizerMe();
            const me = response.data;
            if (!cancelled && me) {
              const next = mapOrganizerSession(me);
              setUser(next);
              setStoredAuthUser(next);
              syncOrganizerProfileCache(me);
              return;
            }
          } catch (error) {
            if (
              error instanceof ApiError &&
              (error.status === 401 || error.status === 403)
            ) {
              clearOrganizerToken();
            } else if (stored && isOrganizerSession(stored) && !cancelled) {
              setUser({ ...stored, role: "organizer" });
              return;
            }
          }

          if (stored && isOrganizerSession(stored)) {
            const next = { ...stored, role: "organizer" as const };
            if (!cancelled) {
              setUser(next);
              setStoredAuthUser(next);
            }
            return;
          }
          const claims = peekTokenClaims(organizerToken);
          if (claims?.email && !cancelled) {
            const next = {
              name: stored?.name || "",
              email: claims.email,
              role: "organizer" as const,
            };
            setUser(next);
            setStoredAuthUser(next);
            return;
          }
        }

        // Keep stored traveler if we still have a token but /me returned empty
        if (travelerToken && stored && isTravelerSession(stored) && !cancelled) {
          setUser(stored);
          return;
        }

        // Truly signed out
        if (!travelerToken && !organizerToken) {
          clearStoredAuthUser();
          if (!cancelled) setUser(null);
        }
      } catch {
        if (stored && !cancelled) setUser(stored);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((next: User) => {
    setUser(next);
    setStoredAuthUser(next);
  }, []);

  const logout = useCallback(async () => {
    const organizerToken = getOrganizerToken();
    const loggingOutOrganizer =
      Boolean(organizerToken) &&
      (isOrganizerSession(user) || onOrganizerRoute());

    if (loggingOutOrganizer) {
      try {
        const response = await logoutOrganizer();
        toast.success(response.message);
      } catch (error) {
        const message =
          error instanceof ApiError
            ? error.message
            : "Something went wrong. Please try again.";
        toast.error(message);
      }
      clearOrganizerToken();
      const travelerToken = getTravelerToken();
      if (travelerToken) {
        try {
          const response = await getTravelerMe();
          if (response.data) {
            const next = mapTravelerSession(response.data);
            setUser(next);
            setStoredAuthUser(next);
            return;
          }
        } catch {
          /* keep going */
        }
        const stored = getStoredAuthUser();
        if (stored && isTravelerSession(stored)) {
          setUser(stored);
          return;
        }
      }
      clearStoredAuthUser();
      setUser(null);
      return;
    }

    clearLocalSession(setUser);
  }, [user]);

  const requireAuth = useCallback(
    (action: () => void, redirectPath?: string) => {
      if (user) {
        action();
        return;
      }
      toast.info("Sign in or create an account to continue");
      const redirect =
        redirectPath ?? window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
    },
    [user, router]
  );

  const requireTravelerAuth = useCallback(
    (action: () => void, redirectPath?: string) => {
      const travelerToken = getTravelerToken();
      if (
        travelerToken &&
        (isTravelerSession(user) || !isOrganizerSession(user))
      ) {
        if (!isTravelerSession(user)) {
          void (async () => {
            try {
              const response = await getTravelerMe();
              if (response.data) {
                const next = mapTravelerSession(response.data);
                setUser(next);
                setStoredAuthUser(next);
              }
            } catch {
              /* booking page will re-check */
            }
            action();
          })();
          return;
        }
        action();
        return;
      }

      const redirect =
        redirectPath ?? window.location.pathname + window.location.search;

      if (isOrganizerSession(user) && !travelerToken) {
        toast.info("Sign in as a traveler to continue booking");
        router.push(`/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }

      toast.info("Sign in as a traveler to continue");
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
        requireTravelerAuth,
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
