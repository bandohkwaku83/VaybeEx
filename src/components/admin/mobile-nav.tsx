"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowDownToLine,
  LayoutDashboard,
  Map,
  ShieldCheck,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin-portal", label: "Home", icon: LayoutDashboard, exact: true },
  {
    href: "/admin-portal/users?queue=pending",
    label: "Approvals",
    icon: ShieldCheck,
    match: (pathname: string, search: string) =>
      pathname === "/admin-portal/users" &&
      (search.includes("queue=pending") ||
        search.includes("queue=pending_approval")),
  },
  {
    href: "/admin-portal/users",
    label: "People",
    icon: Users,
    match: (pathname: string, search: string) => {
      if (!pathname.startsWith("/admin-portal/users")) return false;
      if (pathname === "/admin-portal/users") {
        return (
          !search.includes("queue=pending") &&
          !search.includes("queue=pending_approval")
        );
      }
      return true;
    },
  },
  { href: "/admin-portal/trips", label: "Trips", icon: Map },
  { href: "/admin-portal/withdrawals", label: "Payouts", icon: ArrowDownToLine },
] as const;

function MobileNavInner({
  pendingApprovalCount = 0,
}: {
  pendingApprovalCount?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 lg:hidden"
      style={{ borderColor: "#e5e5e5" }}
      aria-label="Admin navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
        {items.map((item) => {
          const active =
            "exact" in item && item.exact
              ? pathname === item.href
              : "match" in item && typeof item.match === "function"
                ? item.match(pathname, search)
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const showBadge =
            item.label === "Approvals" && pendingApprovalCount > 0;
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center gap-0.5 rounded-none px-1 py-2 text-[10px] font-medium transition-colors"
                )}
                style={{
                  color: active ? "#171717" : "#a3a3a3",
                  background: active ? "#f5f5f5" : "transparent",
                }}
              >
                <span className="relative">
                  <Icon className="h-4.5 w-4.5" strokeWidth={active ? 2 : 1.75} />
                  {showBadge && (
                    <span
                      className="absolute -right-1.5 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[8px] font-bold text-white"
                      style={{ background: "#dc2626" }}
                    >
                      {pendingApprovalCount > 9 ? "9+" : pendingApprovalCount}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AdminMobileNav({
  pendingApprovalCount = 0,
}: {
  pendingApprovalCount?: number;
}) {
  return (
    <Suspense fallback={null}>
      <MobileNavInner pendingApprovalCount={pendingApprovalCount} />
    </Suspense>
  );
}
