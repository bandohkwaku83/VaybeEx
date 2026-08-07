"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, LogOut, Menu, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import {
  getBrandFromHost,
  getRootAbsoluteUrl,
} from "@/lib/tenant-host";
import { cn } from "@/lib/utils";

const publicNavLinks = [
  { href: "/", label: "Explore" },
  { href: "/organizer", label: "Become an Organizer" },
];

const authNavLinks = [
  { href: "/dashboard", label: "My Trips" },
  { href: "/wishlist", label: "Wishlist" },
];

/** On organizer subdomains, send platform links to the apex host. */
function useApexHref() {
  const [onTenant, setOnTenant] = useState(false);

  useEffect(() => {
    setOnTenant(Boolean(getBrandFromHost(window.location.host)));
  }, []);

  return (path: string) =>
    onTenant ? getRootAbsoluteUrl(path) : path;
}

export function Navbar() {
  const pathname = usePathname();
  const apexHref = useApexHref();
  const { isAuthenticated, user, logout } = useAuth();
  const isTraveler = user?.role === "traveler";
  const navLinks = isAuthenticated && isTraveler
    ? [...publicNavLinks, ...authNavLinks]
    : publicNavLinks;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isOrganizerLanding = pathname === "/organizer";
  const lightOverlay = isOrganizerLanding && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hide on organizer portal/auth routes — the landing page (`/organizer`) keeps the main nav.
  if (pathname.startsWith("/organizer") && !isOrganizerLanding) return null;
  if (pathname.startsWith("/admin-portal") || pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/login")) return null;

  return (
    <header
      className={cn("fixed top-0 z-50 w-full")}
      style={{
        borderBottom: scrolled
          ? "1px solid var(--border-strong)"
          : "1px solid transparent",
        background: scrolled ? "rgba(251, 247, 241, 0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
        boxShadow: scrolled
          ? "0 1px 32px rgba(86, 47, 24, 0.1)"
          : "none",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ── Logo ── */}
        <Link href={apexHref("/")} className="group flex items-center gap-2">
          <BrandLogo
            size="md"
            withWordmark
            wordmarkClassName="text-[1.2rem]"
            wordmarkStyle={{
              color: lightOverlay ? "#fbf7f1" : "var(--text)",
              letterSpacing: "-0.03em",
            }}
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </Link>

        {/* ── Desktop Nav ── */}
        <nav
          className="hidden items-center lg:flex"
          style={{
            background: "#ffffff",
            border: "0.5px solid var(--border)",
            borderRadius: "9999px",
            padding: "4px 6px",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            gap: "2px",
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={apexHref(link.href)}
                className="relative flex items-center transition-colors"
                style={{
                  color: isActive ? "var(--text)" : "var(--text-secondary)",
                  borderRadius: "9999px",
                  padding: "6px 16px",
                  fontSize: "0.8125rem",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  background: isActive ? "rgba(107, 63, 29, 0.08)" : "transparent",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text)";
                    (e.currentTarget as HTMLAnchorElement).style.background =
                      "rgba(107, 63, 29, 0.06)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                {link.label}
                {/* Signature warm glow indicator */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      bottom: "2px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "20px",
                      height: "2px",
                      background: "var(--gradient-warm)",
                      borderRadius: "9999px",
                      boxShadow: "var(--glow-gold)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right side (lg+; tablet/mobile use the hamburger menu) ── */}
        <div className="hidden items-center gap-2 lg:flex">
            {isAuthenticated && isTraveler && (
              <Button
                variant="ghost"
                size="icon"
                style={{
                  color: "#000000",
                  transition: "all 0.2s ease",
                }}
                className="hover:!text-[#333333] hover:!bg-[rgba(0,0,0,0.06)]"
                asChild
              >
                <Link href={apexHref("/wishlist")}>
                  <Heart className="h-4 w-4" />
                </Link>
              </Button>
            )}

            {isAuthenticated ? (
              <>
                <div
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(107,63,29,0.12), rgba(196,134,76,0.1))",
                    border: "0.5px solid var(--border-strong)",
                    color: "#000000",
                    borderRadius: "0",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.boxShadow = "var(--glow-gold)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLDivElement).style.boxShadow = "none")
                  }
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name.split(" ")[0]}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  style={{ color: "#000000", transition: "all 0.2s ease" }}
                  className="hover:!text-[#333333] hover:!bg-[rgba(0,0,0,0.06)]"
                  onClick={logout}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  title="Sign up as a traveler"
                  style={{
                    background: "transparent",
                    color: lightOverlay ? "#fbf7f1" : "#000000",
                    border: lightOverlay
                      ? "0.5px solid rgba(251,247,241,0.45)"
                      : "0.5px solid var(--border-strong)",
                    borderRadius: "0",
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    letterSpacing: "0.01em",
                  }}
                  asChild
                >
                  <Link
                    href={apexHref(
                      `/login?mode=signup&redirect=${encodeURIComponent(pathname === "/organizer" ? "/" : pathname)}`
                    )}
                  >
                    Traveler
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  title="Sign up as an organizer"
                  style={{
                    background: "var(--gradient-teal)",
                    color: "#fbf7f1",
                    border: "none",
                    borderRadius: "0",
                    fontWeight: 600,
                    boxShadow: "var(--glow-teal)",
                    fontSize: "0.8125rem",
                    letterSpacing: "0.01em",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.opacity = "0.9";
                    el.style.boxShadow = "var(--glow-teal-strong)";
                    el.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.opacity = "1";
                    el.style.boxShadow = "var(--glow-teal)";
                    el.style.transform = "translateY(0)";
                  }}
                  asChild
                >
                  <Link
                    href={apexHref(
                      `/organizer/login?mode=signup&redirect=${encodeURIComponent("/organizer/onboarding")}`
                    )}
                  >
                    Organizer
                  </Link>
                </Button>
              </>
            )}
        </div>

        {/* ── Mobile / tablet hamburger (below lg) ── */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          style={{
            color: lightOverlay ? "#fbf7f1" : "#000000",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = lightOverlay ? "#ffffff" : "#333333";
            el.style.background = lightOverlay
              ? "rgba(251, 247, 241, 0.12)"
              : "rgba(0, 0, 0, 0.06)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = lightOverlay ? "#fbf7f1" : "#000000";
            el.style.background = "transparent";
          }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* ── Mobile / tablet dropdown ── */}
      {mobileOpen && (
        <div
          className="px-4 py-4 space-y-1 lg:hidden"
          style={{
            background: "rgba(251, 247, 241, 0.98)",
            backdropFilter: "blur(24px) saturate(160%)",
            WebkitBackdropFilter: "blur(24px) saturate(160%)",
            borderTop: "0.5px solid var(--border)",
            boxShadow: "0 20px 50px rgba(86, 47, 24, 0.18)",
          }}
        >
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={apexHref(link.href)}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2.5 text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                  background: isActive ? "rgba(107, 63, 29, 0.1)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}

          <Separator />

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-none px-3 py-2.5 text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <>
              <Link
                href={apexHref(
                  `/login?mode=signup&redirect=${encodeURIComponent(pathname === "/organizer" ? "/" : pathname)}`
                )}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2.5 text-sm font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
                title="Sign up as a traveler"
              >
                Traveler
              </Link>
              <Link
                href={apexHref(
                  `/organizer/login?mode=signup&redirect=${encodeURIComponent("/organizer/onboarding")}`
                )}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-none px-3 py-2.5 text-sm font-medium transition-colors"
                style={{ color: "var(--primary)", fontWeight: 500 }}
                title="Sign up as an organizer"
              >
                Organizer
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

function Separator() {
  return (
    <div
      className="my-2 h-px"
      style={{ background: "var(--border)" }}
    />
  );
}