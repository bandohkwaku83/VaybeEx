"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireOrganizerAuth } from "@/components/auth/require-organizer-auth";
import { OrganizerSidebar } from "@/components/organizer/sidebar";
import { OrganizerTripsProvider } from "@/hooks/use-organizer-trips";
import { useAuth } from "@/hooks/use-auth";

function PendingGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.organizerStatus === "pending") {
      router.replace("/organizer/pending");
    }
  }, [user, isLoading, router]);

  if (isLoading || user?.organizerStatus === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center text-stone-500">
        Loading...
      </div>
    );
  }

  return children;
}

export default function OrganizerPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireOrganizerAuth>
      <PendingGate>
        <OrganizerTripsProvider>
          <div className="flex min-h-screen">
            <OrganizerSidebar />
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </OrganizerTripsProvider>
      </PendingGate>
    </RequireOrganizerAuth>
  );
}
