"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Map,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/admin-portal", label: "Overview", icon: LayoutDashboard, exact: true },
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

const STORAGE_KEY = "vaybeex-admin-sidebar-collapsed";

export function useAdminSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  const toggle = () => {
    setCollapsed((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  };

  return { collapsed: hydrated ? collapsed : false, toggle, hydrated };
}

function linkActive(
  pathname: string,
  search: string,
  link: (typeof links)[number]
) {
  if ("exact" in link && link.exact) return pathname === link.href;
  if ("match" in link && typeof link.match === "function") {
    return link.match(pathname, search);
  }
  return pathname === link.href || pathname.startsWith(`${link.href}/`);
}

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  pendingApprovalCount?: number;
}

export function AdminSidebar({
  collapsed,
  onToggle,
  pendingApprovalCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { logout, user } = useAdminAuth();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const initial = (user?.name?.trim()?.[0] ?? "A").toUpperCase();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen shrink-0 flex-col border-r bg-white transition-[width] duration-300 ease-out lg:flex",
        collapsed ? "w-[76px]" : "w-[240px]"
      )}
      style={{ borderColor: "#e5e5e5" }}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b px-4",
          collapsed ? "justify-center" : "justify-between gap-2"
        )}
        style={{ borderColor: "#e5e5e5" }}
      >
        <Link href="/admin-portal" className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: "#f5f5f5",
              boxShadow: "inset 0 0 0 1px #e5e5e5",
              color: "#171717",
            }}
          >
            <Shield className="h-4 w-4" strokeWidth={1.75} />
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span
                className="block font-display text-[15px] font-bold tracking-tight"
                style={{ color: "#171717" }}
              >
                VaybeEx
              </span>
              <span
                className="block text-[10px] font-medium uppercase tracking-[0.16em]"
                style={{ color: "#a3a3a3" }}
              >
                Operations
              </span>
            </span>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-none transition-colors hover:bg-[#f5f5f5]"
            style={{ color: "#a3a3a3" }}
            aria-label="Collapse sidebar"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto mt-1 flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-[#f5f5f5]"
          style={{ color: "#a3a3a3" }}
          aria-label="Expand sidebar"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}

      <nav className="mt-3 flex-1 space-y-1 px-3">
        {links.map((link) => {
          const active = linkActive(pathname, search, link);
          const Icon = link.icon;
          const showBadge =
            link.label === "Approvals" && pendingApprovalCount > 0;
          return (
            <div key={link.href} className="group relative">
              <Link
                href={link.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-none px-3 py-2.5 text-[13px] font-medium transition-colors",
                  collapsed && "justify-center px-0"
                )}
                style={{
                  background: active ? "#f5f5f5" : "transparent",
                  color: active ? "#171717" : "#737373",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "#fafafa";
                    e.currentTarget.style.color = "#171717";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#737373";
                  }
                }}
              >
                {active && (
                  <span
                    className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full"
                    style={{ background: "#171717" }}
                  />
                )}
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && (
                  <span className="flex flex-1 items-center justify-between gap-2">
                    {link.label}
                    {showBadge && (
                      <span
                        className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-white"
                        style={{ background: "#dc2626" }}
                      >
                        {pendingApprovalCount > 99
                          ? "99+"
                          : pendingApprovalCount}
                      </span>
                    )}
                  </span>
                )}
                {collapsed && showBadge && (
                  <span
                    className="absolute right-2 top-2 h-2 w-2 rounded-full"
                    style={{ background: "#dc2626" }}
                  />
                )}
              </Link>
              {collapsed && (
                <span
                  className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 rounded-lg border bg-white px-2.5 py-1.5 text-xs font-medium opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                  style={{
                    borderColor: "#e5e5e5",
                    color: "#171717",
                  }}
                >
                  {link.label}
                  {showBadge ? ` (${pendingApprovalCount})` : ""}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      <div className="space-y-2 border-t p-3" style={{ borderColor: "#e5e5e5" }}>
        {!collapsed && (
          <div className="mb-1 flex items-center gap-2.5 rounded-xl px-2 py-2">
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold"
              style={{
                background: "#f5f5f5",
                color: "#171717",
              }}
            >
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium" style={{ color: "#171717" }}>
                {user?.name?.split(" ")[0] ?? "Admin"}
              </p>
              <p className="truncate text-[10px]" style={{ color: "#a3a3a3" }}>
                {user?.email ?? "Platform admin"}
              </p>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            logout();
            router.push("/admin-portal/login");
          }}
          className={cn(
            "flex w-full items-center gap-3 rounded-none px-3 py-2.5 text-[13px] font-medium transition-colors",
            collapsed && "justify-center px-0"
          )}
          style={{ color: "#a3a3a3" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#dc2626";
            e.currentTarget.style.background = "#fef2f2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#a3a3a3";
            e.currentTarget.style.background = "transparent";
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {!collapsed && "Sign out"}
        </button>
      </div>
    </aside>
  );
}
