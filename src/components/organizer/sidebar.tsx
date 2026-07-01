"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, PlusCircle, Wallet, ArrowDownToLine, RotateCcw,
  MessageSquare, Compass, LogOut, BookOpen, Settings, ChevronsLeft, ChevronsRight,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { VerifiedBadge } from "@/components/trips/verified-badge";

const links = [
  { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizer/trips/new", label: "Create Trip", icon: PlusCircle },
  { href: "/organizer/payouts", label: "Payouts", icon: Wallet },
  { href: "/organizer/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/organizer/withdrawals", label: "Withdrawals", icon: ArrowDownToLine },
  { href: "/organizer/messages", label: "Communication", icon: MessageSquare },
  { href: "/organizer/settings", label: "Settings", icon: Settings },
];

const STORAGE_KEY = "vaybeex-organizer-sidebar-collapsed";

/**
 * Collapse state is lifted to a tiny custom hook (rather than local
 * useState only) so the parent layout can read it too — the layout
 * needs to know the current width to size the content area correctly.
 * Persisted to localStorage so it survives a page refresh.
 */
export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "1") {
setCollapsed(true);
    } 
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

interface OrganizerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function OrganizerSidebar({ collapsed, onToggle }: OrganizerSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r transition-[width] duration-300 ease-in-out lg:flex",
        collapsed ? "w-[76px]" : "w-64"
      )}
      style={{ borderColor: "var(--border)", background: "var(--surface)" }}
    >
      {/* ── Logo + collapse toggle ─────────────────────────────── */}
      <div
        className={cn(
          "flex h-[65px] items-center border-b px-4",
          collapsed ? "justify-center" : "justify-between"
        )}
        style={{ borderColor: "var(--border)" }}
      >
        <Link href="/organizer/dashboard" className="flex items-center gap-2 overflow-hidden">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Compass className="h-4 w-4" style={{ color: "#fbf7f1" }} />
          </div>
          {!collapsed && (
            <div className="whitespace-nowrap">
              <span className="font-display text-sm font-bold" style={{ color: "var(--text)" }}>
                Vaybe<span style={{ color: "var(--primary)" }}>Ex</span>
              </span>
              <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>Organizer Portal</p>
            </div>
          )}
        </Link>

        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            aria-label="Collapse sidebar"
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary-dim)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button — only shown collapsed, sits on its own row to stay centered */}
      {collapsed && (
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto mt-2 flex h-7 w-7 items-center justify-center rounded-lg transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          aria-label="Expand sidebar"
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "var(--primary-dim)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "transparent")}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      )}

      {/* ── Nav ────────────────────────────────────────────────── */}
      <nav className="flex-1 space-y-1 p-3">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/organizer/dashboard" && pathname.startsWith(link.href));
          return (
            <div key={link.href} className="group relative">
              <Link
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0"
                )}
                style={{
                  background: active ? "var(--primary-dim)" : "transparent",
                  color: active ? "var(--primary)" : "var(--text-secondary)",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                }}
              >
                <link.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{link.label}</span>}
              </Link>

              {/* Tooltip on hover when collapsed */}
              {collapsed && (
                <span
                  className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                  style={{ background: "var(--primary-dark)", color: "#fbf7f1" }}
                >
                  {link.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div className="border-t p-4" style={{ borderColor: "var(--border)" }}>
        {!collapsed && (
          <div className="mb-3 flex items-center gap-2">
            <VerifiedBadge />
          </div>
        )}

        <FooterLink href="/organizer" icon={BookOpen} label="Organizer guide" collapsed={collapsed} />
        <FooterLink href="/" icon={Compass} label="Traveler site" collapsed={collapsed} />

        <div className="group relative mt-1">
          <button
            type="button"
            onClick={logout}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
              collapsed && "justify-center px-0"
            )}
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--coral)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "var(--text-tertiary)")}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "Sign out"}
          </button>
          {collapsed && (
            <span
              className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
              style={{ background: "var(--primary-dark)", color: "#fbf7f1" }}
            >
              Sign out
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}

function FooterLink({
  href, icon: Icon, label, collapsed,
}: { href: string; icon: typeof BookOpen; label: string; collapsed: boolean }) {
  return (
    <div className="group relative">
      <Link
        href={href}
        className={cn(
          "mb-1 flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors",
          collapsed && "justify-center px-0"
        )}
        style={{ color: "var(--text-tertiary)" }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--primary)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "var(--text-tertiary)")}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && label}
      </Link>
      {collapsed && (
        <span
          className="pointer-events-none absolute left-full top-1/2 z-50 ml-2 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
          style={{ background: "var(--primary-dark)", color: "#fbf7f1" }}
        >
          {label}
        </span>
      )}
    </div>
  );
}