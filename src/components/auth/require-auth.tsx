"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { getTravelerToken } from "@/lib/api/auth-token";

interface RequireAuthProps {
  children: React.ReactNode;
  /** When true, organizers must sign in as a traveler (booking flow). */
  travelerOnly?: boolean;
}

function RequireAuthInner({
  children,
  travelerOnly = false,
}: RequireAuthProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  const travelerToken = getTravelerToken();
  const isTraveler = user?.role === "traveler" || Boolean(travelerToken);

  const allowed = travelerOnly
    ? Boolean(travelerToken) && isTraveler
    : isAuthenticated;

  useEffect(() => {
    if (isLoading) return;

    if (travelerOnly) {
      if (!travelerToken) {
        router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`);
      }
      return;
    }

    if (!isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`);
    }
  }, [
    isLoading,
    isAuthenticated,
    travelerOnly,
    travelerToken,
    returnPath,
    router,
  ]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2
          className="h-6 w-6 animate-spin"
          style={{ color: "var(--primary)" }}
        />
      </div>
    );
  }

  if (!allowed) return null;

  return children;
}

export function RequireAuth({
  children,
  travelerOnly = false,
}: RequireAuthProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2
            className="h-6 w-6 animate-spin"
            style={{ color: "var(--primary)" }}
          />
        </div>
      }
    >
      <RequireAuthInner travelerOnly={travelerOnly}>{children}</RequireAuthInner>
    </Suspense>
  );
}
