"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RequireOrganizerAuth } from "@/components/auth/require-organizer-auth";
import { OrganizerSidebar, useSidebarCollapsed } from "@/components/organizer/sidebar";
import { OrganizerTopbar } from "@/components/organizer/topbar";
import {
  OrganizerMobileBottomNav,
  OrganizerMobileDrawer,
} from "@/components/organizer/mobile-nav";
import { OrganizerTripsProvider } from "@/hooks/use-organizer-trips";
import { useAuth } from "@/hooks/use-auth";

function PortalGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user) return;

    if (user.organizerStatus === "pending" || user.organizerStatus === "rejected") {
      router.replace("/organizer/pending");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#f5f5f5" }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--primary)" }} />
      </div>
    );
  }

  if (
    user?.organizerStatus === "pending" ||
    user?.organizerStatus === "rejected"
  ) {
    return null;
  }

  return <>{children}</>;
}

export default function OrganizerPortalLayout({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle } = useSidebarCollapsed();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <RequireOrganizerAuth>
      <PortalGate>
        <OrganizerTripsProvider>
          <div className="flex min-h-screen" style={{ background: "#f5f5f5" }}>
            <OrganizerSidebar collapsed={collapsed} onToggle={toggle} />
            <div className="flex min-h-screen min-w-0 flex-1 flex-col overflow-auto">
              <OrganizerTopbar
                menuOpen={mobileMenuOpen}
                onMenuToggle={() => setMobileMenuOpen((v) => !v)}
              />
              <div className="flex-1 pb-[calc(4.25rem+env(safe-area-inset-bottom))] lg:pb-0">
                {children}
              </div>
            </div>
          </div>
          <OrganizerMobileDrawer
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
          />
          <OrganizerMobileBottomNav
            onOpenMenu={() => setMobileMenuOpen(true)}
          />
        </OrganizerTripsProvider>
      </PortalGate>
    </RequireOrganizerAuth>
  );
}
