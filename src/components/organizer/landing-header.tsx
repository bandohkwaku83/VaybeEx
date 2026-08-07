"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function OrganizerLandingHeader() {
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        scrolled
          ? "bg-[var(--bg)]/90 backdrop-blur-xl border-[var(--border)]"
          : "bg-transparent border-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/organizer" className="group flex items-center gap-2.5">
          <BrandLogo
            size="md"
            withWordmark
            wordmarkClassName="text-lg"
            wordmarkStyle={{
              color: scrolled ? "var(--text)" : "#fbf7f1",
            }}
            subline="For Organizers"
            sublineStyle={{
              color: scrolled ? "var(--text-tertiary)" : "rgba(251,247,241,0.7)",
            }}
          />
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Back to traveller site */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className={cn(
              "transition-colors duration-300",
              scrolled
                ? "text-[var(--text-secondary)] hover:text-[var(--text)] hover:bg-[var(--primary-dim)]"
                : "text-[rgba(251,247,241,0.9)] hover:text-[#fbf7f1] hover:bg-[rgba(251,247,241,0.12)]"
            )}
          >
            <Link href="/">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Traveler site</span>
            </Link>
          </Button>

          {!isAuthenticated && (
            <>
              {/* Sign in — outline flips to white-on-transparent at top of hero */}
              <Button
                variant="outline"
                size="sm"
                asChild
                className={cn(
                  "transition-colors duration-300",
                  scrolled
                    ? "border-[var(--border-strong)] text-[var(--primary)] hover:bg-[var(--primary-dim)] hover:border-[var(--primary)]"
                    : "border-[rgba(251,247,241,0.4)] text-[#fbf7f1] hover:bg-[rgba(251,247,241,0.12)] hover:border-[rgba(251,247,241,0.7)]"
                )}
              >
                <Link href="/organizer/login">Sign in</Link>
              </Button>

              {/* Create account — solid brand gradient, always visible */}
              <Button
                size="sm"
                asChild
                className="text-[#fbf7f1] border-0 shadow-[var(--glow-gold)] hover:shadow-[var(--glow-teal)] transition-shadow duration-200"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Link href="/organizer/login?mode=signup&redirect=/organizer/onboarding">
                  Create account
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}