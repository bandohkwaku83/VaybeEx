"use client";

import { Suspense, useEffect, useState } from "react";
import { RequireAdminAuth } from "@/components/auth/require-admin-auth";
import {
  AdminSidebar,
  useAdminSidebarCollapsed,
} from "@/components/admin/sidebar";
import { AdminTopbar } from "@/components/admin/topbar";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { getAdminDashboard } from "@/lib/api/admin";

function AdminPortalShell({ children }: { children: React.ReactNode }) {
  const { collapsed, toggle } = useAdminSidebarCollapsed();
  const [pendingApprovalCount, setPendingApprovalCount] = useState(0);
  const [resubmittedCount, setResubmittedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getAdminDashboard();
        if (!cancelled) {
          setPendingApprovalCount(res.data?.organizers.pendingApproval ?? 0);
          setResubmittedCount(res.data?.organizers.resubmitted ?? 0);
        }
      } catch {
        /* badge is best-effort */
      }
    }
    void load();

    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-40 flex overflow-hidden" style={{ background: "#f5f5f5" }}>
      <Suspense fallback={null}>
        <AdminSidebar
          collapsed={collapsed}
          onToggle={toggle}
          pendingApprovalCount={pendingApprovalCount}
          resubmittedCount={resubmittedCount}
        />
      </Suspense>
      <div className="flex flex-1 flex-col overflow-y-auto">
        <AdminTopbar
          pendingApprovalCount={pendingApprovalCount}
          resubmittedCount={resubmittedCount}
        />
        <div className="flex-1 pb-20 lg:pb-0">{children}</div>
        <AdminMobileNav
          pendingApprovalCount={pendingApprovalCount}
          resubmittedCount={resubmittedCount}
        />
      </div>
    </div>
  );
}

export default function AdminPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAdminAuth>
      <AdminPortalShell>{children}</AdminPortalShell>
    </RequireAdminAuth>
  );
}
