"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";

interface RequireAdminAuthProps {
  children: React.ReactNode;
}

function RequireAdminAuthInner({ children }: RequireAdminAuthProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Avoid bouncing when already on the login route
      if (pathname.startsWith("/admin-portal/login")) return;
      router.replace(
        `/admin-portal/login?redirect=${encodeURIComponent(returnPath)}`
      );
    }
  }, [isLoading, isAuthenticated, returnPath, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#f5f5f5" }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#171717" }} />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}

export function RequireAdminAuth({ children }: RequireAdminAuthProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center" style={{ background: "#f5f5f5" }}>
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#171717" }} />
        </div>
      }
    >
      <RequireAdminAuthInner>{children}</RequireAdminAuthInner>
    </Suspense>
  );
}
