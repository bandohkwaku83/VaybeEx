"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface RequireAuthProps {
  children: React.ReactNode;
}

function RequireAuthInner({ children }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(returnPath)}`);
    }
  }, [isLoading, isAuthenticated, returnPath, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}

export function RequireAuth({ children }: RequireAuthProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      }
    >
      <RequireAuthInner>{children}</RequireAuthInner>
    </Suspense>
  );
}
