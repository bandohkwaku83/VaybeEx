"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Heart, LogIn, LogOut, Menu, Phone, Search, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const publicNavLinks = [
  { href: "/", label: "Explore" },
  { href: "/organizer", label: "Become an Organizer" },
];

const authNavLinks = [
  { href: "/dashboard", label: "My Trips" },
  { href: "/wishlist", label: "Wishlist" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const navLinks = isAuthenticated
    ? [...publicNavLinks, ...authNavLinks]
    : publicNavLinks;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isOrganizer = pathname.startsWith("/organizer");
  const isHome = pathname === "/";
  const overlay = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (isOrganizer) return null;

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
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className="flex h-9 w-9 items-center justify-center text-white"
            style={{
              background: "var(--gradient-teal)",
              borderRadius: "10px",
              boxShadow: "var(--glow-teal)",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--glow-teal-strong)";
              (e.currentTarget as HTMLDivElement).style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "var(--glow-teal)";
              (e.currentTarget as HTMLDivElement).style.transform = "scale(1)";
            }}
          >
            <Compass className="h-5 w-5" />
          </div>
          <span
            className="font-display"
            style={{
              color: "var(--text)",
              fontWeight: 700,
              letterSpacing: "-0.03em",
              fontSize: "1.2rem",
            }}
          >
            Vaybe
            <span
              style={{
                background: "var(--gradient-warm)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Ex
            </span>
          </span>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav
          className="hidden items-center lg:flex"
          style={{
            background: "var(--surface-raised)",
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
                href={link.href}
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

        {/* ── Right side ── */}
        <div className="hidden items-center md:flex">
          {overlay && (
            <>
              <div
                className="flex items-center gap-1 px-4"
                style={{
                  borderRight: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.color = "var(--primary)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.color = "var(--text-secondary)")
                }
              >
                <Search className="h-4 w-4" />
              </div>
              <div
                className="flex items-center gap-2 px-4"
                style={{
                  borderRight: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                  fontSize: "0.8rem",
                  letterSpacing: "0.02em",
                }}
              >
                <Phone className="h-3.5 w-3.5" style={{ color: "var(--primary)" }} />
                <span className="hidden lg:inline">+233 20 123 4567</span>
              </div>
            </>
          )}

          <div className={cn("flex items-center gap-2", overlay && "pl-4")}>
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                style={{
                  color: "var(--text-secondary)",
                  transition: "all 0.2s ease",
                }}
                className="hover:!text-[var(--coral)] hover:!bg-[rgba(181,82,58,0.1)]"
                asChild
              >
                <Link href="/wishlist">
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
                    color: "var(--text)",
                    borderRadius: "9999px",
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
                  style={{ color: "var(--text-secondary)", transition: "all 0.2s ease" }}
                  className="hover:!text-[var(--text)] hover:!bg-[rgba(107,63,29,0.06)]"
                  onClick={logout}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="outline"
                style={{
                  background: "var(--gradient-teal)",
                  color: "#fbf7f1",
                  border: "none",
                  borderRadius: "9999px",
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
                onMouseDown={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.transform = "scale(0.97)")
                }
                onMouseUp={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)")
                }
                asChild
              >
                <Link href={`/login?redirect=${encodeURIComponent(pathname)}`}>
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign in</span>
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* ── Mobile hamburger ── */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          style={{
            color: "var(--text-secondary)",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = "var(--primary)";
            el.style.background = "rgba(107, 63, 29, 0.08)";
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.color = "var(--text-secondary)";
            el.style.background = "transparent";
          }}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* ── Mobile dropdown ── */}
      {mobileOpen && (
        <div
          className="px-4 py-4 space-y-1 md:hidden"
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
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors"
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
              className="flex w-full items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors"
              style={{ color: "var(--text-secondary)" }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors"
              style={{ color: "var(--primary)", fontWeight: 500 }}
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
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