"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownToLine,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  PlusCircle,
  RotateCcw,
  Settings,
  Wallet,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { BrandLogo } from "@/components/brand-logo";
import { DEFAULT_PROFILE_IMAGE } from "@/lib/api/media";
import { getOrganizerProfile } from "@/lib/organizer-profile";
import { cn } from "@/lib/utils";

export const ORGANIZER_NAV_LINKS = [
  { href: "/organizer/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/organizer/trips/new", label: "My Trips", icon: PlusCircle },
  { href: "/organizer/payouts", label: "Payouts", icon: Wallet },
  { href: "/organizer/withdrawals", label: "Withdrawals", icon: ArrowDownToLine },
  { href: "/organizer/refunds", label: "Refunds", icon: RotateCcw },
  { href: "/organizer/messages", label: "Messages", icon: MessageSquare },
  { href: "/organizer/settings", label: "Settings", icon: Settings },
] as const;

export function organizerLinkActive(pathname: string, href: string) {
  if (href === "/organizer/dashboard") return pathname === href;
  if (href === "/organizer/trips/new") {
    return pathname === href || pathname.startsWith("/organizer/trips/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const BOTTOM_LINKS = [
  ORGANIZER_NAV_LINKS[0],
  ORGANIZER_NAV_LINKS[1],
  ORGANIZER_NAV_LINKS[2],
  ORGANIZER_NAV_LINKS[5],
] as const;

export function OrganizerMobileMenuButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none transition-colors lg:hidden"
      style={{ color: "var(--text)", background: "var(--bg-secondary)" }}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
    >
      {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
    </button>
  );
}

export function OrganizerMobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();
  const [brandLabel, setBrandLabel] = useState("VaybeEx");
  const [brandLogo, setBrandLogo] = useState<string | null>(null);

  useEffect(() => {
    try {
      const profile = getOrganizerProfile();
      setBrandLabel(profile.businessName.trim() || "VaybeEx");
      setBrandLogo(profile.brandLogo);
    } catch {
      setBrandLabel("VaybeEx");
      setBrandLogo(null);
    }
  }, [user?.name, user?.email, user?.organizerStatus]);

  useEffect(() => {
    onClose();
    // Close when route changes; intentionally omit onClose from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[min(100%,20rem)] flex-col bg-white shadow-xl lg:hidden"
          >
            <div
              className="flex h-[65px] items-center justify-between border-b px-4"
              style={{ borderColor: "var(--border)" }}
            >
              <Link
                href="/organizer/dashboard"
                className="flex min-w-0 items-center gap-2.5"
                onClick={onClose}
              >
                {brandLogo ? (
                  <>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg">
                      <img
                        src={brandLogo || DEFAULT_PROFILE_IMAGE}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </span>
                    <span
                      className="truncate font-display text-sm font-bold tracking-tight"
                      style={{ color: "var(--text)" }}
                    >
                      {brandLabel}
                    </span>
                  </>
                ) : (
                  <BrandLogo
                    size="sm"
                    withWordmark
                    wordmarkClassName="text-sm"
                    wordmarkStyle={{ color: "var(--text)" }}
                  />
                )}
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 items-center justify-center rounded-none"
                style={{ color: "var(--text-tertiary)" }}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
              {ORGANIZER_NAV_LINKS.map((link) => {
                const active = organizerLinkActive(pathname, link.href);
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium transition-colors"
                    style={{
                      background: active ? "var(--primary)" : "transparent",
                      color: active ? "#fbf7f1" : "var(--text-secondary)",
                    }}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="border-t p-3" style={{ borderColor: "var(--border)" }}>
              <button
                type="button"
                onClick={async () => {
                  onClose();
                  await logout();
                  router.push("/organizer/login");
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-[14px] font-medium"
                style={{ color: "var(--coral)" }}
              >
                <LogOut className="h-[18px] w-[18px] shrink-0" strokeWidth={1.75} />
                Sign out
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function OrganizerMobileBottomNav({
  onOpenMenu,
}: {
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-white px-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))] pt-1.5 lg:hidden"
      style={{
        borderColor: "var(--border)",
        boxShadow: "0 -8px 24px rgba(42,27,15,0.06)",
      }}
      aria-label="Organizer navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5">
        {BOTTOM_LINKS.map((item) => {
          const active = organizerLinkActive(pathname, item.href);
          const Icon = item.icon;
          const label =
            item.label === "My Trips"
              ? "Trips"
              : item.label === "Dashboard"
                ? "Home"
                : item.label;
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className="flex flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] font-semibold transition-colors"
                style={{
                  color: active ? "var(--primary)" : "var(--text-tertiary)",
                  background: active ? "var(--primary-dim)" : "transparent",
                }}
              >
                <Icon className="h-5 w-5" strokeWidth={active ? 2 : 1.75} />
                <span className="truncate">{label}</span>
              </Link>
            </li>
          );
        })}
        <li className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex w-full flex-col items-center gap-0.5 rounded-none px-1 py-2 text-[10px] font-semibold transition-colors"
            style={{ color: "var(--text-tertiary)" }}
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
            <span className="truncate">Menu</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
