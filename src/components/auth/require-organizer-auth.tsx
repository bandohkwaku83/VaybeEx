"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface RequireOrganizerAuthProps {
  children: React.ReactNode;
}

function RequireOrganizerAuthInner({ children }: RequireOrganizerAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const returnPath = searchParams.toString()
    ? `${pathname}?${searchParams.toString()}`
    : pathname;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/organizer/login?redirect=${encodeURIComponent(returnPath)}`);
    }
  }, [isLoading, isAuthenticated, returnPath, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return children;
}

export function RequireOrganizerAuth({ children }: RequireOrganizerAuthProps) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-stone-50">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
        </div>
      }
    >
      <RequireOrganizerAuthInner>{children}</RequireOrganizerAuthInner>
    </Suspense>
  );
}
