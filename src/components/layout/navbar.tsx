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
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        overlay
          ? "border-b border-white/10 bg-transparent"
          : "border-b border-stone-200/80 bg-white/90 backdrop-blur-xl shadow-sm"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm transition-colors",
              overlay ? "bg-white/15 backdrop-blur-sm group-hover:bg-white/25" : "bg-teal-600 group-hover:bg-teal-700"
            )}
          >
            <Compass className="h-5 w-5" />
          </div>
          <span
            className={cn(
              "text-xl font-bold tracking-tight transition-colors",
              overlay ? "text-white" : "text-stone-900"
            )}
          >
            Vaybe<span className={overlay ? "text-teal-300" : "text-teal-600"}>Ex</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                overlay
                  ? pathname === link.href
                    ? "bg-white/15 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                  : pathname === link.href
                    ? "bg-teal-50 text-teal-700"
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center md:flex">
          {overlay && (
            <>
              <div className="flex items-center gap-1 border-r border-white/15 px-4 text-sm text-white/80">
                <Search className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-2 border-r border-white/15 px-4 text-sm text-white/90">
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">+233 20 123 4567</span>
              </div>
            </>
          )}
          <div className={cn("flex items-center gap-2", overlay && "pl-4")}>
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className={overlay ? "text-white hover:bg-white/10 hover:text-white" : ""}
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
                  className={cn(
                    buttonVariants({ size: "sm", variant: overlay ? "outline" : "default" }),
                    overlay
                      ? "border-white/30 bg-white/10 text-white hover:bg-white/10 hover:text-white"
                      : "hover:bg-teal-600"
                  )}
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">{user?.name.split(" ")[0]}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className={overlay ? "text-white hover:bg-white/10 hover:text-white" : ""}
                  onClick={logout}
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant={overlay ? "outline" : "default"}
                className={
                  overlay
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                    : ""
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

        <Button
          variant="ghost"
          size="icon"
          className={cn("md:hidden", overlay && "text-white hover:bg-white/10")}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {mobileOpen && (
        <div
          className={cn(
            "border-t px-4 py-4 space-y-2 md:hidden",
            overlay ? "border-white/10 bg-[#1e3636]/95 backdrop-blur-xl" : "border-stone-200 bg-white"
          )}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                overlay
                  ? pathname === link.href
                    ? "bg-white/15 text-white"
                    : "text-white/80"
                  : pathname === link.href
                    ? "bg-teal-50 text-teal-700"
                    : "text-stone-600"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Separator overlay={overlay} />
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                logout();
                setMobileOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                overlay ? "text-white/80" : "text-stone-600"
              )}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          ) : (
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                overlay ? "text-white/80" : "text-stone-600"
              )}
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

function Separator({ overlay }: { overlay: boolean }) {
  return <div className={cn("h-px my-2", overlay ? "bg-white/15" : "bg-stone-200")} />;
}
