"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RequireOrganizerAuth } from "@/components/auth/require-organizer-auth";
import { OrganizerSidebar, useSidebarCollapsed } from "@/components/organizer/sidebar";
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
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "var(--bg)", color: "var(--text-secondary)" }}
      >
        Loading...
      </div>
    );
  }

  return children;
}

export default function OrganizerPortalLayout({ children }: { children: React.ReactNode }) {
  // Lifted here (not just inside OrganizerSidebar) so the content
  // area's left padding/margin can react to the same collapsed value —
  // otherwise the sidebar would animate its width while the content
  // area stayed locked to the old width, causing a jump or overlap.
  const { collapsed, toggle } = useSidebarCollapsed();

  return (
    <RequireOrganizerAuth>
      <PendingGate>
        <OrganizerTripsProvider>
          <div className="flex min-h-screen" style={{ background: "var(--bg)" }}>
            <OrganizerSidebar collapsed={collapsed} onToggle={toggle} />
            <div className="flex-1 overflow-auto">{children}</div>
          </div>
        </OrganizerTripsProvider>
      </PendingGate>
    </RequireOrganizerAuth>
  );
}