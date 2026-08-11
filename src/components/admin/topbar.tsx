"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";

function resolveMeta(pathname: string, search: string) {
  if (pathname === "/admin-portal") {
    return { title: "Overview", subtitle: "What needs your attention" };
  }
  if (pathname.startsWith("/admin-portal/users/") && pathname !== "/admin-portal/users") {
    return { title: "Person", subtitle: "Account detail & review" };
  }
  if (pathname.startsWith("/admin-portal/users")) {
    const isQueue =
      search.includes("queue=pending") ||
      search.includes("queue=resubmitted") ||
      search.includes("queue=rejected");
    const subtitle = search.includes("queue=resubmitted")
      ? "Came back after a rejection — check what you asked them to fix"
      : search.includes("queue=rejected")
        ? "Waiting on the organizer to update and resubmit"
        : "First reviews and resubmits waiting on a decision";
    return isQueue
      ? { title: "Approvals", subtitle }
      : { title: "People", subtitle: "Travelers & organizers" };
  }
  if (pathname.startsWith("/admin-portal/activity")) {
    return { title: "Activity", subtitle: "Who did what, and when" };
  }
  if (pathname.startsWith("/admin-portal/messages/") && pathname !== "/admin-portal/messages") {
    return { title: "Campaign", subtitle: "Delivery status by recipient" };
  }
  if (pathname.startsWith("/admin-portal/messages")) {
    return { title: "Messages", subtitle: "Text or email people on VaybeEx" };
  }
  if (pathname.startsWith("/admin-portal/trips")) {
    return { title: "Trips", subtitle: "Listings across the platform" };
  }
  if (pathname.startsWith("/admin-portal/refunds/") && pathname !== "/admin-portal/refunds") {
    return { title: "Refund", subtitle: "Cancellation detail · read only" };
  }
  if (pathname.startsWith("/admin-portal/refunds")) {
    return { title: "Refunds", subtitle: "Traveler cancellation pipeline" };
  }
  if (pathname.startsWith("/admin-portal/withdrawals")) {
    return {
      title: "Payouts",
      subtitle: "Review requests, send MoMo, then mark paid",
    };
  }
  return { title: "Admin", subtitle: "Platform operations" };
}

function AdminTopbarInner({
  pendingApprovalCount = 0,
  resubmittedCount = 0,
}: {
  pendingApprovalCount?: number;
  resubmittedCount?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const meta = resolveMeta(pathname, search);
  const isOverview = pathname === "/admin-portal";

  return (
    <header className="sticky top-0 z-30 shrink-0">
      <div
        className="flex h-14 items-center gap-3 border-b bg-white px-4 sm:h-16 sm:px-6 lg:px-8"
        style={{ borderColor: "#e5e5e5" }}
      >
        <div className="min-w-0 flex-1 lg:hidden">
          <p
            className="truncate font-display text-base font-bold tracking-tight"
            style={{ color: "#171717" }}
          >
            VaybeEx
            <span
              className="ml-2 text-[10px] font-sans font-semibold uppercase tracking-[0.14em]"
              style={{ color: "#a3a3a3" }}
            >
              Ops
            </span>
          </p>
        </div>

        <div className="hidden min-w-0 flex-1 lg:block">
          {!isOverview && (
            <>
              <p
                className="truncate font-display text-lg font-bold tracking-tight"
                style={{ color: "#171717" }}
              >
                {meta.title}
              </p>
              <p className="truncate text-xs" style={{ color: "#a3a3a3" }}>
                {meta.subtitle}
              </p>
            </>
          )}
          {isOverview && (
            <p
              className="truncate text-xs font-medium uppercase tracking-[0.16em]"
              style={{ color: "#a3a3a3" }}
            >
              Operations desk
            </p>
          )}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {resubmittedCount > 0 ? (
            <Link
              href="/admin-portal/users?queue=resubmitted"
              className="group inline-flex items-center gap-2 rounded-none px-3 py-1.5 text-xs font-semibold"
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                boxShadow: "inset 0 0 0 1px #fecaca",
              }}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="tabular-nums">{resubmittedCount}</span>
              <span className="hidden sm:inline">resubmitted</span>
              <ArrowRight className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : pendingApprovalCount > 0 ? (
            <Link
              href="/admin-portal/users?queue=pending_approval"
              className="group inline-flex items-center gap-2 rounded-none px-3 py-1.5 text-xs font-semibold"
              style={{
                background: "#fef2f2",
                color: "#dc2626",
                boxShadow: "inset 0 0 0 1px #fecaca",
              }}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="tabular-nums">{pendingApprovalCount}</span>
              <span className="hidden sm:inline">awaiting review</span>
              <ArrowRight className="h-3 w-3 opacity-60 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}

export function AdminTopbar({
  pendingApprovalCount = 0,
  resubmittedCount = 0,
}: {
  pendingApprovalCount?: number;
  resubmittedCount?: number;
}) {
  return (
    <Suspense
      fallback={
        <header
          className="sticky top-0 z-30 h-14 shrink-0 border-b bg-white sm:h-16"
          style={{ borderColor: "#e5e5e5" }}
        />
      }
    >
      <AdminTopbarInner
        pendingApprovalCount={pendingApprovalCount}
        resubmittedCount={resubmittedCount}
      />
    </Suspense>
  );
}
